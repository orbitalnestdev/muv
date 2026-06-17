import axios from 'axios';

const TOKKO_API_KEY = import.meta.env.TOKKO_API_KEY || process.env.TOKKO_API_KEY || '';

// Interfaces
export interface Property {
  id: number;
  reference_code: string;
  publication_title: string;
  description: string;
  address: string;
  bathroom_amount: number;
  room_amount: number;
  suite_amount: number; // bedrooms
  surface: string;
  total_surface: string;
  covered_surface: string;
  parking_lot_amount: number;
  is_starred_on_web: boolean;
  type: { id: number; name: string };
  development?: { id: number; name: string };
  operations: Array<{
    operation_type: string;
    operation_id: number;
    prices: Array<{ currency: string; price: number }>;
  }>;
  location: { id: number; name: string; full_location: string };
  photos: Array<{ image: string; thumb: string }>;
  tags: Array<{ name: string }>;
  geo_lat?: string;
  geo_long?: string;
}

export interface Development {
  id: number;
  name: string;
  description: string;
  construction_status: string;
  location: { name: string; full_location: string };
  photos: Array<{ image: string }>;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  text: string;
  propertyId?: number;
}

// Fallback Mock Data
export const mockProperties: Property[] = [
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
    parking_lot_amount: 1,
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
    tags: [{ name: "Piscina" }, { name: "Gimnasio" }, { name: "Balcón" }, { name: "Suite" }],
    geo_lat: "-34.5620",
    geo_long: "-58.4560"
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
    parking_lot_amount: 0,
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
    tags: [{ name: "Apto Profesional" }, { name: "Luminoso" }, { name: "Balcón" }],
    geo_lat: "-34.5740",
    geo_long: "-58.4480"
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
    parking_lot_amount: 2,
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
    tags: [{ name: "Piscina" }, { name: "Seguridad 24hs" }, { name: "Vista al Río" }, { name: "Cochera Doble" }],
    geo_lat: "-34.5800",
    geo_long: "-58.4080"
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
    parking_lot_amount: 3,
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
    tags: [{ name: "Jardín" }, { name: "Estilo Clásico" }, { name: "Seguridad" }, { name: "Ascensor" }],
    geo_lat: "-34.5880",
    geo_long: "-58.3970"
  }
];

export const mockDevelopments: Development[] = [
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

// In-Memory volatile RAM Cache stores
let propertiesCatalog: Property[] = [];
let developmentsCatalog: Development[] = [];
let isInitialized = false;
let initialFetchPromise: Promise<void> | null = null;
let refreshInterval: NodeJS.Timeout | null = null;

// Helper query function for Tokko Broker REST API
async function fetchTokko(endpoint: string, params: any = {}) {
  if (!TOKKO_API_KEY) {
    throw new Error('API_KEY_MISSING');
  }
  const response = await axios.get(endpoint, {
    params: {
      key: TOKKO_API_KEY,
      format: 'json',
      lang: 'es_ar',
      ...params
    }
  });
  return response.data;
}

// Background scheduler
function startRefreshInterval() {
  if (refreshInterval) return;
  refreshInterval = setInterval(async () => {
    console.log("[Tokko RAM Store] Running background refresh...");
    try {
      await refreshCatalog();
      console.log(`[Tokko RAM Store] Refresh success! Total properties: ${propertiesCatalog.length}`);
    } catch (err: any) {
      console.error("[Tokko RAM Store] Background refresh failed. Preserving last good state.", err.message);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Thread-safe refresh catalog function
async function refreshCatalog() {
  if (!TOKKO_API_KEY) {
    console.warn("TOKKO_API_KEY is not defined. Falling back to mock data in memory.");
    propertiesCatalog = [...mockProperties];
    developmentsCatalog = [...mockDevelopments];
    startRefreshInterval();
    return;
  }

  // Fetch properties (~400 objects) paginated by 100
  let newProperties: Property[] = [];
  try {
    const limit = 100;
    let offset = 0;
    let fetchedAll = false;
    while (!fetchedAll) {
      const data = await fetchTokko('https://www.tokkobroker.com/api/v1/property/search/', {
        limit,
        offset,
        data: JSON.stringify({
          current_localization_id: 0,
          current_localization_type: "country",
          price_from: 0,
          price_to: 99999999,
          operation_types: [],
          property_types: [],
          filters: []
        })
      });
      if (data && data.objects && data.objects.length > 0) {
        newProperties = newProperties.concat(data.objects);
        offset += limit;
        if (newProperties.length >= data.meta.total_count || data.objects.length < limit) {
          fetchedAll = true;
        }
      } else {
        fetchedAll = true;
      }
    }
  } catch (err: any) {
    throw new Error(`Failed properties API fetch: ${err.message}`);
  }

  // Fetch developments
  let newDevelopments: Development[] = [];
  try {
    const limit = 100;
    let offset = 0;
    let fetchedAll = false;
    while (!fetchedAll) {
      const data = await fetchTokko('https://www.tokkobroker.com/api/v1/development/', {
        limit,
        offset
      });
      if (data && data.objects && data.objects.length > 0) {
        newDevelopments = newDevelopments.concat(data.objects);
        offset += limit;
        if (newDevelopments.length >= data.meta.total_count || data.objects.length < limit) {
          fetchedAll = true;
        }
      } else {
        fetchedAll = true;
      }
    }
  } catch (err: any) {
    throw new Error(`Failed developments API fetch: ${err.message}`);
  }

  // Swap to RAM store only if successful
  if (newProperties.length > 0) {
    propertiesCatalog = newProperties;
  }
  if (newDevelopments.length > 0) {
    developmentsCatalog = newDevelopments;
  }

  startRefreshInterval();
}

// Initial Boot Loader
export async function ensureCatalogLoaded(): Promise<void> {
  if (isInitialized) return;
  if (initialFetchPromise) return initialFetchPromise;

  initialFetchPromise = (async () => {
    console.log("[Tokko RAM Store] Initializing properties catalog...");
    try {
      await refreshCatalog();
      console.log(`[Tokko RAM Store] Initialization complete. Catalog contains ${propertiesCatalog.length} properties.`);
    } catch (err: any) {
      console.error("[Tokko RAM Store] Catalog initialization failed! Using Mock data as last resort.", err.message);
      propertiesCatalog = [...mockProperties];
      developmentsCatalog = [...mockDevelopments];
      startRefreshInterval();
    } finally {
      isInitialized = true;
    }
  })();

  return initialFetchPromise;
}

// Leads API CRM submission poster
export async function submitInquiry(payload: LeadPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!TOKKO_API_KEY) {
    console.warn("WARNING: TOKKO_API_KEY is missing. Lead simulated successfully.");
    return { success: true, data: { status: "simulated" } };
  }

  try {
    const response = await axios.post(
      'https://www.tokkobroker.com/api/v1/webcontact/',
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        text: payload.text,
        properties: payload.propertyId ? [payload.propertyId] : []
      },
      {
        params: {
          key: TOKKO_API_KEY,
          format: 'json'
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Tokko API Lead submission error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to submit inquiry to Tokko CRM."
    };
  }
}

// Compatibility alias
export async function createLead(payload: LeadPayload) {
  return submitInquiry(payload);
}

// Getters (in-memory filtering and sorting queries)
export async function getProperties(filters: any = {}): Promise<{ properties: Property[], total: number }> {
  await ensureCatalogLoaded();
  
  let result = [...propertiesCatalog];

  // Exclude units belonging to developments by default, unless searching for a specific development's units
  if (!filters.development_id) {
    result = result.filter(p => !p.development);
  }

  if (filters.q) {
    const query = filters.q.toLowerCase();
    result = result.filter(p => 
      (p.publication_title && p.publication_title.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter(p => p.location?.name?.toLowerCase().includes(loc));
  }

  if (filters.operation_id) {
    const opId = Number(filters.operation_id);
    result = result.filter(p => p.operations?.some(op => op.operation_id === opId));
  }

  if (filters.property_type_id) {
    const typeId = Number(filters.property_type_id);
    result = result.filter(p => p.type?.id === typeId);
  }

  if (filters.development_id) {
    const devId = Number(filters.development_id);
    result = result.filter(p => p.development?.id === devId);
  }

  if (filters.price_min) {
    const pMin = Number(filters.price_min);
    result = result.filter(p => p.operations?.some(op => op.prices?.some(pr => pr.price >= pMin)));
  }

  if (filters.price_max) {
    const pMax = Number(filters.price_max);
    result = result.filter(p => p.operations?.some(op => op.prices?.some(pr => pr.price <= pMax)));
  }

  if (filters.rooms) {
    const r = Number(filters.rooms);
    result = result.filter(p => p.room_amount === r || (r === 4 && (p.room_amount || 0) >= 4));
  }

  if (filters.bedrooms) {
    const b = Number(filters.bedrooms);
    result = result.filter(p => p.suite_amount === b);
  }

  if (filters.amenities) {
    const requestedAmenities = Array.isArray(filters.amenities)
      ? filters.amenities
      : filters.amenities.split(',').filter(Boolean);

    if (requestedAmenities.length > 0) {
      result = result.filter(p => {
        const propTags = (p.tags || []).map(t => t.name.toLowerCase());
        return requestedAmenities.every((amenity: string) => {
          const lowerAmenity = amenity.toLowerCase();
          if (lowerAmenity === 'pileta' || lowerAmenity === 'piscina') {
            return propTags.includes('pileta') || propTags.includes('piscina');
          }
          return propTags.some(tag => tag.includes(lowerAmenity));
        });
      });
    }
  }


  // Sorting
  if (filters.order_by === 'price') {
    result.sort((a, b) => {
      const priceA = a.operations?.[0]?.prices?.[0]?.price || 0;
      const priceB = b.operations?.[0]?.prices?.[0]?.price || 0;
      return filters.order === 'desc' ? priceB - priceA : priceA - priceB;
    });
  } else {
    // Default: Featured (is_starred_on_web) first, then ID desc
    result.sort((a, b) => {
      if (a.is_starred_on_web && !b.is_starred_on_web) return -1;
      if (!a.is_starred_on_web && b.is_starred_on_web) return 1;
      return b.id - a.id;
    });
  }

  return { properties: result, total: result.length };
}

export async function getPropertyById(id: number | string): Promise<Property | null> {
  await ensureCatalogLoaded();
  return propertiesCatalog.find(p => p.id === Number(id)) || null;
}

export async function getDevelopments(filters: any = {}): Promise<{ developments: Development[], total: number }> {
  await ensureCatalogLoaded();
  
  let result = [...developmentsCatalog];

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter(d => d.location?.name?.toLowerCase().includes(loc));
  }

  if (filters.status) {
    result = result.filter(d => d.construction_status === filters.status);
  }

  return { developments: result, total: result.length };
}

export async function getDevelopmentById(id: number | string): Promise<Development | null> {
  await ensureCatalogLoaded();
  return developmentsCatalog.find(d => d.id === Number(id)) || null;
}

export async function getPropertiesByDevelopmentId(devId: number | string): Promise<Property[]> {
  if (!TOKKO_API_KEY) {
    await ensureCatalogLoaded();
    return propertiesCatalog.filter(p => p.development && p.development.id === Number(devId));
  }

  try {
    const limit = 100;
    let offset = 0;
    let fetchedAll = false;
    let results: Property[] = [];
    
    while (!fetchedAll) {
      const response = await axios.get('https://www.tokkobroker.com/api/v1/property/', {
        params: {
          key: TOKKO_API_KEY,
          format: 'json',
          development__id: Number(devId),
          limit,
          offset
        }
      });
      
      const data = response.data;
      if (data && data.objects && data.objects.length > 0) {
        results = results.concat(data.objects);
        offset += limit;
        if (results.length >= data.meta.total_count || data.objects.length < limit) {
          fetchedAll = true;
        }
      } else {
        fetchedAll = true;
      }
    }
    return results;
  } catch (err: any) {
    console.error(`Error fetching properties for development ${devId}:`, err.message);
    await ensureCatalogLoaded();
    return propertiesCatalog.filter(p => p.development && p.development.id === Number(devId));
  }
}

