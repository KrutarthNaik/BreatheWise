import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { AirQualityHourly } from '../../types/airQuality';
import { getAQIBand } from '../../utils/aqiBand';
import { Card } from '../common/Card';

interface HourlyAQIChartProps {
  hourly: AirQualityHourly;
}

type PollutantView = 'pm2_5' | 'pm10' | 'nitrogen_dioxide' | 'ozone';

export const HourlyAQIChart: React.FC<HourlyAQIChartProps> = ({ hourly }) => {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantView>('pm2_5');

  const times = hourly.time || [];
  const rawValues = (hourly[selectedPollutant] || []) as (number | null)[];
  const values = rawValues.map((v) => (typeof v === 'number' && !isNaN(v) ? v : 0));

  if (values.length === 0) return null;

  const maxVal = Math.max(...values, 30);

  const pollutantLabels: Record<PollutantView, { label: string; unit: string; desc: string }> = {
    pm2_5: {
      label: 'PM2.5 Fine Particles',
      unit: 'μg/m³',
      desc: 'Inhalable particulate (<2.5μm) penetrating deep lung tissue & bloodstream',
    },
    pm10: {
      label: 'PM10 Coarse Particles',
      unit: 'μg/m³',
      desc: 'Respirable dust, road fly-ash, and mechanical debris (<10μm)',
    },
    nitrogen_dioxide: {
      label: 'NO₂ (Nitrogen Dioxide)',
      unit: 'μg/m³',
      desc: 'Traffic tailpipe emissions and combustion gases',
    },
    ozone: {
      label: 'O₃ (Ground-Level Ozone)',
      unit: 'μg/m³',
      desc: 'Photochemical smog formed by sunlight reacting with hydrocarbons',
    },
  };

  const currentMeta = pollutantLabels[selectedPollutant];

  return (
    <Card className="space-y-4">
      {/* Chart Header & Pollutant Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Next 24-Hour Forecast & Diurnal Trend</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{currentMeta.desc}</p>
        </div>

        {/* Pollutant Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          {(['pm2_5', 'pm10', 'nitrogen_dioxide', 'ozone'] as PollutantView[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPollutant(key)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedPollutant === key
                  ? 'bg-white text-sky-800 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {key === 'pm2_5' ? 'PM2.5' : key === 'pm10' ? 'PM10' : key === 'nitrogen_dioxide' ? 'NO₂' : 'O₃'}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Bar Visualizer */}
      <div className="relative pt-6">
        <div className="flex items-end gap-1.5 h-40 w-full overflow-x-auto pb-6 pt-2 px-1 no-scrollbar">
          {values.map((val, idx) => {
            // Determine color representation
            const band = getAQIBand(selectedPollutant === 'pm10' ? val / 1.6 : val);
            const heightPercent = Math.min(Math.round((val / maxVal) * 100), 100);
            const timeLabel = times[idx] ? times[idx].slice(11, 16) || `${idx}:00` : `${idx}:00`;

            return (
              <div
                key={idx}
                className="flex-1 min-w-[28px] sm:min-w-[34px] flex flex-col items-center group relative cursor-pointer"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-lg border border-slate-700">
                  <strong>{timeLabel}</strong>: {val} {currentMeta.unit}
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all group-hover:brightness-110 shadow-sm"
                  style={{
                    height: `${Math.max(heightPercent, 6)}%`,
                    backgroundColor:
                      selectedPollutant === 'pm2_5'
                        ? band.color
                        : selectedPollutant === 'pm10'
                        ? '#475569'
                        : selectedPollutant === 'nitrogen_dioxide'
                        ? '#d97706'
                        : '#0284c7',
                  }}
                />

                {/* Hour Label */}
                <span className="text-[10px] text-slate-400 mt-2 font-mono group-hover:text-slate-900 group-hover:font-semibold">
                  {idx % 3 === 0 ? timeLabel : '·'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diurnal Atmospheric Science Note */}
      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-950 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold">Diurnal Inversion Dynamics:</strong> Ground radiative cooling during winter nights forms a low thermal inversion lid, concentrating vehicle and biomass smoke near breathing height. Solar insolation between <strong>12:00 PM and 3:30 PM</strong> warms the surface and expands the vertical boundary layer, offering the lowest particulate concentration window of the day.
        </p>
      </div>
    </Card>
  );
};
