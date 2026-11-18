import { AQIBandInfo } from '../types/airQuality';

export function getAQIBand(pm25: number): AQIBandInfo {
  if (pm25 <= 30) {
    return {
      category: 'Good',
      color: '#10b981',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100',
      badgeBorder: 'border-emerald-300',
      summary: 'Air quality is satisfactory. Atmospheric dispersion is good.',
      maskRecommendation: 'No mask required for general outdoor activities.',
      purifierRecommendation: 'Purifiers optional; regular natural ventilation permitted.',
      outdoorRecommendation: 'Ideal conditions for outdoor sports, morning walks, and activities.',
    };
  } else if (pm25 <= 60) {
    return {
      category: 'Moderate',
      color: '#f59e0b',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      badgeBorder: 'border-amber-300',
      summary: 'Acceptable air quality. Minor breathing discomfort possible for sensitive individuals.',
      maskRecommendation: 'Sensitive groups (asthmatics, seniors) should consider cloth or N95 masks during high-traffic commute.',
      purifierRecommendation: 'Keep purifiers on low/auto during night hours.',
      outdoorRecommendation: 'Outdoor activities fine; sensitive individuals should moderate intense cardio.',
    };
  } else if (pm25 <= 90) {
    return {
      category: 'Poor',
      color: '#f97316',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-800',
      badgeBg: 'bg-orange-100',
      badgeBorder: 'border-orange-300',
      summary: 'Breathing discomfort to people with lung/heart disease, children and older adults.',
      maskRecommendation: 'N95 or equivalent respirator strongly advised on two-wheelers and busy roads.',
      purifierRecommendation: 'Operate HEPA purifiers in living and sleeping zones.',
      outdoorRecommendation: 'Avoid strenuous morning outdoor jogs during temperature inversion periods.',
    };
  } else if (pm25 <= 150) {
    return {
      category: 'Unhealthy',
      color: '#ef4444',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-800',
      badgeBg: 'bg-rose-100',
      badgeBorder: 'border-rose-300',
      summary: 'Respiratory illness likely on prolonged exposure; significant effect on vulnerable groups.',
      maskRecommendation: 'Well-fitted N95/FFP2 respirator mandatory for any outdoor exposure.',
      purifierRecommendation: 'Keep doors and windows sealed. Run purifiers on medium/high.',
      outdoorRecommendation: 'Cancel outdoor fitness sessions. Children and seniors should remain indoors.',
    };
  } else if (pm25 <= 250) {
    return {
      category: 'Severe',
      color: '#8b5cf6',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-800',
      badgeBg: 'bg-purple-100',
      badgeBorder: 'border-purple-300',
      summary: 'Severe respiratory risk to healthy people; serious health impact on sensitive groups.',
      maskRecommendation: 'Strict N95 respirator adherence. Avoid any unsealed or loose masks.',
      purifierRecommendation: 'Continuous HEPA filtration in sealed rooms. Run kitchen exhaust during all cooking.',
      outdoorRecommendation: 'Strictly avoid all non-essential outdoor transit and outdoor recreation.',
    };
  } else {
    return {
      category: 'Hazardous',
      color: '#7f1d1d',
      bgLight: 'bg-red-100',
      textColor: 'text-red-950',
      badgeBg: 'bg-red-200',
      badgeBorder: 'border-red-400',
      summary: 'Emergency atmospheric conditions. Immediate systemic exposure hazard for all inhabitants.',
      maskRecommendation: 'Do not step outdoors without an N95 respirator. Limit outdoor time to absolute minimum.',
      purifierRecommendation: 'Create a clean-air sanctuary room with continuous filtration; seal gaps with moist towels.',
      outdoorRecommendation: 'Complete suspension of outdoor workouts, school sports, and unnecessary travel.',
    };
  }
}
