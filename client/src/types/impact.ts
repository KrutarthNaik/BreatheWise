export type ImpactCategory = 'personal_exposure_reduction' | 'community_emission_reduction';

export interface ImpactActionLog {
  id: string;
  timestamp: string;
  category: ImpactCategory;
  title: string;
  description: string;
  estimatedMetric: string; // e.g., "~45 μg/m³ PM2.5 lung exposure avoided", "~1.2 kg CO2 eq emissions averted"
  badge: string;
  isCompleted: boolean;
  completedAt?: string;
  impactType: 'qualitative' | 'calculated';
  assumption?: string; // source/methodology for any numeric claim
}

export interface ImpactSummary {
  exposureAvoidedEvents: number;
  emissionsAvoidedEvents: number;
  n95HoursLogged: number;
  purifierHoursLogged: number;
  activeTransitTrips: number;
  completedCount: number;
}
