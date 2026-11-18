export interface RoutineSlot {
  timeRange: string;
  slotName: 'Morning' | 'Afternoon' | 'Evening';
  icon: string;
  summary: string;
  commuteAdvice: string;
  ventilationAdvice: string;
  indoorPurifierAdvice: string;
  outdoorVulnerabilityAlert?: string;
  saferTimeWindow?: string;
  indoorSmokeWarning?: string;
  actionChecklist: string[];
}

export interface DailyPersonalizedRoutine {
  date: string;
  location: string;
  severityLevel: string;
  overallAdvisory: string;
  slots: {
    morning: RoutineSlot;
    afternoon: RoutineSlot;
    evening: RoutineSlot;
  };
}
