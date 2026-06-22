import type { APIRoute } from 'astro';
import { getProperties, getDevelopments } from '../lib/tokko';

export const GET: APIRoute = async () => {
  let properties: any[] = [];
  let developments: any[] = [];

  try {
    const propsRes = await getProperties({ limit: 100 });
    properties = propsRes.properties || [];
  } catch (e) {
    console.error("Error fetching properties for sitemap:", e);
  }

  try {
    const devsRes = await getDevelopments();
    developments = devsRes.developments || [];
  } catch (e) {
    console.error("Error fetching developments for sitemap:", e);
  }

  const domain = 'https://muvpropiedades.com';

  const staticPaths = [
    '',
    '/contacto/',
    '/quienes-somos/',
    '/tasaciones/',
    '/search-results/',
    '/emprendimientos/',
  ];

  const barrios = [
    'belgrano', 'palermo', 'palermo-hollywood', 'palermo-soho', 'palermo-chico',
    'palermo-nuevo', 'recoleta', 'puerto-madero', 'villa-urquiza', 'colegiales',
    'nunez', 'villa-crespo', 'flores', 'san-telmo', 'botanico', 'once', 'microcentro'
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static Paths
  for (const path of staticPaths) {
    xml += `  <url>\n    <loc>${domain}${path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${path === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  }

  // Neighborhood Landings
  for (const barrio of barrios) {
    xml += `  <url>\n    <loc>${domain}/city/${barrio}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Dynamic Properties
  for (const prop of properties) {
    if (prop.id) {
      xml += `  <url>\n    <loc>${domain}/property/${prop.id}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  // Dynamic Developments
  for (const dev of developments) {
    if (dev.id) {
      xml += `  <url>\n    <loc>${domain}/emprendimientos/${dev.id}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
