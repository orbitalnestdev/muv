import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TOKKO_API_KEY = (typeof process !== 'undefined' && process.env?.TOKKO_API_KEY) || (typeof import.meta !== 'undefined' && import.meta.env?.TOKKO_API_KEY) || '';

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
  roofed_surface?: string;
  real_address?: string;
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
  tags: Array<{ name: string; type?: number; id?: number }>;
  geo_lat?: string;
  geo_long?: string;
  toilet_amount?: number;
  age?: number;
  orientation?: string;
  expenses?: number;
  expenses_currency?: string;
  transaction_requirements?: string;
}

export interface Development {
  id: number;
  name: string;
  publication_title?: string;
  description: string;
  construction_status: string;
  location: { name: string; full_location: string };
  photos: Array<{ image: string }>;
  address?: string;
  fake_address?: string;
  geo_lat?: string;
  geo_long?: string;
  construction_date?: string;
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
    development: { id: 61196, name: "DOME Suites & Residences" },
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
    development: { id: 61196, name: "DOME Suites & Residences" },
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
    id: 52973,
    name: "DOME Green Soho",
    description: "Emprendimiento de alta gama ubicado en el exclusivo barrio de Palermo. Unidades de diseño moderno con amenities premium.",
    construction_status: "Destacado",
    location: { name: "Palermo", full_location: "Argentina | Capital Federal | Palermo" },
    photos: [{ image: "https://static.tokkobroker.com/dev_water_pics/27914360869976638140734754930712247938299289093841900359843531638118339896978.jpg" }]
  },
  {
    id: 60364,
    name: "DOME Cerviño  Boulevard",
    description: "Torre residencial de lujo con amenities de primer nivel y vistas panorámicas excepcionales a la ciudad y al río.",
    construction_status: "Destacado",
    location: { name: "Palermo", full_location: "Argentina | Capital Federal | Palermo" },
    photos: [{ image: "https://static.tokkobroker.com/dw_pics/60364_31839928654397109378106015551820670817840529182238357586863052781242069085212.jpg" }]
  },
  {
    id: 61196,
    name: "DOME Suites & Residences",
    description: "Emprendimiento premium residencial y de oficinas temporales de alta gama en pleno centro porteño. Unidades de 1 y 2 ambientes con terminaciones de primer nivel y amenities excepcionales.",
    construction_status: "Destacado",
    location: { name: "Recoleta", full_location: "Argentina | Capital Federal | Recoleta" },
    photos: [{ image: "https://static.tokkobroker.com/dw_pics/61196_101299875564516569090276404931510130878229827216650519336101080960697553581408.jpg" }]
  },
  {
    id: 68692,
    name: "DOME Cabello Residence",
    description: "Desarrollo exclusivo con unidades funcionales de diseño contemporáneo y amplios espacios de recreación.",
    construction_status: "En Construcción",
    location: { name: "Palermo", full_location: "Argentina | Capital Federal | Palermo" },
    photos: [{ image: "https://static.tokkobroker.com/dw_pics/68692_17595973841343846091468037372581387313648996719309491910218023255737020793612.jpg" }]
  },
  {
    id: 69416,
    name: "DOME Torre Beruti",
    description: "Exclusiva propuesta residencial con terminaciones de primer nivel y amenities excepcionales en la mejor zona de Palermo.",
    construction_status: "En Construcción",
    location: { name: "Palermo", full_location: "Argentina | Capital Federal | Palermo" },
    photos: [{ image: "https://static.tokkobroker.com/dw_pics/69416_54569474184354204375525693732181125720482404723332316177238240859102088639045.jpg" }]
  }
];

// In-Memory volatile RAM Cache stores
let propertiesCatalog: Property[] = [];
let developmentsCatalog: Development[] = [];
let isInitialized = false;
let initialFetchPromise: Promise<void> | null = null;
let refreshInterval: NodeJS.Timeout | null = null;

// Disk Cache Configuration
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'tokko-cache.json');

// Helper to load cache from disk
function loadCacheFromDisk(): boolean {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      if (data && Array.isArray(data.properties) && Array.isArray(data.developments)) {
        propertiesCatalog = data.properties.map(normalizeProperty);
        developmentsCatalog = data.developments;
        isInitialized = true;
        console.log(`[Tokko Disk Cache] Loaded ${propertiesCatalog.length} properties and ${developmentsCatalog.length} developments from disk cache.`);
        return true;
      }
    }
  } catch (err: any) {
    console.error("[Tokko Disk Cache] Failed to read disk cache:", err.message);
  }
  return false;
}

// Helper to save cache to disk
function saveCacheToDisk(): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      properties: propertiesCatalog,
      developments: developmentsCatalog,
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf-8');
    console.log("[Tokko Disk Cache] Catalog cached successfully on disk.");
  } catch (err: any) {
    console.error("[Tokko Disk Cache] Failed to write cache to disk:", err.message);
  }
}

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
    console.log("[Tokko API] Fetching first page of properties...");
    const firstPageData = await fetchTokko('https://www.tokkobroker.com/api/v1/property/search/', {
      limit,
      offset: 0,
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

    if (firstPageData && firstPageData.objects) {
      newProperties = newProperties.concat(firstPageData.objects);
      const totalCount = firstPageData.meta?.total_count || 0;
      console.log(`[Tokko API] First page of properties loaded. Total properties on server: ${totalCount}`);
      
      if (totalCount > limit) {
        const remainingPromises = [];
        for (let offset = limit; offset < totalCount; offset += limit) {
          console.log(`[Tokko API] Queueing parallel properties fetch for offset ${offset}...`);
          remainingPromises.push(
            fetchTokko('https://www.tokkobroker.com/api/v1/property/search/', {
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
            })
          );
        }
        
        const remainingResults = await Promise.all(remainingPromises);
        remainingResults.forEach(data => {
          if (data && data.objects) {
            newProperties = newProperties.concat(data.objects);
          }
        });
      }
    }
  } catch (err: any) {
    throw new Error(`Failed properties API fetch: ${err.message}`);
  }

  // Fetch developments
  let newDevelopments: Development[] = [];
  try {
    const limit = 100;
    console.log("[Tokko API] Fetching first page of developments...");
    const firstPageData = await fetchTokko('https://www.tokkobroker.com/api/v1/development/', {
      limit,
      offset: 0
    });

    if (firstPageData && firstPageData.objects) {
      newDevelopments = newDevelopments.concat(firstPageData.objects);
      const totalCount = firstPageData.meta?.total_count || 0;
      console.log(`[Tokko API] First page of developments loaded. Total developments on server: ${totalCount}`);

      if (totalCount > limit) {
        const remainingPromises = [];
        for (let offset = limit; offset < totalCount; offset += limit) {
          console.log(`[Tokko API] Queueing parallel developments fetch for offset ${offset}...`);
          remainingPromises.push(
            fetchTokko('https://www.tokkobroker.com/api/v1/development/', {
              limit,
              offset
            })
          );
        }
        const remainingResults = await Promise.all(remainingPromises);
        remainingResults.forEach(data => {
          if (data && data.objects) {
            newDevelopments = newDevelopments.concat(data.objects);
          }
        });
      }
    }
  } catch (err: any) {
    throw new Error(`Failed developments API fetch: ${err.message}`);
  }

  // Swap to RAM store only if successful
  if (newProperties.length > 0) {
    propertiesCatalog = newProperties.map(normalizeProperty);
  }
  if (newDevelopments.length > 0) {
    developmentsCatalog = newDevelopments;
  }

  saveCacheToDisk();
  startRefreshInterval();
}

// Initial Boot Loader
export async function ensureCatalogLoaded(): Promise<void> {
  if (isInitialized) return;
  if (initialFetchPromise) return initialFetchPromise;

  // Try to load from disk first. If we succeed, we mark isInitialized = true,
  // and trigger the background refresh asynchronously without blocking!
  const loadedFromDisk = loadCacheFromDisk();

  if (loadedFromDisk) {
    // Disk cache loaded. Trigger refresh catalog in background without awaiting it.
    // This makes the page load INSTANTLY.
    (async () => {
      try {
        console.log("[Tokko RAM Store] Triggering background refresh after disk cache load...");
        await refreshCatalog();
      } catch (err: any) {
        console.error("[Tokko RAM Store] Background refresh failed:", err.message);
      }
    })();
    return;
  }

  initialFetchPromise = (async () => {
    console.log("[Tokko RAM Store] Initializing properties catalog from API (blocking)...");
    try {
      await refreshCatalog();
      console.log(`[Tokko RAM Store] Initialization complete. Catalog contains ${propertiesCatalog.length} properties.`);
    } catch (err: any) {
      console.error("[Tokko RAM Store] Catalog initialization failed! Using Mock data as last resort.", err.message);
      propertiesCatalog = [...mockProperties].map(normalizeProperty);
      developmentsCatalog = [...mockDevelopments];
      startRefreshInterval();
    } finally {
      isInitialized = true;
      initialFetchPromise = null;
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

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const cleanAddressForSearch = (address: string): string => {
  if (!address) return '';
  let clean = address;
  // 1. Remove parenthesis and everything inside them (e.g. "(entre Seguí y Libertador)")
  clean = clean.replace(/\s*\(.*?\)/g, ' ');
  // 2. Truncate at common cross-street markers: "entre", "e/", standalone "y", "esquina", "esq.", "casi"
  const crossStreetRegex = /\s+(entre|e\/|\by\b|\besquina\b|\besq\b\.?|\bcasi\b)/i;
  const match = clean.match(crossStreetRegex);
  if (match && match.index !== undefined) {
    clean = clean.substring(0, match.index);
  }
  return clean.trim();
};

// Getters (in-memory filtering and sorting queries)
export async function getProperties(filters: any = {}): Promise<{ properties: Property[], total: number }> {
  await ensureCatalogLoaded();
  
  let result = [...propertiesCatalog];

  // Exclude units belonging to developments by default, unless searching for a specific development's units or show_all is true
  if (!filters.development_id && !filters.show_all) {
    result = result.filter(p => !p.development);
  }

  if (filters.q) {
    const query = normalizeString(filters.q);
    const hasAddressMatch = result.some(p => p.address && normalizeString(cleanAddressForSearch(p.address)).includes(query));
    if (hasAddressMatch) {
      result = result.filter(p => p.address && normalizeString(cleanAddressForSearch(p.address)).includes(query));
    } else {
      result = result.filter(p => 
        (p.publication_title && normalizeString(p.publication_title).includes(query)) ||
        (p.address && normalizeString(p.address).includes(query)) ||
        (p.description && normalizeString(p.description).includes(query)) ||
        (p.location?.name && normalizeString(p.location.name).includes(query))
      );
    }
  }

  if (filters.location) {
    const loc = normalizeString(filters.location);
    result = result.filter(p => p.location?.name && normalizeString(p.location.name).includes(loc));
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

  const opId = filters.operation_id ? Number(filters.operation_id) : null;
  const currencyFilter = filters.currency ? filters.currency.toUpperCase() : '';

  if (filters.price_min) {
    const pMin = Number(filters.price_min);
    result = result.filter(p => p.operations?.some(op => 
      (!opId || op.operation_id === opId) && op.prices?.some(pr => 
        (!currencyFilter || pr.currency === currencyFilter) && pr.price >= pMin
      )
    ));
  }

  if (filters.price_max) {
    const pMax = Number(filters.price_max);
    result = result.filter(p => p.operations?.some(op => 
      (!opId || op.operation_id === opId) && op.prices?.some(pr => 
        (!currencyFilter || pr.currency === currencyFilter) && pr.price <= pMax
      )
    ));
  }

  if (filters.currency) {
    result = result.filter(p => p.operations?.some(op => 
      (!opId || op.operation_id === opId) && op.prices?.some(pr => pr.currency === currencyFilter)
    ));
  }

  if (filters.rooms) {
    const r = Number(filters.rooms);
    result = result.filter(p => p.room_amount === r || (r === 4 && (p.room_amount || 0) >= 4));
  }

  if (filters.bedrooms) {
    const b = Number(filters.bedrooms);
    result = result.filter(p => p.suite_amount === b || (b === 4 && (p.suite_amount || 0) >= 4));
  }

  if (filters.bathrooms) {
    const b = Number(filters.bathrooms);
    result = result.filter(p => {
      const totalBaths = (p.bathroom_amount || 0) + (p.toilet_amount || 0);
      return totalBaths === b || (b === 4 && totalBaths >= 4);
    });
  }

  if (filters.garage) {
    const g = Number(filters.garage);
    result = result.filter(p => p.parking_lot_amount === g || (g === 4 && (p.parking_lot_amount || 0) >= 4));
  }

  if (filters.surface_min) {
    const sMin = Number(filters.surface_min);
    result = result.filter(p => {
      const surf = parseFloat(p.covered_surface || p.surface || '0');
      return surf >= sMin;
    });
  }

  if (filters.surface_max) {
    const sMax = Number(filters.surface_max);
    result = result.filter(p => {
      const surf = parseFloat(p.covered_surface || p.surface || '0');
      return surf > 0 && surf <= sMax;
    });
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

const constructionStatusMap: Record<string | number, string> = {
  1: "Lanzamiento",
  2: "Pozo",
  3: "En Pozo",
  4: "En Construcción",
  5: "Entrega Inmediata",
  6: "Terminado"
};

export function normalizeProperty(p: any): Property {
  if (!p) return p;
  
  const roofed = p.roofed_surface ? String(p.roofed_surface) : '';
  const covered = p.covered_surface ? String(p.covered_surface) : '';
  const hasCovered = covered && parseFloat(covered) > 0;
  const finalCovered = hasCovered ? covered : (roofed || p.surface || '0');

  return {
    id: Number(p.id),
    reference_code: p.reference_code || '',
    publication_title: p.publication_title || '',
    description: p.description || '',
    address: p.address || '',
    bathroom_amount: Number(p.bathroom_amount || 0),
    room_amount: Number(p.room_amount || 0),
    suite_amount: Number(p.suite_amount || 0),
    toilet_amount: Number(p.toilet_amount || 0),
    surface: p.surface || '0',
    total_surface: p.total_surface || '0',
    covered_surface: finalCovered,
    parking_lot_amount: Number(p.parking_lot_amount || 0),
    is_starred_on_web: Boolean(p.is_starred_on_web),
    type: p.type ? { id: Number(p.type.id), name: String(p.type.name) } : { id: 0, name: '' },
    development: p.development ? { id: Number(p.development.id), name: String(p.development.name) } : undefined,
    operations: Array.isArray(p.operations) ? p.operations.map((op: any) => ({
      operation_type: String(op.operation_type),
      operation_id: Number(op.operation_id),
      prices: Array.isArray(op.prices) ? op.prices.map((pr: any) => ({
        currency: String(pr.currency),
        price: Number(pr.price)
      })) : []
    })) : [],
    location: p.location ? { id: Number(p.location.id), name: String(p.location.name), full_location: String(p.location.full_location) } : { id: 0, name: '', full_location: '' },
    photos: Array.isArray(p.photos) ? p.photos.map((ph: any) => ({
      image: String(ph.image),
      thumb: String(ph.thumb)
    })) : [],
    tags: Array.isArray(p.tags) ? p.tags.map((t: any) => ({
      id: t.id ? Number(t.id) : undefined,
      name: String(t.name),
      type: t.type ? Number(t.type) : undefined
    })) : [],
    geo_lat: p.geo_lat ? String(p.geo_lat) : undefined,
    geo_long: p.geo_long ? String(p.geo_long) : undefined,
    age: p.age !== undefined && p.age !== null ? Number(p.age) : undefined,
    orientation: p.orientation ? String(p.orientation) : undefined,
    expenses: p.expenses !== undefined && p.expenses !== null ? Number(p.expenses) : undefined,
    expenses_currency: p.expenses_currency ? String(p.expenses_currency) : undefined,
    transaction_requirements: p.transaction_requirements ? String(p.transaction_requirements) : undefined
  };
}

function normalizeDevelopmentStatus(dev: Development): Development {
  if (!dev) return dev;
  let statusStr = dev.construction_status;
  if (dev.construction_status !== undefined && dev.construction_status !== null) {
    statusStr = constructionStatusMap[dev.construction_status as any] || dev.construction_status.toString();
  }
  return {
    ...dev,
    construction_status: statusStr
  };
}

export async function getDevelopments(filters: any = {}): Promise<{ developments: Development[], total: number }> {
  await ensureCatalogLoaded();
  
  let result = developmentsCatalog.map(normalizeDevelopmentStatus);

  if (filters.location) {
    const loc = normalizeString(filters.location);
    result = result.filter(d => d.location?.name && normalizeString(d.location.name).includes(loc));
  }

  if (filters.status) {
    result = result.filter(d => d.construction_status === filters.status);
  }

  return { developments: result, total: result.length };
}

export async function getDevelopmentById(id: number | string): Promise<Development | null> {
  await ensureCatalogLoaded();
  const dev = developmentsCatalog.find(d => d.id === Number(id));
  return dev ? normalizeDevelopmentStatus(dev) : null;
}

export async function getPropertiesByDevelopmentId(devId: number | string): Promise<Property[]> {
  await ensureCatalogLoaded();
  return propertiesCatalog.filter(p => p.development && p.development.id === Number(devId));
}

// Testing helper to inject mock properties catalog
export function setPropertiesCatalogForTesting(catalog: any[]): void {
  propertiesCatalog = catalog;
  isInitialized = true;
}

