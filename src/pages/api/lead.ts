import type { APIRoute } from 'astro';
import { submitInquiry } from '../../lib/tokko';

// In-memory rate limiting map: IP -> array of timestamps
const ipRequestsMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 4; // Máximo 4 envíos por IP cada 15 min

/**
 * Detecta si una cadena de texto es gibberish / basura generada por bots.
 */
function isGibberishText(str: string): boolean {
  if (!str || str.trim().length === 0) return false;
  
  const clean = str.trim().toLowerCase();
  
  // Extraer palabras individuales de 4+ caracteres
  const words = clean.split(/\s+/).filter(w => w.length >= 4);

  for (const word of words) {
    // 1. Contar vocales (incluyendo acentuadas)
    const vowelMatches = word.match(/[aeiouáéíóúü]/gi);
    const vowelCount = vowelMatches ? vowelMatches.length : 0;
    const vowelRatio = vowelCount / word.length;

    // Si la palabra tiene 7+ caracteres y menos del 18% de vocales (ej: "szxveherrgsqxsanx")
    if (word.length >= 7 && vowelRatio < 0.18) {
      return true;
    }

    // 2. Detectar 5 o más consonantes consecutivas (ej: "rgsqxs", "wxnmtwp", "cznkxnn")
    // Se excluyen vocales a,e,i,o,u,y,á,é,í,ó,ú,ü y caracteres no alfabéticos
    const consonantsOnly = word.replace(/[^a-zñáéíóúü]/gi, '');
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(consonantsOnly)) {
      return true;
    }
  }

  return false;
}

/**
 * Detecta correos con patrones de spam (ej: cuentas Gmail con exceso arbitrario de puntos)
 */
function isSpamEmailPattern(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  
  const [localPart, domain] = email.toLowerCase().split('@');
  if (!localPart || !domain) return false;

  // Gmail ignora los puntos, por lo que los bots crean correos tipo "u.q.ey.u.zu.h.ab92.7@gmail.com"
  if (domain.includes('gmail.com')) {
    const dotCount = (localPart.match(/\./g) || []).length;
    if (dotCount >= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Limpia las solicitudes viejas del mapa de Rate Limiting
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestsMap.get(ip) || [];
  
  // Filtrar solo timestamps dentro de la ventana de 15 minutos
  const validTimestamps = timestamps.filter(ts => (now - ts) < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestsMap.set(ip, validTimestamps);
    return false; // Límite superado
  }

  validTimestamps.push(now);
  ipRequestsMap.set(ip, validTimestamps);
  return true; // Permitido
}

/**
 * Verifica el token de Google reCAPTCHA con los servidores de Google
 */
async function verifyGoogleRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await res.json();
    // Para reCAPTCHA v3, data.score suele ser entre 0.0 y 1.0 (0.5+ es humano)
    if (!data.success) return false;
    if (typeof data.score === 'number' && data.score < 0.5) return false;
    return true;
  } catch (err) {
    console.error('Error al verificar reCAPTCHA con Google:', err);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // 1. HONEYPOT CHECK: Si el campo invisible 'website' tiene algún valor, es un bot
    if (data.website && String(data.website).trim() !== '') {
      console.warn('[Anti-Bot] Intento de bot bloqueado por Honeypot.');
      // Retornamos éxito simulado (Fake 200) para engañar al bot y evitar reintentos
      return new Response(JSON.stringify({ success: true, message: 'Consulta enviada.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. TIME-LOCK CHECK: Si el formulario se envió en menos de 2.5 segundos
    const formLoadedAt = Number(data.form_loaded_at || data.formLoadedAt);
    if (formLoadedAt && !isNaN(formLoadedAt)) {
      const timeElapsed = Date.now() - formLoadedAt;
      if (timeElapsed < 2500) {
        console.warn(`[Anti-Bot] Formulario enviado demasiado rápido (${timeElapsed}ms). Bloqueado.`);
        return new Response(JSON.stringify({ error: 'Envío bloqueado por seguridad. Por favor intente nuevamente.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. RATE LIMITING POR IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown-ip';
    
    if (clientIp !== 'unknown-ip' && !checkRateLimit(clientIp)) {
      console.warn(`[Anti-Bot] Rate limit superado para la IP: ${clientIp}`);
      return new Response(JSON.stringify({ error: 'Ha superado el límite de consultas permitidas. Por favor intente más tarde.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!data.name || !data.email || !data.phone) {
      return new Response(JSON.stringify({ error: 'Por favor complete todos los campos obligatorios (nombre, email y teléfono).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. FILTRO HEURÍSTICO (Anti-Gibberish & Spam Patterns)
    if (isGibberishText(data.name)) {
      console.warn(`[Anti-Bot] Nombre rechazado por texto aleatorio: ${data.name}`);
      return new Response(JSON.stringify({ error: 'El nombre ingresado no parece válido. Por favor verifique.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (isSpamEmailPattern(data.email)) {
      console.warn(`[Anti-Bot] Email rechazado por patrón de spam: ${data.email}`);
      return new Response(JSON.stringify({ error: 'El correo electrónico ingresado no es válido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (data.text && isGibberishText(data.text)) {
      console.warn(`[Anti-Bot] Mensaje rechazado por texto aleatorio: ${data.text}`);
      return new Response(JSON.stringify({ error: 'El mensaje ingresado contiene caracteres no válidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. GOOGLE reCAPTCHA (Opción C)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!data.recaptchaToken) {
        return new Response(JSON.stringify({ error: 'Verificación de seguridad reCAPTCHA requerida.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const isHuman = await verifyGoogleRecaptcha(data.recaptchaToken, recaptchaSecret);
      if (!isHuman) {
        console.warn('[Anti-Bot] Verificación reCAPTCHA de Google falló.');
        return new Response(JSON.stringify({ error: 'La verificación de seguridad reCAPTCHA falló. Por favor intente nuevamente.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 7. ENVÍO A TOKKO BROKER CRM
    const result = await submitInquiry({
      name: data.name,
      email: data.email,
      phone: data.phone,
      text: data.text || 'Consulta general desde la web de MUV Propiedades.',
      propertyId: data.propertyId ? Number(data.propertyId) : undefined
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

