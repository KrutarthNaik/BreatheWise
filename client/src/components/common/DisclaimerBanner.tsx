import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Scientific and Medical Disclaimer" className="bg-sky-50/90 border-b border-sky-100 py-2.5 px-4 text-xs text-sky-900 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-sky-950">Scientific & Medical Transparency:</strong>{' '}
            Pollutant data is derived from the <span className="underline decoration-sky-300">Open-Meteo European/US Atmospheric Dispersion Model</span> (Copernicus CAMS & NOAA GFS),{' '}
            <strong className="font-semibold text-sky-950">not an official CPCB ground-sensor reading</strong>.{' '}
            Guidance is for practical environmental exposure reduction and does not constitute medical diagnosis.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sky-500 hover:text-sky-800 p-1 rounded-md transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
