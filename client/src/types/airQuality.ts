export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // State or province
  country_code?: string;
}

export interface AirQualityCurrent {
  time: string;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide?: number | null;
  ozone?: number | null;
  sulphur_dioxide?: number | null;
  carbon_monoxide?: number | null;
  european_aqi?: number | null;
  us_aqi?: number | null;
}

export interface AirQualityHourly {
  time: string[];
  pm2_5: number[];
  pm10: number[];
  nitrogen_dioxide?: (number | null)[];
  ozone?: (number | null)[];
  sulphur_dioxide?: (number | null)[];
  carbon_monoxide?: (number | null)[];
}

export interface AirQualityData {
  city: string;
  stateCountry: string;
  latitude: number;
  longitude: number;
  current: AirQualityCurrent;
  hourly: AirQualityHourly;
  source: string;
  dataSourceNotice: string;
  gridResolution: string;
  lastUpdated: string;
  retrievalTimestamp: string;
  isCached: boolean;
  cacheAgeMinutes?: number;
  isFallback: boolean;
}

export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Unhealthy' | 'Severe' | 'Hazardous';

export interface AQIBandInfo {
  category: AQICategory;
  color: string;
  bgLight: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  summary: string;
  maskRecommendation: string;
  purifierRecommendation: string;
  outdoorRecommendation: string;
}
