import React, { useState } from 'react';
import {
  BookOpen,
  Wind,
  Flame,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Box,
  XCircle,
  Trash2,
  Droplets,
  Ban,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Card } from '../common/Card';
import { HouseholdProfile } from '../../types/profile';
import { AirQualityData } from '../../types/airQuality';
import { getGuideAcknowledged, toggleGuideAcknowledged } from '../../services/storage';

interface IndoorGuideProps {
  profile?: HouseholdProfile;
  airQuality?: AirQualityData;
}

interface GuideCard {
  id: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export const IndoorGuide: React.FC<IndoorGuideProps> = ({ profile, airQuality }) => {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>(() => getGuideAcknowledged());

  const handleToggleAck = (id: string) => {
    const updated = toggleGuideAcknowledged(id);
    setAcknowledged(updated);
  };

  const pm25 = airQuality?.current?.pm2_5;
  const hourlyPm25: number[] = airQuality?.hourly?.pm2_5 ?? [];
  const hourlyTimes: string[] = airQuality?.hourly?.time ?? [];
  const hasKidsOrElderly = profile ? profile.hasChildren || profile.hasElderly || profile.hasAsthmaOrRespiratory : false;

  // Forecast-derived safest ventilation window
  let ventilationWindow = '1:00 PM – 2:30 PM (typical midday inversion lift)';
  if (hourlyPm25.length >= 24 && hourlyTimes.length >= 24) {
    let minVal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < Math.min(24, hourlyPm25.length); i++) {
      const v = hourlyPm25[i];
      if (typeof v === 'number' && v < minVal) {
        minVal = v;
        minIdx = i;
      }
    }
    if (minIdx >= 0 && minVal < (pm25 ?? 999)) {
      const rawTime = hourlyTimes[minIdx];
      const dt = new Date(rawTime);
      const hour = dt.getHours();
      const fmtHour = (h: number) => {
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:00 ${suffix}`;
      };
      ventilationWindow = `${fmtHour(hour)}–${fmtHour(hour + 1)} (forecast PM2.5 ≈ ${minVal.toFixed(0)} μg/m³)`;
    }
  }

  // CADR hint
  const cadrHint = profile?.roomSizeSqft
    ? `For your ${profile.roomSizeSqft} sq ft room, you need a purifier with CADR ≥ ${Math.ceil(profile.roomSizeSqft * 1.55)} CFM.`
    : 'Formula: CADR (CFM) ≥ room area (sq ft) × 1.55';

  const indoorSmokeUrgent = profile ? profile.hasIncenseBurning || profile.hasIndoorSmoking : false;

  const guideCards: GuideCard[] = [
    {
      id: 'ventilation',
      urgency: 'high',
      icon: <Wind className="w-4 h-4 text-teal-600" />,
      title: '1. The Diurnal Ventilation Rule',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Never open windows early in the morning or late at night during winter smog. Ground radiative cooling creates an atmospheric
            ceiling (temperature inversion) that traps industrial, diesel, and biomass smoke within 100 metres of the ground.
          </p>
          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-teal-950 space-y-1">
            <strong className="block font-bold">Today's Recommended Airing Window:</strong>
            <p>{ventilationWindow}</p>
            <p className="text-teal-700 mt-1">Open opposing windows for 15 minutes, then seal and run purifier on High for 20 minutes.</p>
          </div>
          {pm25 && pm25 > 150 && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
              <strong>Current PM2.5 is Severe ({pm25.toFixed(0)} μg/m³).</strong> Skip all natural ventilation today — maintain sealed filtration.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'source-control',
      urgency: indoorSmokeUrgent ? 'critical' : 'high',
      icon: <Ban className="w-4 h-4 text-rose-600" />,
      title: '2. Indoor Smoke Source Control',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          {indoorSmokeUrgent && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
              ⚠️ Your profile indicates indoor smoke sources. These create PM2.5 spikes on top of outdoor smog.
            </div>
          )}
          <ul className="space-y-2 list-none">
            {[
              {
                label: 'Incense / Agarbatti:',
                detail:
                  'Studies show burning incense sticks in an unventilated room can raise indoor PM2.5 above 300 μg/m³ within minutes. During high outdoor pollution, avoid entirely or switch to ventilated outdoor areas.',
              },
              {
                label: 'Tobacco Smoke:',
                detail:
                  'Secondhand smoke contains 4,000+ chemicals including PM2.5, benzene and formaldehyde. Smoking should not occur indoors, especially with children or elderly present.',
              },
              {
                label: 'Candles & Dhoop:',
                detail:
                  'Paraffin candles and dhoop produce ultrafine particles. If used for religious purposes, limit duration and open a window briefly or run kitchen exhaust after.',
              },
            ].map(({ label, detail }) => (
              <li key={label} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>{label}</strong> {detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'damp-dusting',
      urgency: 'medium',
      icon: <Droplets className="w-4 h-4 text-sky-600" />,
      title: '3. Damp Dusting to Remove Settled PM',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Fine particles (PM2.5–PM10) settle on horizontal surfaces — window sills, tables, floors — and become re-suspended when dry dusted.
            Damp dusting physically traps particles in the cloth instead of re-releasing them.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-700">
            <li>Use a damp microfiber cloth — not a dry feather duster.</li>
            <li>Wipe from top to bottom: shelves → tables → windowsills → floor.</li>
            <li>During high smog days, damp dust daily in rooms used by children or elderly.</li>
            <li>Rinse cloth under running water after each room to avoid re-depositing particles.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'kitchen-exhaust',
      urgency: 'high',
      icon: <Flame className="w-4 h-4 text-amber-600" />,
      title: '4. Controlling Cooking Combustion',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            In urban households, deep frying, tempering spices (tadka), and dry roasting produce indoor PM2.5 concentrations exceeding{' '}
            <strong>500 to 1,000 μg/m³</strong> within minutes.
          </p>
          <ul className="text-slate-700 space-y-2 list-disc list-inside">
            <li>
              <strong>Always turn exhaust on 2 minutes before cooking:</strong> Establish an airflow draft before oil heats up.
            </li>
            <li>
              <strong>Keep lids on pans:</strong> Traps vaporized oil droplets and condensable volatile organics.
            </li>
            <li>
              <strong>Isolate the kitchen:</strong> Keep internal kitchen doors closed so smoke does not migrate into bedrooms where infants or seniors sleep.
            </li>
          </ul>
          {profile && !profile.hasKitchenExhaust && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <strong>Note:</strong> Your profile shows no kitchen exhaust. Consider propping a window open for 15 minutes after cooking and running a room purifier on High.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'hepa-sizing',
      urgency: 'high',
      icon: <ShieldCheck className="w-4 h-4 text-sky-600" />,
      title: '5. HEPA Air Purifier Sizing &amp; Placement',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Having an air purifier is only half the battle; where and how it runs dictates its real-world performance.
          </p>
          <div className="p-3 bg-sky-50/70 border border-sky-200/60 rounded-xl text-sky-950">
            <strong className="block font-bold mb-1">CADR Sizing Formula (Source: AHAM AC-1 standard):</strong>
            <p className="font-mono text-sky-800">{cadrHint}</p>
            <p className="text-[11px] text-sky-700 mt-1">
              CADR = Clean Air Delivery Rate in cubic feet per minute. This assumes 5 air changes per hour — appropriate for high smog conditions.
            </p>
          </div>
          <div className="space-y-2 text-slate-700">
            {[
              { label: 'Placement:', detail: 'At least 1 foot away from walls and curtains to maintain clear 360° air intake. Avoid hiding behind sofas.' },
              { label: 'Pre-filter Vacuuming:', detail: 'Vacuum the mesh pre-filter every 2 weeks to remove hair and coarse PM10 dust so the delicate HEPA layer lasts the entire winter.' },
              { label: 'Night Sanctuary:', detail: 'Move the purifier into the primary bedroom 30 minutes before sleep. Turn it to maximum to purge room air, then set to Sleep mode.' },
            ].map(({ label, detail }) => (
              <div key={label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-900">{label}</strong> {detail}
              </div>
            ))}
          </div>
          {hasKidsOrElderly && (
            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
              <strong>Priority Rooms:</strong> Children's bedroom and senior's room should have purifiers running continuously on auto/low during smog days.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'corsi-box',
      urgency: 'low',
      icon: <Box className="w-4 h-4 text-purple-600" />,
      title: '6. Budget Alternative: DIY Corsi-Rosenthal Box',
      content: (
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            For families without expensive branded air purifiers, open-source building science offers the{' '}
            <strong>Corsi-Rosenthal Box</strong> — a scientifically validated, high-CADR air cleaner.
          </p>
          <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-xl text-purple-950 space-y-1.5">
            <p>
              <strong>Components:</strong> 1 standard 20-inch box fan + 4 MERV 13 (or HEPA equivalent) HVAC furnace filters taped into a cube with duct tape.
            </p>
            <p>
              <strong>Performance:</strong> Peer-reviewed studies in environmental health journals prove it delivers clean air delivery rates comparable to ₹30,000+ commercial units at a fraction of the cost.
            </p>
            <p className="text-[11px] text-purple-700">
              Source: Christopherson et al., Building and Environment, 2021.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const urgencyColors: Record<GuideCard['urgency'], string> = {
    critical: 'border-t-rose-500',
    high: 'border-t-amber-500',
    medium: 'border-t-sky-500',
    low: 'border-t-purple-400',
  };

  const urgencyLabels: Record<GuideCard['urgency'], string> = {
    critical: 'Critical',
    high: 'High Priority',
    medium: 'Important',
    low: 'Helpful',
  };

  const urgencyBadgeBg: Record<GuideCard['urgency'], string> = {
    critical: 'bg-rose-100 text-rose-800 border-rose-300',
    high: 'bg-amber-100 text-amber-800 border-amber-300',
    medium: 'bg-sky-100 text-sky-800 border-sky-300',
    low: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const ackCount = guideCards.filter((c) => acknowledged[c.id]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            Evidence-Based Indoor Clean-Air Guide
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Indoor air can be 2–5× more polluted than outdoor air if poorly managed during winter smog events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{ackCount} / {guideCards.length} actions applied</span>
        </div>
      </div>

      {/* CRITICAL SAFETY SECTION: The Plant Myth Buster */}
      <Card className="border-2 border-rose-300 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-white">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200 text-rose-900">
                Scientific Myth-Buster &amp; Safety Warning
              </span>
            </div>
            <h3 className="text-base font-bold text-rose-950">
              Indoor Plants Are NOT a Substitute for Real Air Filtration
            </h3>
            <p className="text-xs text-rose-900/90 leading-relaxed">
              A widespread myth suggests that keeping snake plants, areca palms, or money plants inside will clean winter smog.{' '}
              <strong>Empirical scientific consensus from environmental engineers and building scientists conclusively proves otherwise:</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-rose-950">
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>The NASA Study Myth:</strong> The 1989 NASA study was conducted inside tiny, sealed airtight chambers on gaseous VOCs (benzene), not in open living rooms with fine particulates (PM2.5).
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Volume Inadequacy:</strong> You would need 10 to 100 plants per square metre to match the CADR of a single standard HEPA purifier.
                </span>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standard Rule: Appreciate plants for greenery, but rely on certified HEPA filtration to extract toxic PM2.5.</span>
            </div>
            <p className="text-[10px] text-rose-700">Source: Waring et al. (2019), <em>Nature Human Behaviour</em> — Potted plants do not improve indoor air quality measurably in real rooms.</p>
          </div>
        </div>
      </Card>

      {/* Guide Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideCards.map((card) => {
          const isAcked = !!acknowledged[card.id];
          return (
            <Card
              key={card.id}
              className={`space-y-3 border-t-4 ${urgencyColors[card.urgency]} transition-opacity ${isAcked ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  {card.icon}
                  <h3 dangerouslySetInnerHTML={{ __html: card.title }} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBadgeBg[card.urgency]}`}>
                    {urgencyLabels[card.urgency]}
                  </span>
                </div>
              </div>

              {card.content}

              {/* Apply / Understood toggle */}
              <div
                onClick={() => handleToggleAck(card.id)}
                className={`flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 cursor-pointer text-xs font-semibold transition-colors ${
                  isAcked ? 'text-emerald-700' : 'text-slate-500 hover:text-teal-700'
                }`}
              >
                {isAcked ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Applied &amp; Understood</span>
                    <Trash2 className="w-3 h-3 ml-auto text-slate-400 hover:text-rose-500" />
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Mark as Applied / Understood</span>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Guide acknowledgements are saved in your browser. This guide provides general environmental health information, not medical advice.
      </p>
    </div>
  );
};
