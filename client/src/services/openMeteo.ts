import { AirQualityData, GeocodingResult } from '../types/airQuality';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache TTL
const cacheMemory = new Map<string, { data: AirQualityData; cachedAt: number }>();

function getCacheKey(lat: number, lon: number): string {
  return `bw_aq_${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

function getFromCache(lat: number, lon: number): { data: AirQualityData; ageMinutes: number } | null {
  const key = getCacheKey(lat, lon);
  const now = Date.now();

  // Try memory cache first
  const memoryEntry = cacheMemory.get(key);
  if (memoryEntry && now - memoryEntry.cachedAt < CACHE_TTL_MS) {
    const ageMinutes = Math.max(0, Math.round((now - memoryEntry.cachedAt) / 60000));
    return { data: memoryEntry.data, ageMinutes };
  }

  // Try sessionStorage
  try {
    const item = sessionStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed.cachedAt && now - parsed.cachedAt < CACHE_TTL_MS) {
        const ageMinutes = Math.max(0, Math.round((now - parsed.cachedAt) / 60000));
        cacheMemory.set(key, parsed);
        return { data: parsed.data, ageMinutes };
      }
    }
  } catch {
    // SessionStorage may be restricted in some contexts
  }

  return null;
}

function saveToCache(lat: number, lon: number, data: AirQualityData) {
  const key = getCacheKey(lat, lon);
  const entry = { data, cachedAt: Date.now() };
  cacheMemory.set(key, entry);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or security errors
  }
}

/**
 * Searches for cities using the official Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP error: ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      admin1: item.admin1,
      country_code: item.country_code,
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a friendly place name.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ cityName: string; stateCountry: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const addr = json.address || {};
      const cityName =
        addr.city || addr.town || addr.municipality || addr.village || addr.suburb || json.name || 'Detected Location';
      const stateCountry = [addr.state, addr.country].filter(Boolean).join(', ') || 'Local Coordinates';
      return { cityName, stateCountry };
    }
  } catch (err) {
    console.warn('Reverse geocoding timed out or failed:', err);
  }

  return {
    cityName: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    stateCountry: 'GPS Detected',
  };
}

/**
 * Requests device coordinates from browser geolocation after explicit user action.
 */
export function getCurrentBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access or search manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is currently unavailable from your device.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Fetches real-time atmospheric air quality data from Open-Meteo Air Quality API.
 * Includes short TTL caching to avoid repeat API hits.
 */
export async function fetchAirQuality(
  lat: number,
  lon: number,
  cityName: string,
  stateCountry?: string,
  options?: { forceRefresh?: boolean }
): Promise<AirQualityData> {
  // Check cache unless forceRefresh is true
  if (!options?.forceRefresh) {
    const cached = getFromCache(lat, lon);
    if (cached) {
      return {
        ...cached.data,
        city: cityName || cached.data.city,
        stateCountry: stateCountry || cached.data.stateCountry,
        isCached: true,
        cacheAgeMinutes: cached.ageMinutes,
      };
    }
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi&hourly=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&forecast_days=2&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo Air Quality API returned HTTP ${res.status}`);
    }

    const data = await res.json();

    // Determine current hour index in hourly series to slice next 24 hours
    const hourlyTimes: string[] = data.hourly?.time || [];
    const currentTimeStr = data.current?.time;
    let startIndex = 0;

    if (currentTimeStr && hourlyTimes.length > 0) {
      const foundIdx = hourlyTimes.findIndex((t) => t.slice(0, 13) === currentTimeStr.slice(0, 13));
      if (foundIdx >= 0) {
        startIndex = foundIdx;
      }
    }

    const sliceEnd = startIndex + 24;

    // Helper to safely extract or fallback to nearest hourly reading without inventing numbers
    const getNearestOrCurrent = (currentVal: any, hourlyArray: (number | null)[] | undefined): number | null => {
      if (typeof currentVal === 'number' && !isNaN(currentVal)) {
        return Math.round(currentVal * 10) / 10;
      }
      if (hourlyArray && hourlyArray.length > startIndex) {
        const val = hourlyArray[startIndex];
        if (typeof val === 'number' && !isNaN(val)) {
          return Math.round(val * 10) / 10;
        }
      }
      return null;
    };

    const currentPm25 = getNearestOrCurrent(data.current?.pm2_5, data.hourly?.pm2_5);
    const currentPm10 = getNearestOrCurrent(data.current?.pm10, data.hourly?.pm10);

    const current = {
      time: data.current?.time || new Date().toISOString(),
      pm2_5: currentPm25 !== null ? currentPm25 : 0,
      pm10: currentPm10 !== null ? currentPm10 : 0,
      nitrogen_dioxide: getNearestOrCurrent(data.current?.nitrogen_dioxide, data.hourly?.nitrogen_dioxide),
      ozone: getNearestOrCurrent(data.current?.ozone, data.hourly?.ozone),
      sulphur_dioxide: getNearestOrCurrent(data.current?.sulphur_dioxide, data.hourly?.sulphur_dioxide),
      carbon_monoxide: getNearestOrCurrent(data.current?.carbon_monoxide, data.hourly?.carbon_monoxide),
      european_aqi: typeof data.current?.european_aqi === 'number' ? data.current.european_aqi : null,
      us_aqi: typeof data.current?.us_aqi === 'number' ? data.current.us_aqi : null,
    };

    const hourly = {
      time: hourlyTimes.slice(startIndex, sliceEnd),
      pm2_5: (data.hourly?.pm2_5 || []).slice(startIndex, sliceEnd),
      pm10: (data.hourly?.pm10 || []).slice(startIndex, sliceEnd),
      nitrogen_dioxide: (data.hourly?.nitrogen_dioxide || []).slice(startIndex, sliceEnd),
      ozone: (data.hourly?.ozone || []).slice(startIndex, sliceEnd),
      sulphur_dioxide: (data.hourly?.sulphur_dioxide || []).slice(startIndex, sliceEnd),
      carbon_monoxide: (data.hourly?.carbon_monoxide || []).slice(startIndex, sliceEnd),
    };

    const now = new Date();
    const result: AirQualityData = {
      city: cityName,
      stateCountry: stateCountry || 'Region',
      latitude: lat,
      longitude: lon,
      current,
      hourly,
      source: 'Open-Meteo Air Quality API (Copernicus Atmosphere Monitoring Service - CAMS & NOAA GFS)',
      dataSourceNotice:
        'Atmospheric dispersion model data. Note: This data is generated by global numerical weather & chemical dispersion models. It is NOT an official CPCB (Central Pollution Control Board) ground monitoring station reading.',
      gridResolution: '~11 km atmospheric model grid resolution',
      lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      retrievalTimestamp: now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCached: false,
      cacheAgeMinutes: 0,
      isFallback: false,
    };

    saveToCache(lat, lon, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Open-Meteo Air Quality API request failed:', err);
    throw err;
  }
}

/**
 * Clearly labelled fallback dataset when API is offline or user requests demo mode.
 */
export function getFallbackAirQuality(
  cityName: string,
  lat: number,
  lon: number,
  stateCountry?: string
): AirQualityData {
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() + i);
    return d.toISOString().slice(0, 16);
  });

  // Typical diurnal profile during severe winter smog: peaks at night/morning, lower in afternoon
  const pm2_5_hourly = [
    185, 215, 240, 275, 295, 315, 325, 290, 235, 185, 155, 135,
    125, 120, 130, 150, 180, 220, 265, 285, 270, 245, 215, 190,
  ];
  const pm10_hourly = pm2_5_hourly.map((v) => Math.round(v * 1.62));
  const no2_hourly = pm2_5_hourly.map((v) => Math.round(v * 0.42));
  const o3_hourly = [
    12, 11, 10, 14, 18, 25, 22, 28, 55, 95, 135, 160,
    165, 150, 125, 85, 55, 38, 28, 22, 19, 16, 14, 12,
  ];
  const so2_hourly = pm2_5_hourly.map((v) => Math.round(v * 0.18));

  return {
    city: cityName || 'Delhi NCR',
    stateCountry: stateCountry || 'India',
    latitude: lat || 28.6139,
    longitude: lon || 77.209,
    current: {
      time: now.toISOString(),
      pm2_5: 225,
      pm10: 360,
      nitrogen_dioxide: 92,
      ozone: 45,
      sulphur_dioxide: 40,
      carbon_monoxide: 2400,
      european_aqi: 95,
      us_aqi: 275,
    },
    hourly: {
      time: hours,
      pm2_5: pm2_5_hourly,
      pm10: pm10_hourly,
      nitrogen_dioxide: no2_hourly,
      ozone: o3_hourly,
      sulphur_dioxide: so2_hourly,
    },
    source: 'Sample Winter Smog Simulation (Demonstration Fallback)',
    dataSourceNotice:
      'DEMO / SAMPLE DATASET: Live Open-Meteo Air Quality API was unreachable or demo mode was selected. Values represent a typical winter nocturnal inversion scenario and are NOT live sensor readings or official CPCB data.',
    gridResolution: 'Simulated urban airshed profile',
    lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    retrievalTimestamp: now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isCached: false,
    cacheAgeMinutes: 0,
    isFallback: true,
  };
}
