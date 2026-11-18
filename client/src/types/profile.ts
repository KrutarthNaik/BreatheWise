export interface HouseholdProfile {
  cityName: string;
  latitude: number;
  longitude: number;
  homeType: 'apartment' | 'independent_house' | 'floor_builder';
  adults: number;
  hasChildren: boolean;
  hasElderly: boolean;
  hasAsthmaOrRespiratory: boolean;
  hasPets: boolean;
  commuteMode: 'two_wheeler' | 'walking_cycling' | 'open_auto' | 'metro_bus' | 'car_cab' | 'wfh';
  commuteDurationMinutes: number;
  commuteTiming: 'early_morning' | 'morning' | 'midday' | 'evening' | 'night' | 'flexible';
  cookingFuel: 'lpg' | 'induction' | 'biomass_chulha' | 'kerosene';
  hasKitchenExhaust: boolean;
  ventilationHabit: 'windows_open_always' | 'windows_morning' | 'windows_afternoon' | 'windows_closed';
  hasAirPurifier: boolean;
  purifierCount: number;
  hasHEPAFilter: boolean;
  hasN95Masks: boolean;
  roomSizeSqft?: number;
  hasIncenseBurning: boolean;
  hasIndoorSmoking: boolean;
  indoorSmokeSources?: string;
  notes?: string;
}

export const DEFAULT_HOUSEHOLD_PROFILE: HouseholdProfile = {
  cityName: 'Delhi',
  latitude: 28.6139,
  longitude: 77.2090,
  homeType: 'apartment',
  adults: 2,
  hasChildren: true,
  hasElderly: true,
  hasAsthmaOrRespiratory: false,
  hasPets: false,
  commuteMode: 'metro_bus',
  commuteDurationMinutes: 45,
  commuteTiming: 'morning',
  cookingFuel: 'lpg',
  hasKitchenExhaust: true,
  ventilationHabit: 'windows_afternoon',
  hasAirPurifier: true,
  purifierCount: 1,
  hasHEPAFilter: true,
  hasN95Masks: true,
  hasIncenseBurning: false,
  hasIndoorSmoking: false,
};
