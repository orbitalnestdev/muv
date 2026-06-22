require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const TOKKO_API_KEY = process.env.TOKKO_API_KEY;

app.use(compression());
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend con caché de 1 año y ETags
app.use(express.static(__dirname, {
  maxAge: '1y',
  etag: true
}));

// Caché en memoria simple
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function getCachedData(key) {
  const cached = cache[key];
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache[key] = {
    timestamp: Date.now(),
    data: data
  };
}

// Datos simulados (Mock Fallback)
const mockProperties = [
  {
    id: 1001,
    reference_code: "MUV1001",
    publication_title: "Cabildo Boulevard. 3 amb con balcón",
    description: "Excelente departamento de 3 ambientes al frente con balcón corrido. Gran living comedor, cocina integrada con barra desayunadora, dos dormitorios (principal en suite con vestidor) y segundo baño completo. Detalles de categoría y excelente iluminación natural en pleno Belgrano.",
    address: "Av. Cabildo 2500",
    bathroom_amount: 3,
    room_amount: 3,
    suite_amount: 2,
    surface: "72",
    total_surface: "72",
    covered_surface: "65",
    is_starred_on_web: true,
    type: { id: 2, name: "Departamento" },
    development: { id: 201, name: "DOME Suites" },
    operations: [{
      operation_type: "Venta",
      operation_id: 1,
      prices: [{ currency: "USD", price: 271103 }]
    }],
    location: { id: 24682, name: "Belgrano", full_location: "Argentina | Capital Federal | Belgrano" },
    photos: [
      { image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg", thumb: "https://static.tokkobroker.com/thumbs/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138_thumb.jpg" }
    ],
    tags: [{ name: "Piscina" }, { name: "Gimnasio" }, { name: "Balcón" }, { name: "Suite" }]
  },
  {
    id: 1002,
    reference_code: "MUV1002",
    publication_title: "Cabildo al 2500. Monoambiente Premium",
    description: "Monoambiente de gran categoría apto profesional. Cocina moderna completa, baño de diseño y balcón. Ideal para inversores o vivienda en una ubicación inmejorable de Colegiales, cerca de todos los medios de transporte.",
    address: "Av. Cabildo 2500",
    bathroom_amount: 1,
    room_amount: 1,
    suite_amount: 1,
    surface: "39",
    total_surface: "39",
    covered_surface: "35",
    is_starred_on_web: true,
    type: { id: 2, name: "Departamento" },
    development: { id: 201, name: "DOME Suites" },
    operations: [{
      operation_type: "Venta",
      operation_id: 1,
      prices: [{ currency: "USD", price: 178985 }]
    }],
    location: { id: 24709, name: "Colegiales", full_location: "Argentina | Capital Federal | Colegiales" },
    photos: [
      { image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg", thumb: "https://static.tokkobroker.com/thumbs/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138_thumb.jpg" }
    ],
    tags: [{ name: "Apto Profesional" }, { name: "Luminoso" }, { name: "Balcón" }]
  },
  {
    id: 1003,
    reference_code: "MUV1003",
    publication_title: "Av. Libertador al 7000. Piso Exclusivo",
    description: "Piso de 4 ambientes exclusivo con vista al río en Palermo Chico. Palier privado, master suite con jacuzzi y vestidor, otros dos dormitorios en suite. Enorme living comedor con salida a balcón aterrazado. Cocina gourmet con comedor diario, dependencia de servicio, cochera doble. Amenities premium en el edificio.",
    address: "Av. del Libertador 7000",
    bathroom_amount: 4,
    room_amount: 5,
    suite_amount: 3,
    surface: "200",
    total_surface: "200",
    covered_surface: "185",
    is_starred_on_web: true,
    type: { id: 2, name: "Departamento" },
    operations: [{
      operation_type: "Venta",
      operation_id: 1,
      prices: [{ currency: "USD", price: 1690000 }]
    }],
    location: { id: 24728, name: "Palermo Chico", full_location: "Argentina | Capital Federal | Palermo | Palermo Chico" },
    photos: [
      { image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg", thumb: "https://static.tokkobroker.com/thumbs/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138_thumb.jpg" }
    ],
    tags: [{ name: "Piscina" }, { name: "Seguridad 24hs" }, { name: "Vista al Río" }, { name: "Cochera Doble" }]
  },
  {
    id: 1004,
    reference_code: "MUV1004",
    publication_title: "Exclusiva Residencia en Recoleta",
    description: "Hermosa casa de estilo clásico francés totalmente reciclada a nuevo. Ubicada en la zona más prestigiosa de Recoleta. Cuenta con ascensor propio, 4 dormitorios en suite, escritorio, amplio jardín interno con fuentes de agua y quincho cubierto.",
    address: "Virrey del Pino 2400",
    bathroom_amount: 5,
    room_amount: 7,
    suite_amount: 4,
    surface: "450",
    total_surface: "450",
    covered_surface: "400",
    is_starred_on_web: true,
    type: { id: 3, name: "Casa" },
    operations: [{
      operation_type: "Venta",
      operation_id: 1,
      prices: [{ currency: "USD", price: 1250000 }]
    }],
    location: { id: 24681, name: "Recoleta", full_location: "Argentina | Capital Federal | Recoleta" },
    photos: [
      { image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg", thumb: "https://static.tokkobroker.com/thumbs/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138_thumb.jpg" }
    ],
    tags: [{ name: "Jardín" }, { name: "Estilo Clásico" }, { name: "Seguridad" }, { name: "Ascensor" }]
  },
  {
    id: 1005,
    reference_code: "MUV1005",
    publication_title: "Local Comercial Premium en Recoleta",
    description: "Excelente local comercial de 120m² cubiertos en la mejor cuadra comercial. Planta libre sin columnas, doble altura, sótano y depósito. Vidriera de triple frente con vidrios de seguridad.",
    address: "Florida 500",
    bathroom_amount: 2,
    room_amount: 2,
    suite_amount: 0,
    surface: "120",
    total_surface: "120",
    covered_surface: "120",
    is_starred_on_web: false,
    type: { id: 7, name: "Local" },
    operations: [{
      operation_type: "Alquiler",
      operation_id: 2,
      prices: [{ currency: "USD", price: 3500 }]
    }],
    location: { id: 24681, name: "Recoleta", full_location: "Argentina | Capital Federal | Recoleta" },
    photos: [
      { image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg", thumb: "https://static.tokkobroker.com/thumbs/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138_thumb.jpg" }
    ],
    tags: [{ name: "Vidriera" }, { name: "Planta Libre" }, { name: "Excelente Ubicación" }]
  }
];

const mockDevelopments = [
  {
    id: 201,
    name: "DOME Suites",
    description: "Emprendimiento premium residencial y de oficinas temporales de alta gama en pleno centro porteño. Unidades de 1 y 2 ambientes con terminaciones de primer nivel y amenities excepcionales.",
    construction_status: "En Construcción",
    location: { name: "Recoleta", full_location: "Argentina | Capital Federal | Recoleta" },
    photos: [{ image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg" }]
  },
  {
    id: 202,
    name: "Helix Residencial",
    description: "Desarrollo residencial innovador de diseño helicoidal con jardines colgantes verticales y eficiencia energética autosustentable.",
    construction_status: "En Construcción",
    location: { name: "Palermo Chico", full_location: "Argentina | Capital Federal | Palermo | Palermo Chico" },
    photos: [{ image: "https://static.tokkobroker.com/w_pics/6806561_27551957937010636039096706013736128573379067213911970307667362385865548524138.jpg" }]
  }
];

// Helper para llamadas a Tokko
async function fetchTokko(url, params = {}) {
  if (!TOKKO_API_KEY) {
    throw new Error('API_KEY_MISSING');
  }
  
  const response = await axios.get(url, {
    params: {
      key: TOKKO_API_KEY,
      format: 'json',
      lang: 'es_ar',
      ...params
    }
  });
  return response.data;
}

// Middleware de seguridad para validar la API Key en backend
const checkApiKey = (req, res, next) => {
  if (!TOKKO_API_KEY) {
    console.warn("ADVERTENCIA: TOKKO_API_KEY no configurada. Usando modo simulación (mock).");
  }
  next();
};

// Endpoints de API Proxy
app.get('/api/properties', checkApiKey, async (req, res) => {
  const cacheKey = `properties_${JSON.stringify(req.query)}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Parsear filtros
  const { 
    operation_id, 
    property_type_id, 
    location_id, 
    price_min, 
    price_max, 
    rooms, 
    bedrooms, 
    bathroom_amount,
    parking_lot_amount,
    surface_min,
    surface_max,
    order_by,
    order,
    limit = 9, 
    offset = 0, 
    development_id 
  } = req.query;

  if (!TOKKO_API_KEY) {
    // Filtrar mock properties localmente
    let filtered = [...mockProperties];

    // Exclude development units by default, unless searching for a specific development's units
    if (!development_id) {
      filtered = filtered.filter(p => !p.development);
    }

    if (operation_id) {
      filtered = filtered.filter(p => p.operations.some(op => op.operation_id == operation_id));
    }
    if (property_type_id) {
      filtered = filtered.filter(p => p.type.id == property_type_id);
    }
    if (location_id) {
      filtered = filtered.filter(p => p.location.id == location_id);
    }
    if (development_id) {
      filtered = filtered.filter(p => p.development && p.development.id == development_id);
    }
    if (price_min) {
      filtered = filtered.filter(p => p.operations.some(op => op.prices.some(pr => pr.price >= price_min)));
    }
    if (price_max) {
      filtered = filtered.filter(p => p.operations.some(op => op.prices.some(pr => pr.price <= price_max)));
    }
    if (rooms) {
      filtered = filtered.filter(p => p.room_amount == rooms);
    }
    if (bedrooms) {
      filtered = filtered.filter(p => p.suite_amount == bedrooms);
    }
    if (bathroom_amount) {
      filtered = filtered.filter(p => p.bathroom_amount >= bathroom_amount);
    }
    if (parking_lot_amount) {
      filtered = filtered.filter(p => (p.parking_lot_amount || 0) >= parking_lot_amount);
    }
    if (surface_min) {
      filtered = filtered.filter(p => parseFloat(p.total_surface || p.covered_surface || p.surface || 0) >= parseFloat(surface_min));
    }
    if (surface_max) {
      filtered = filtered.filter(p => parseFloat(p.total_surface || p.covered_surface || p.surface || 0) <= parseFloat(surface_max));
    }

    // Ordenamiento simulado
    if (order_by === 'price') {
      filtered.sort((a, b) => {
        const pA = a.operations[0]?.prices[0]?.price || 0;
        const pB = b.operations[0]?.prices[0]?.price || 0;
        return order === 'desc' ? pB - pA : pA - pB;
      });
    } else {
      // Orden por ID / más reciente por defecto
      filtered.sort((a, b) => b.id - a.id);
    }
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    const response = {
      meta: { limit: parseInt(limit), offset: parseInt(offset), total_count: filtered.length },
      objects: paginated
    };
    return res.json(response);
  }

  try {
    const searchData = {
      current_localization_id: location_id ? parseInt(location_id) : 0,
      current_localization_type: location_id ? "division" : "country",
      price_from: price_min ? parseInt(price_min) : 0,
      price_to: price_max ? parseInt(price_max) : 99999999,
      operation_types: operation_id ? [parseInt(operation_id)] : [],
      property_types: property_type_id ? [parseInt(property_type_id)] : [],
      filters: []
    };

    if (development_id) {
      searchData.development_id = parseInt(development_id);
    } else {
      // Exclude development units
      searchData.filters.push(["development__id", "isnull", true]);
    }

    if (rooms) {
      searchData.filters.push(["room_amount", "=", parseInt(rooms)]);
    }
    if (bedrooms) {
      searchData.filters.push(["suite_amount", "=", parseInt(bedrooms)]);
    }
    if (bathroom_amount) {
      searchData.filters.push(["bathroom_amount", ">=", parseInt(bathroom_amount)]);
    }
    if (parking_lot_amount) {
      searchData.filters.push(["parking_lot_amount", ">=", parseInt(parking_lot_amount)]);
    }
    if (surface_min) {
      searchData.filters.push(["total_surface", ">=", parseInt(surface_min)]);
    }
    if (surface_max) {
      searchData.filters.push(["total_surface", "<=", parseInt(surface_max)]);
    }

    if (order_by) {
      searchData.order_by = order_by;
    }
    if (order) {
      searchData.order = order;
    }

    const data = await fetchTokko('https://www.tokkobroker.com/api/v1/property/search/', {
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: JSON.stringify(searchData)
    });

    if (!development_id && data && data.objects) {
      data.objects = data.objects.filter(p => !p.development);
    }

    setCachedData(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("Error al buscar propiedades en Tokko:", error.message);
    res.status(500).json({ error: "No se pudieron obtener las propiedades de Tokko Broker." });
  }
});

app.get('/api/properties/:id', checkApiKey, async (req, res) => {
  const propertyId = req.params.id;
  const cacheKey = `property_${propertyId}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!TOKKO_API_KEY || mockProperties.some(p => p.id == propertyId)) {
    const property = mockProperties.find(p => p.id == propertyId) || mockProperties[0];
    return res.json(property);
  }

  try {
    const data = await fetchTokko(`https://www.tokkobroker.com/api/v1/property/${propertyId}/`);
    setCachedData(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error(`Error al obtener propiedad ${propertyId} de Tokko:`, error.message);
    res.status(500).json({ error: "No se pudo obtener el detalle de la propiedad." });
  }
});

app.get('/api/developments', checkApiKey, async (req, res) => {
  const cacheKey = 'developments_all';
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!TOKKO_API_KEY) {
    return res.json({
      meta: { total_count: mockDevelopments.length },
      objects: mockDevelopments
    });
  }

  try {
    const data = await fetchTokko('https://www.tokkobroker.com/api/v1/development/');
    setCachedData(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener emprendimientos de Tokko:", error.message);
    res.status(500).json({ error: "No se pudieron obtener los emprendimientos." });
  }
});

app.get('/api/developments/:id', checkApiKey, async (req, res) => {
  const devId = req.params.id;
  const cacheKey = `development_${devId}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!TOKKO_API_KEY || mockDevelopments.some(d => d.id == devId)) {
    const dev = mockDevelopments.find(d => d.id == devId) || mockDevelopments[0];
    return res.json(dev);
  }

  try {
    const data = await fetchTokko(`https://www.tokkobroker.com/api/v1/development/${devId}/`);
    setCachedData(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error(`Error al obtener emprendimiento ${devId} de Tokko:`, error.message);
    res.status(500).json({ error: "No se pudo obtener el detalle del emprendimiento." });
  }
});

app.get('/api/locations', checkApiKey, async (req, res) => {
  const query = req.query.q || '';
  if (!TOKKO_API_KEY) {
    const filtered = [
      { id: 24681, name: "Recoleta" },
      { id: 24728, name: "Palermo" },
      { id: 24682, name: "Belgrano" },
      { id: 24709, name: "Colegiales" }
    ].filter(l => l.name.toLowerCase().includes(query.toLowerCase()));
    return res.json({ objects: filtered });
  }

  try {
    const data = await fetchTokko('https://www.tokkobroker.com/api/v1/location/quicksearch/', { q: query });
    res.json(data);
  } catch (error) {
    console.error("Error al buscar ubicaciones en Tokko:", error.message);
    res.json({ objects: [] });
  }
});

// Rutas dinámicas para servir los archivos HTML dinámicos
app.get('/property/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'detalle_propiedad.html'));
});

app.get('/emprendimiento/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'detalle_emprendimiento.html'));
});

app.get('/properties', (req, res) => {
  res.sendFile(path.join(__dirname, 'buscar.html'));
});

app.get('/buscar', (req, res) => {
  res.sendFile(path.join(__dirname, 'buscar.html'));
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Servidor de MUV Propiedades corriendo en puerto ${PORT}`);
  console.log(` URL Local: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
