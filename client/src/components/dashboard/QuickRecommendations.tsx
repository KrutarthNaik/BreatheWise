import React from 'react';
import { Shield, Wind, Activity, CheckCircle2 } from 'lucide-react';
import { AirQualityData } from '../../types/airQuality';
import { getAQIBand } from '../../utils/aqiBand';
import { Card } from '../common/Card';

interface QuickRecommendationsProps {
  data: AirQualityData;
}

export const QuickRecommendations: React.FC<QuickRecommendationsProps> = ({ data }) => {
  const pm25 = data.current?.pm2_5 ?? 75;
  const band = getAQIBand(pm25);

  const cards = [
    {
      title: 'Respirator & Mask Protocol',
      icon: Shield,
      rec: band.maskRecommendation,
      badge: pm25 > 90 ? 'N95 / FFP2 Required' : 'Standard Exposure',
      badgeColor: pm25 > 90 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      title: 'Indoor Air Filtration',
      icon: Wind,
      rec: band.purifierRecommendation,
      badge: pm25 > 120 ? 'Continuous HEPA Active' : 'Normal / Auto Filtration',
      badgeColor: pm25 > 120 ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      title: 'Outdoor & Transit Advisory',
      icon: Activity,
      rec: band.outdoorRecommendation,
      badge: pm25 > 150 ? 'Strict Indoors Recommended' : 'Modified Outdoor Transit',
      badgeColor: pm25 > 150 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-teal-100 text-teal-800 border-teal-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.rec}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-teal-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Evidence-based protective action</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
