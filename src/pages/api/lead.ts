import type { APIRoute } from 'astro';
import { submitInquiry } from '../../lib/tokko';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.phone) {
      return new Response(JSON.stringify({ error: 'Por favor complete todos los campos obligatorios (nombre, email y teléfono).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
