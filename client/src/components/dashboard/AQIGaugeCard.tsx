import React from 'react';
import { ShieldAlert, Clock, Database, RefreshCw, AlertTriangle, MapPin, Layers } from 'lucide-react';
import { AirQualityData } from '../../types/airQuality';
import { getAQIBand } from '../../utils/aqiBand';
import { Card } from '../common/Card';

interface AQIGaugeCardProps {
  data: AirQualityData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AQIGaugeCard: React.FC<AQIGaugeCardProps> = ({ data, onRefresh, isRefreshing = false }) => {
  const pm25 = data.current?.pm2_5 ?? 0;
  const pm10 = data.current?.pm10 ?? 0;
  const band = getAQIBand(pm25);

  const no2 = data.current?.nitrogen_dioxide;
  const o3 = data.current?.ozone;
  const so2 = data.current?.sulphur_dioxide;

  return (
    <Card className="relative overflow-hidden border-slate-200/90 space-y-5">
      {/* Fallback / Demo Data Notice if Active */}
      {data.isFallback && (
        <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-amber-900 block">
                SIMULATED SEVERE-WINTER-SMOG DEMO SCENARIO ACTIVE
              </strong>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                This simulated severe winter smog scenario (PM2.5: 225 μg/m³, Severe Tier) demonstrates BreatheWise advisories and routine adjustments. These are <strong>simulated values, not live sensor readings</strong>.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 text-amber-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Switch to Live Air Quality</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner with Location, Coordinates and Cache/Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{data.city}</h2>
            <span className="text-xs text-slate-500 font-medium">({data.stateCountry})</span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" />
              {data.latitude.toFixed(3)}°, {data.longitude.toFixed(3)}°
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Atmospheric air-quality dispersion & particulate exposure status
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Cache indicator badge */}
          {data.isCached && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <Clock className="w-3 h-3 text-sky-500" />
              Cached ({data.cacheAgeMinutes ?? 0}m ago)
            </span>
          )}

          {/* Smog Tier Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${band.badgeBg} ${band.badgeBorder} ${band.textColor}`}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: band.color }} />
            {band.category} Smog Tier
          </span>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all disabled:opacity-50"
              title="Fetch fresh live air quality data from Open-Meteo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Pollutants: PM2.5 & PM10 in micrograms per cubic metre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: PM2.5 Hero Display */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
          <div
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md"
            style={{ backgroundColor: band.color }}
          >
            <span className="text-2xl font-black tracking-tight">{pm25}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">μg/m³</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fine Particulate (PM2.5)
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-snug">{band.summary}</p>
            <p className="text-xs text-slate-500">
              WHO 24-hr guideline: <strong className="text-slate-700">15 μg/m³</strong> (Current:{' '}
              <strong className="text-slate-900">{(pm25 / 15).toFixed(1)}×</strong> guideline)
            </p>
          </div>
        </div>

        {/* Right: PM10 Coarse Particulate */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-slate-700 text-white shrink-0 shadow-md">
            <span className="text-2xl font-black tracking-tight">{pm10}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">μg/m³</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Coarse Particulate (PM10)
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              Dust, fly-ash & vehicle brake/tire wear
            </p>
            <p className="text-xs text-slate-500">
              WHO 24-hr guideline: <strong className="text-slate-700">45 μg/m³</strong> (Current:{' '}
              <strong className="text-slate-900">{(pm10 / 45).toFixed(1)}×</strong> guideline)
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Pollutants & Standard Indexes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* NO2 */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            NO₂ (Nitrogen Dioxide)
          </span>
          <span className="text-base font-bold text-slate-800">
            {no2 !== null && no2 !== undefined ? `${no2} μg/m³` : 'N/A'}
          </span>
          <span className="text-[10px] text-slate-500 block">Traffic combustion</span>
        </div>

        {/* O3 */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            O₃ (Ground Ozone)
          </span>
          <span className="text-base font-bold text-slate-800">
            {o3 !== null && o3 !== undefined ? `${o3} μg/m³` : 'N/A'}
          </span>
          <span className="text-[10px] text-slate-500 block">Photochemical smog</span>
        </div>

        {/* SO2 */}
        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SO₂ (Sulphur Dioxide)
          </span>
          <span className="text-base font-bold text-slate-800">
            {so2 !== null && so2 !== undefined ? `${so2} μg/m³` : 'N/A'}
          </span>
          <span className="text-[10px] text-slate-500 block">Industrial emissions</span>
        </div>

        {/* European AQI Standard Explicitly Identified */}
        <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
            European AQI (EAQI)
          </span>
          <span className="text-base font-bold text-sky-950">
            {data.current?.european_aqi ?? 'N/A'}
          </span>
          <span className="text-[10px] text-sky-600 block">Copernicus CAMS index</span>
        </div>

        {/* US EPA AQI Standard Explicitly Identified */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            US EPA AQI Equiv.
          </span>
          <span className="text-base font-bold text-indigo-950">
            {data.current?.us_aqi ?? 'N/A'}
          </span>
          <span className="text-[10px] text-indigo-600 block">US EPA standard curve</span>
        </div>
      </div>

      {/* Mandatory Data Attribution, Resolution & Limitations */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Provider: <strong className="text-slate-700 font-medium">Open-Meteo Air Quality API</strong> (Copernicus CAMS & NOAA GFS).
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Layers className="w-3 h-3" />
            {data.gridResolution}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>Retrieved: {data.retrievalTimestamp}</span>
        </div>
      </div>

      <div className="text-[11px] bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 text-slate-600 flex items-start gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="text-slate-800">Scientific Attribution Note:</strong> All values above are regional atmospheric numerical model estimates. They are <strong className="underline text-slate-800">NOT official ground-station continuous ambient air quality monitoring (CPCB / CAAQMS) measurements</strong>. Modelled European and US AQI indices follow their respective European Commission and US EPA formulas, and must not be confused with India's National AQI (NAQI).
        </span>
      </div>
    </Card>
  );
};
