import { DEFAULT_HOUSEHOLD_PROFILE, HouseholdProfile } from '../types/profile';
import { ImpactActionLog, ImpactSummary } from '../types/impact';

const PROFILE_KEY = 'breathewise_household_profile';
const IMPACT_LOGS_KEY = 'breathewise_impact_logs';
const IMPACT_COMPLETED_KEY = 'breathewise_impact_completed';
const GUIDE_ACKNOWLEDGED_KEY = 'bw_guide_acknowledged';

function getRoutineCompletedKey(): string {
  return `bw_routine_completed_${new Date().toISOString().slice(0, 10)}`;
}

export function getStoredProfile(): HouseholdProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_HOUSEHOLD_PROFILE;
    return { ...DEFAULT_HOUSEHOLD_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading profile from localStorage', e);
    return DEFAULT_HOUSEHOLD_PROFILE;
  }
}

export function saveStoredProfile(profile: HouseholdProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage', e);
  }
}

function getCompletedIds(): Record<string, string> {
  try {
    const raw = localStorage.getItem(IMPACT_COMPLETED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletedIds(map: Record<string, string>): void {
  try {
    localStorage.setItem(IMPACT_COMPLETED_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving completed impact IDs', e);
  }
}

type RawLog = Omit<ImpactActionLog, 'isCompleted' | 'completedAt'>;

function hydrateCompletionState(logs: RawLog[]): ImpactActionLog[] {
  const completed = getCompletedIds();
  return logs.map((log) => ({
    ...log,
    impactType: (log as ImpactActionLog).impactType ?? 'qualitative',
    assumption: (log as ImpactActionLog).assumption,
    isCompleted: !!completed[log.id],
    completedAt: completed[log.id] || undefined,
  }));
}

export function getStoredImpactLogs(): ImpactActionLog[] {
  try {
    const raw = localStorage.getItem(IMPACT_LOGS_KEY);
    if (!raw) {
      // Seed with sample initial records so the user understands the distinct categories immediately
      const initialLogs: RawLog[] = [
        {
          id: 'seed-1',
          timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'personal_exposure_reduction',
          title: 'Wore N95 Respirator on Metro Commute',
          description: 'Protected respiratory tract from severe outdoor particulate spike during morning rush hour.',
          estimatedMetric: '~95% PM2.5 inhaled dose reduced during outdoor exposure',
          badge: 'Personal Shield',
          impactType: 'qualitative',
          assumption: 'NIOSH 42 CFR Part 84 — N95 filters ≥95% of airborne particles ≥0.3 μm when properly fitted.',
        },
        {
          id: 'seed-2',
          timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'personal_exposure_reduction',
          title: "Ran HEPA Air Purifier in Children's Room",
          description: 'Maintained bedroom particulate concentration below 25 μg/m³ overnight.',
          estimatedMetric: '~8 hours of filtered air sanctuary for children',
          badge: 'Personal Shield',
          impactType: 'qualitative',
          assumption:
            'H13 HEPA filters 99.97% of particles ≥0.3 μm. Actual IAQ improvement depends on room sealing and purifier CADR vs. room volume.',
        },
        {
          id: 'seed-3',
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'community_emission_reduction',
          title: 'Used Electric Metro Instead of Solo Car Drive',
          description: 'Avoided direct localized vehicular tailpipe particulate emissions.',
          estimatedMetric: 'Avoided direct tailpipe PM2.5 and NOx for one commute trip',
          badge: 'Emission Reduction',
          impactType: 'qualitative',
          assumption:
            'Metro grid electricity mix is lower in direct PM2.5 tailpipe emissions than a petrol vehicle. Actual CO₂ per km varies by grid carbon intensity.',
        },
      ];
      localStorage.setItem(IMPACT_LOGS_KEY, JSON.stringify(initialLogs));
      return hydrateCompletionState(initialLogs);
    }
    return hydrateCompletionState(JSON.parse(raw));
  } catch (e) {
    console.error('Error reading impact logs from localStorage', e);
    return [];
  }
}

export function addImpactLog(
  action: Omit<ImpactActionLog, 'id' | 'timestamp' | 'isCompleted' | 'completedAt'>
): ImpactActionLog[] {
  try {
    const existing = getStoredImpactLogs();
    const newRaw: RawLog = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // Strip hydrated fields before persisting
    const rawExisting: RawLog[] = existing.map(({ isCompleted: _ic, completedAt: _ca, ...rest }) => rest);
    const updated = [newRaw, ...rawExisting];
    localStorage.setItem(IMPACT_LOGS_KEY, JSON.stringify(updated));
    return hydrateCompletionState(updated);
  } catch (e) {
    console.error('Error saving impact log to localStorage', e);
    return getStoredImpactLogs();
  }
}

export function toggleImpactLogCompleted(id: string): ImpactActionLog[] {
  const completed = getCompletedIds();
  if (completed[id]) {
    delete completed[id];
  } else {
    completed[id] = new Date().toISOString();
  }
  saveCompletedIds(completed);
  return getStoredImpactLogs();
}

export function clearImpactLogs(): void {
  try {
    localStorage.removeItem(IMPACT_LOGS_KEY);
    localStorage.removeItem(IMPACT_COMPLETED_KEY);
  } catch (e) {
    console.error('Error clearing impact logs', e);
  }
}

export function computeImpactSummary(logs: ImpactActionLog[]): ImpactSummary {
  let exposureCount = 0;
  let emissionCount = 0;
  let n95Hours = 0;
  let purifierHours = 0;
  let activeTransit = 0;
  let completedCount = 0;

  logs.forEach((log) => {
    if (log.isCompleted) completedCount++;
    if (log.category === 'personal_exposure_reduction') {
      exposureCount++;
      if (log.title.toLowerCase().includes('n95') || log.title.toLowerCase().includes('mask')) {
        n95Hours += 2;
      }
      if (log.title.toLowerCase().includes('purifier') || log.title.toLowerCase().includes('hepa')) {
        purifierHours += 8;
      }
    } else {
      emissionCount++;
      if (
        log.title.toLowerCase().includes('metro') ||
        log.title.toLowerCase().includes('transit') ||
        log.title.toLowerCase().includes('carpool')
      ) {
        activeTransit++;
      }
    }
  });

  return {
    exposureAvoidedEvents: exposureCount,
    emissionsAvoidedEvents: emissionCount,
    n95HoursLogged: n95Hours,
    purifierHoursLogged: purifierHours,
    activeTransitTrips: activeTransit,
    completedCount,
  };
}

// --- Routine daily completion (per-day key) ---
export function getRoutineCompleted(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(getRoutineCompletedKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleRoutineItem(key: string): Record<string, boolean> {
  const current = getRoutineCompleted();
  current[key] = !current[key];
  try {
    localStorage.setItem(getRoutineCompletedKey(), JSON.stringify(current));
  } catch (e) {
    console.error('Error saving routine completion', e);
  }
  return current;
}

// --- Guide acknowledgements ---
export function getGuideAcknowledged(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GUIDE_ACKNOWLEDGED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleGuideAcknowledged(id: string): Record<string, boolean> {
  const current = getGuideAcknowledged();
  current[id] = !current[id];
  try {
    localStorage.setItem(GUIDE_ACKNOWLEDGED_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving guide acknowledgement', e);
  }
  return current;
}
