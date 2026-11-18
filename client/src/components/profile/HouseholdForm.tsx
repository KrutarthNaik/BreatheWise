import React, { useState } from 'react';
import { Home, Users, Bike, Flame, ShieldCheck, Check, Save, Cigarette, Clock } from 'lucide-react';
import { HouseholdProfile } from '../../types/profile';
import { saveStoredProfile } from '../../services/storage';
import { Card } from '../common/Card';

interface HouseholdFormProps {
  initialProfile: HouseholdProfile;
  onProfileUpdated: (profile: HouseholdProfile) => void;
}

export const HouseholdForm: React.FC<HouseholdFormProps> = ({
  initialProfile,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<HouseholdProfile>(initialProfile);
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredProfile(profile);
    onProfileUpdated(profile);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-sky-600" />
            Household Clean-Air Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalize your daily routine and Gemini advisor based on your living conditions, family members, and commute.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-teal-700 transition-all self-start sm:self-auto"
        >
          {savedToast ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Saved to Browser!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Family Vulnerability Composition */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h3>Household Composition &amp; Health Vulnerabilities</h3>
          </div>

          {/* Adults count stepper */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Number of Adults</span>
              <span className="text-[11px] text-slate-500">Including yourself</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, adults: Math.max(1, (profile.adults ?? 2) - 1) })}
                className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors text-sm"
              >
                −
              </button>
              <span className="font-bold text-slate-900 w-5 text-center text-sm">{profile.adults ?? 2}</span>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, adults: Math.min(10, (profile.adults ?? 2) + 1) })}
                className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Children / Infants</span>
                <span className="text-[11px] text-slate-500">Developing respiratory systems, higher ventilation rate</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasChildren}
                onChange={(e) => setProfile({ ...profile, hasChildren: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Elderly Members (60+)</span>
                <span className="text-[11px] text-slate-500">Elevated cardiovascular and pulmonary vulnerability</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasElderly}
                onChange={(e) => setProfile({ ...profile, hasElderly: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Asthma / Bronchitis History</span>
                <span className="text-[11px] text-slate-500">Requires stricter particulate exposure thresholds</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasAsthmaOrRespiratory}
                onChange={(e) => setProfile({ ...profile, hasAsthmaOrRespiratory: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Household Pets (Dogs/Cats)</span>
                <span className="text-[11px] text-slate-500">Dander tracking and vulnerability to low-level smog</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasPets}
                onChange={(e) => setProfile({ ...profile, hasPets: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
            </label>
          </div>
        </Card>

        {/* Section 2: Commute & Travel Habits */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Bike className="w-4 h-4 text-sky-600" />
            <h3>Daily Commute Habits</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Primary Mode of Daily Transit
              </label>
              <select
                value={profile.commuteMode}
                onChange={(e) => setProfile({ ...profile, commuteMode: e.target.value as HouseholdProfile['commuteMode'] })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="two_wheeler">Two-Wheeler / Motorcycle (Highest Exposure)</option>
                <option value="open_auto">Open Auto-Rickshaw / E-Rickshaw</option>
                <option value="walking_cycling">Walking / Cycling (Intense Inhalation)</option>
                <option value="metro_bus">Metro / Public Bus (Moderate Shield)</option>
                <option value="car_cab">Car / Cab with AC Recirculation (High Shield)</option>
                <option value="wfh">Work from Home / Minimal Transit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Commute Timing
              </label>
              <select
                value={profile.commuteTiming ?? 'morning'}
                onChange={(e) => setProfile({ ...profile, commuteTiming: e.target.value as HouseholdProfile['commuteTiming'] })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="early_morning">Early Morning (5–7 AM) — Highest smog risk</option>
                <option value="morning">Morning Rush (7–9 AM) — High smog risk</option>
                <option value="midday">Midday (11 AM–1 PM) — Safest window</option>
                <option value="evening">Evening (5–8 PM) — High smog risk</option>
                <option value="night">Night (8 PM–midnight) — Moderate risk</option>
                <option value="flexible">Flexible / Varies</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Average One-Way Commute Duration: <strong className="text-sky-700">{profile.commuteDurationMinutes} mins</strong>
              </label>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={profile.commuteDurationMinutes}
                onChange={(e) => setProfile({ ...profile, commuteDurationMinutes: parseInt(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Dwelling Type
              </label>
              <select
                value={profile.homeType}
                onChange={(e) => setProfile({ ...profile, homeType: e.target.value as HouseholdProfile['homeType'] })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="apartment">Multi-Story Apartment (Higher floor = less street soot)</option>
                <option value="floor_builder">Builder Floor / Ground Floor (Street-level exposure)</option>
                <option value="independent_house">Independent House / Villa</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 3: Kitchen & Indoor Sources */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Flame className="w-4 h-4 text-sky-600" />
            <h3>Indoor Air &amp; Kitchen Factors</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Primary Cooking Fuel
              </label>
              <select
                value={profile.cookingFuel}
                onChange={(e) => setProfile({ ...profile, cookingFuel: e.target.value as HouseholdProfile['cookingFuel'] })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="lpg">LPG / Piped Natural Gas (Cleanest combustion)</option>
                <option value="induction">Induction / Electric (Zero direct combustion emissions)</option>
                <option value="biomass_chulha">Biomass / Wood / Cow Dung Chulha (High indoor PM)</option>
                <option value="kerosene">Kerosene Stove</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Kitchen Exhaust Fan / Chimney</span>
                <span className="text-[11px] text-slate-500">Expels oil vapor, tadka smoke, and combustion byproducts</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasKitchenExhaust}
                onChange={(e) => setProfile({ ...profile, hasKitchenExhaust: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
            </label>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Current Ventilation Habit
              </label>
              <select
                value={profile.ventilationHabit}
                onChange={(e) => setProfile({ ...profile, ventilationHabit: e.target.value as HouseholdProfile['ventilationHabit'] })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="windows_afternoon">Windows open only in afternoon (Recommended during smog)</option>
                <option value="windows_morning">Windows open in early morning (High smog risk!)</option>
                <option value="windows_open_always">Windows kept open throughout the day</option>
                <option value="windows_closed">Windows sealed completely with AC/ventilation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Primary Room Size <span className="font-normal text-slate-400">(optional — for HEPA sizing guidance)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="10"
                  placeholder="e.g. 200"
                  value={profile.roomSizeSqft ?? ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      roomSizeSqft: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <span className="text-xs text-slate-500 shrink-0">sq ft</span>
              </div>
              {profile.roomSizeSqft && (
                <p className="text-[11px] text-teal-700 mt-1">
                  Recommended CADR: ≥{Math.ceil(profile.roomSizeSqft * 1.55)} CFM (Source: AHAM AC-1 standard)
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Section 4: Indoor Smoke Sources */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Cigarette className="w-4 h-4 text-sky-600" />
            <h3>Indoor Smoke Sources</h3>
          </div>
          <p className="text-xs text-slate-500">
            Indoor combustion sources create acute PM2.5 spikes on top of outdoor smog. Identifying them helps the planner give targeted advice.
          </p>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 cursor-pointer transition-colors border border-amber-200/70">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Incense / Agarbatti Burning</span>
                <span className="text-[11px] text-slate-500">Can spike indoor PM2.5 above 300 μg/m³ in closed rooms</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasIncenseBurning}
                onChange={(e) => setProfile({ ...profile, hasIncenseBurning: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 cursor-pointer transition-colors border border-amber-200/70">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Indoor Tobacco Smoking</span>
                <span className="text-[11px] text-slate-500">Secondhand smoke contains 4,000+ chemicals and high PM2.5</span>
              </div>
              <input
                type="checkbox"
                checked={profile.hasIndoorSmoking}
                onChange={(e) => setProfile({ ...profile, hasIndoorSmoking: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
            </label>

            {(profile.hasIncenseBurning || profile.hasIndoorSmoking) && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Other Indoor Smoke Sources <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. dhoop, candles, wood fireplace..."
                  value={profile.indoorSmokeSources ?? ''}
                  onChange={(e) =>
                    setProfile({ ...profile, indoorSmokeSources: e.target.value || undefined })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Section 5: Protective Equipment Available */}
        <Card className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h3>Protective Equipment Available</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Mechanical Air Purifiers in Home</span>
                  <span className="text-[11px] text-slate-500">Active filtration equipment</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.hasAirPurifier}
                  onChange={(e) => setProfile({ ...profile, hasAirPurifier: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
              </label>

              {profile.hasAirPurifier && (
                <div className="pl-3 border-l-2 border-sky-300 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">Number of active purifiers:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, purifierCount: Math.max(1, profile.purifierCount - 1) })}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 w-4 text-center">{profile.purifierCount}</span>
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, purifierCount: profile.purifierCount + 1 })}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold hover:bg-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.hasHEPAFilter}
                      onChange={(e) => setProfile({ ...profile, hasHEPAFilter: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Equipped with genuine HEPA H13/H14 filter</span>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors border border-slate-200/60">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">N95 / FFP2 Masks Stocked</span>
                  <span className="text-[11px] text-slate-500">Certified tight-fitting respirators ready for all members</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.hasN95Masks}
                  onChange={(e) => setProfile({ ...profile, hasN95Masks: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
              </label>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
};
