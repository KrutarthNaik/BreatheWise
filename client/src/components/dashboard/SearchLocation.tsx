import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation, AlertCircle, X } from 'lucide-react';
import { searchLocations, getCurrentBrowserLocation, reverseGeocode } from '../../services/openMeteo';
import { GeocodingResult } from '../../types/airQuality';

interface SearchLocationProps {
  currentCity: string;
  onSelectLocation: (lat: number, lon: number, cityName: string, stateCountry?: string) => void;
  onLoadDemoSimulation?: () => void;
  isDemoActive?: boolean;
}

const POPULAR_CITIES = [
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, region: 'India' },
  { name: 'Lahore', lat: 31.5497, lon: 74.3436, region: 'Pakistan' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'India' },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, region: 'India' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, region: 'India' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, region: 'China' },
];

export const SearchLocation: React.FC<SearchLocationProps> = ({
  currentCity,
  onSelectLocation,
  onLoadDemoSimulation,
  isDemoActive = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchLocations(query);
      setResults(res);
      setLoading(false);
      setHasSearched(true);
      setIsOpen(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = async () => {
    setGeoError(null);
    setGeoLoading(true);
    try {
      const coords = await getCurrentBrowserLocation();
      const place = await reverseGeocode(coords.latitude, coords.longitude);
      onSelectLocation(coords.latitude, coords.longitude, place.cityName, place.stateCountry);
    } catch (err: any) {
      setGeoError(err.message || 'Unable to retrieve your current location.');
    } finally {
      setGeoLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3" ref={dropdownRef}>
      {/* Search Input Row with Geolocation button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
              placeholder={`Search city or district (current: ${currentCity})...`}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-sky-500 animate-spin absolute right-3.5" />
            ) : query.length > 0 ? (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {results.length > 0 ? (
                results.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onSelectLocation(
                        res.latitude,
                        res.longitude,
                        res.name,
                        [res.admin1, res.country].filter(Boolean).join(', ')
                      );
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-sky-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-900">{res.name}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      {[res.admin1, res.country].filter(Boolean).join(', ')}
                    </span>
                  </button>
                ))
              ) : hasSearched && !loading ? (
                <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">No locations found for "{query}"</p>
                  <p className="text-[11px] text-slate-400">
                    Try searching for the main city name or use one of the quick presets below.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* GPS Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-800 text-xs font-semibold shadow-sm transition-all whitespace-nowrap disabled:opacity-60"
          title="Detect location using browser GPS"
        >
          {geoLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation Error Alert if permission was denied or failed */}
      {geoError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{geoError}</span>
          </div>
          <button
            onClick={() => setGeoError(null)}
            className="text-amber-500 hover:text-amber-800 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Select Preset Pills and Demo Scenario */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Quick Presets:</span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => onSelectLocation(city.lat, city.lon, city.name, city.region)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
              !isDemoActive && currentCity.toLowerCase().includes(city.name.toLowerCase())
                ? 'bg-sky-100/70 border-sky-300 text-sky-900 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {city.name}
          </button>
        ))}

        {onLoadDemoSimulation && (
          <>
            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={onLoadDemoSimulation}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                isDemoActive
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-sm ring-1 ring-amber-400'
                  : 'bg-amber-50/80 border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400 font-medium'
              }`}
              title="Activate simulated severe-winter-smog demo scenario (PM2.5: 225 μg/m³) for testing recommendations"
            >
              <span>⚡</span>
              <span>{isDemoActive ? 'Simulated Smog Active (Demo)' : 'Demo Scenario: Severe Winter Smog'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
