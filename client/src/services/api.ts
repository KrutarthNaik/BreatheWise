import { AirQualityData } from '../types/airQuality';
import { HouseholdProfile } from '../types/profile';
import { DailyPersonalizedRoutine } from '../types/routine';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantRecommendation {
  action: string;
  reason: string;
  personalExposureImpact: string;
  communityImpact: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface AssistantSource {
  title: string;
  url?: string;
}

export interface AssistantStructuredResponse {
  summary: string;
  pollutionContext: string;
  recommendations: AssistantRecommendation[];
  precautions: string[];
  sources: AssistantSource[];
  demoMode?: boolean;
  notice?: string;
  errorNotice?: string;
}

export interface AssistantChatRequest {
  message: string;
  messages?: ChatMessage[];
  profile?: HouseholdProfile;
  airQuality?: AirQualityData;
}

export interface AdvisorRequest {
  profile: HouseholdProfile;
  airQuality: AirQualityData;
}

export interface ChatRequest {
  messages: ChatMessage[];
  profile?: HouseholdProfile;
  airQuality?: AirQualityData;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Sends a query to the BreatheWise Gemini assistant backend (/api/assistant/chat).
 */
export async function sendAssistantChat(
  request: AssistantChatRequest
): Promise<AssistantStructuredResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with HTTP ${res.status}`);
    }

    const data: AssistantStructuredResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Backend /api/assistant/chat failed or unreachable, activating client demo fallback:', err);
    return getClientFallbackAssistantResponse(request, err?.message);
  }
}

/**
 * Legacy plain-text chat endpoint wrapper for backwards compatibility.
 */
export async function sendChatMessage(request: ChatRequest): Promise<string> {
  try {
    const lastMsg = request.messages[request.messages.length - 1]?.content || '';
    const structured = await sendAssistantChat({
      message: lastMsg,
      messages: request.messages,
      profile: request.profile,
      airQuality: request.airQuality,
    });
    return structured.summary;
  } catch (err: any) {
    console.warn('Backend chat API failed, using fallback:', err);
    return 'Unable to fetch response from assistant.';
  }
}

export async function fetchPersonalizedRoutine(request: AdvisorRequest): Promise<DailyPersonalizedRoutine> {
  try {
    const res = await fetch(`${API_BASE}/api/advisor/routine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Advisor API error: ${res.status}`);
    }

    const data = await res.json();
    return data.routine;
  } catch (err) {
    console.warn('Backend routine API unavailable, generating local grounded routine:', err);
    return generateLocalGroundedRoutine(request.profile, request.airQuality);
  }
}

function getClientFallbackAssistantResponse(
  request: AssistantChatRequest,
  errorMessage?: string
): AssistantStructuredResponse {
  const q = request.message.toLowerCase();
  const city = request.profile?.cityName || request.airQuality?.city || 'Delhi NCR';
  const pm25 = request.airQuality?.current?.pm2_5 ?? 185;

  if (q.includes('plant') || q.includes('snake plant') || q.includes('areca') || q.includes('spider')) {
    return {
      summary: `Scientific consensus demonstrates that houseplants, while aesthetically pleasing, do not provide measurable particulate (PM2.5/PM10) reduction in domestic living volumes during winter smog episodes.`,
      pollutionContext: `Current PM2.5 in ${city} is ${pm25} μg/m³ (Open-Meteo European/US model). Household biological absorption is dwarfed by ambient winter particle concentrations.`,
      recommendations: [
        {
          action: 'Rely on Certified H13+ HEPA Air Filtration',
          reason: 'Mechanical HEPA filters utilize dense microfiber media that capture 99.97% of particles down to 0.3 microns at high air volume throughput.',
          personalExposureImpact: 'Removes 80% to 95% of fine particles from bedroom and living areas.',
          communityImpact: 'Neutral (Personal protective barrier; does not clean outdoor ambient city air).',
          effort: 'Medium',
        },
        {
          action: 'Keep Potted Plants for Biophilic Well-being, Not Smog Extraction',
          reason: 'The 1989 NASA Clean Air Study measured gaseous VOCs in tiny closed chambers, not particulate matter in open rooms.',
          personalExposureImpact: 'Supports emotional well-being without reducing inhaled particulate load.',
          communityImpact: 'Neutral',
          effort: 'Low',
        },
      ],
      precautions: [
        'Avoid over-watering indoor planters during smog events to prevent excess humidity and mold spore growth in sealed spaces.',
      ],
      sources: [
        {
          title: 'Waring et al. (2019) Potted Plants Do Not Improve Indoor Air Quality',
          url: 'https://www.nature.com/articles/s41370-019-0175-9',
        },
      ],
      demoMode: true,
      errorNotice: errorMessage ? `Backend connection note: ${errorMessage}` : undefined,
    };
  }

  return {
    summary: `Based on current conditions in ${city} (PM2.5: ${pm25} μg/m³), prioritize certified N95 respirators for outdoor transit and keep purifiers running in sealed bedrooms.`,
    pollutionContext: `Current atmospheric fine particulate (PM2.5) is ${pm25} μg/m³ via Open-Meteo dispersion model (${(pm25 / 15).toFixed(1)}× above the WHO 24-hr guideline).`,
    recommendations: [
      {
        action: 'Wear a Well-Fitted N95/FFP2 Respirator Outdoors',
        reason: 'Cloth and surgical masks have perimeter leakage. N95 masks provide tight facial sealing against sub-micron particles.',
        personalExposureImpact: 'Barricades toxic particulates from reaching deep lower alveolar airways.',
        communityImpact: 'Neutral (Personal protective barrier).',
        effort: 'Low',
      },
      {
        action: 'Restrict Natural Ventilation to the Midday Window (1:00 PM – 2:30 PM)',
        reason: 'Midday solar warming expands the atmospheric boundary layer, dispersing the nocturnal inversion blanket.',
        personalExposureImpact: 'Clears accumulated indoor carbon dioxide without admitting dense early-morning soot plumes.',
        communityImpact: 'Neutral',
        effort: 'Low',
      },
      {
        action: 'Operate Kitchen Exhaust During All Cooking Sessions',
        reason: 'Oil frying and spice tempering release ultra-fine particulate matter that quickly migrates across living spaces.',
        personalExposureImpact: 'Prevents acute indoor particulate accumulation in bedrooms.',
        communityImpact: 'Minor source reduction through efficient induction cooking.',
        effort: 'Medium',
      },
    ],
    precautions: [
      'Children and seniors should suspend morning outdoor exercise during cold smog inversion peaks.',
      'This guidance provides environmental exposure mitigation strategies and is not a medical diagnosis.',
    ],
    sources: [
      {
        title: 'WHO Global Air Quality Guidelines',
        url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
      },
      {
        title: 'US EPA AirNow Health Guide for Particle Pollution',
        url: 'https://www.airnow.gov/air-quality-and-health/your-health/',
      },
    ],
    demoMode: true,
    errorNotice: errorMessage ? `Backend connection note: ${errorMessage}` : undefined,
  };
}

export function generateLocalGroundedRoutine(
  profile: HouseholdProfile,
  aq: AirQualityData
): DailyPersonalizedRoutine {
  const pm25 = aq.current?.pm2_5 ?? 150;
  const isSevere = pm25 > 120;
  const hasKidsOrElderly = profile.hasChildren || profile.hasElderly || profile.hasAsthmaOrRespiratory;
  const hasIndoorSmoke = profile.hasIncenseBurning || profile.hasIndoorSmoking;

  // --- Forecast-derived safer window ---
  const hourlyPm25: number[] = aq.hourly?.pm2_5 ?? [];
  const hourlyTimes: string[] = aq.hourly?.time ?? [];
  let saferWindowStr: string | undefined;

  if (hourlyPm25.length >= 24 && hourlyTimes.length >= 24) {
    // Find the minimum PM2.5 hour among the next 24 entries
    let minVal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < Math.min(24, hourlyPm25.length); i++) {
      const v = hourlyPm25[i];
      if (typeof v === 'number' && v < minVal) {
        minVal = v;
        minIdx = i;
      }
    }
    if (minIdx >= 0 && minVal < pm25) {
      const rawTime = hourlyTimes[minIdx];
      const dt = new Date(rawTime);
      const hour = dt.getHours();
      const fmtHour = (h: number) => {
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:00 ${suffix}`;
      };
      saferWindowStr = `${fmtHour(hour)}–${fmtHour(hour + 1)} (forecast PM2.5 ≈ ${minVal.toFixed(0)} μg/m³)`;
    }
  }

  // Commute timing label
  const commuteTimingLabel: Record<HouseholdProfile['commuteTiming'], string> = {
    early_morning: 'early morning (5–7 AM)',
    morning: 'morning (7–9 AM)',
    midday: 'midday (11 AM–1 PM)',
    evening: 'evening (5–8 PM)',
    night: 'night (8 PM–midnight)',
    flexible: 'flexible hours',
  };
  const timingLabel = commuteTimingLabel[profile.commuteTiming ?? 'morning'];

  // High-exposure commute modes
  const highExposureModes = ['two_wheeler', 'open_auto', 'walking_cycling'];
  const isHighExposureCommute = highExposureModes.includes(profile.commuteMode);

  // CADR sizing hint
  let purifierHint = profile.hasAirPurifier
    ? 'Switch purifier to High in living room / kitchen area before breakfast.'
    : 'Keep inner doors shut to trap filtered air in bedroom sanctuary.';
  if (profile.hasAirPurifier && profile.roomSizeSqft) {
    const cadr = Math.ceil(profile.roomSizeSqft * 1.55);
    purifierHint += ` CADR guidance: your ${profile.roomSizeSqft} sq ft room needs ≥${cadr} CFM (Source: AHAM AC-1 standard).`;
  }

  // Indoor smoke warning
  const indoorSmokeWarning = hasIndoorSmoke
    ? `Your profile indicates indoor smoke sources${profile.hasIncenseBurning ? ' (incense/agarbatti)' : ''}${profile.hasIndoorSmoking ? ' (tobacco smoke)' : ''}. These create acute indoor PM2.5 spikes — avoid use during high outdoor pollution days and always run kitchen exhaust or open a window briefly after.`
    : undefined;

  // Morning commute advisory
  const morningCommuteAdvice =
    isHighExposureCommute
      ? `Your commute mode (${profile.commuteMode.replace(/_/g, ' ')}) at ${timingLabel} offers minimal respiratory protection. Wear an airtight N95/FFP2 mask without exception. Avoid breathing through an open mouth at traffic signals.`
      : profile.commuteMode === 'wfh'
      ? 'Working from home — no morning transit exposure. Focus on indoor air quality during meal preparation.'
      : `For ${profile.commuteMode.replace(/_/g, ' ')} during ${timingLabel}, keep windows/doors rolled up with AC on internal recirculation mode.`;

  // If commuteTiming is early_morning, escalate the morning warning
  const earlyMorningAlert =
    profile.commuteTiming === 'early_morning' && isHighExposureCommute
      ? 'Early morning commuters face the worst particulate conditions — smog is densest before sunrise. N95 respirator is critical.'
      : undefined;

  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    location: profile.cityName,
    severityLevel: isSevere ? 'High Smog Alert' : 'Moderate Smog Warning',
    overallAdvisory: isSevere
      ? `Severe winter atmospheric inversion layer trapped particulates in ${profile.cityName}. High exposure risk during morning and evening rush hours.`
      : `Moderate particulate accumulation in ${profile.cityName}. Practice smart window management and wear masks on busy roads.`,
    slots: {
      morning: {
        timeRange: '06:00 AM – 11:00 AM',
        slotName: 'Morning',
        icon: 'SunDim',
        summary: 'Peak nocturnal smog trapping and low boundary layer.',
        commuteAdvice: morningCommuteAdvice,
        ventilationAdvice: 'Keep all exterior windows tightly shut. Smog concentrates near ground level in early morning cold air.',
        indoorPurifierAdvice: purifierHint,
        saferTimeWindow: saferWindowStr,
        indoorSmokeWarning,
        outdoorVulnerabilityAlert:
          earlyMorningAlert ??
          (hasKidsOrElderly
            ? 'Vulnerable family members (children, seniors, or asthmatics) must avoid morning outdoor play or walks.'
            : undefined),
        actionChecklist: [
          'Pre-check N95 mask seal before stepping outside',
          'Ensure exhaust fan is ON while preparing morning meals',
          'Keep bedroom air purifier running on sleep/auto',
          ...(hasIndoorSmoke ? ['Do not burn incense or smoke indoors — open a window + run exhaust for 15 mins instead'] : []),
        ],
      },
      afternoon: {
        timeRange: '11:00 AM – 04:30 PM',
        slotName: 'Afternoon',
        icon: 'Sun',
        summary: 'Solar heating lifts the atmospheric boundary layer; lowest daily PM2.5 window.',
        commuteAdvice:
          profile.commuteTiming === 'midday'
            ? `Midday is the safest commute window for most city areas. ${isHighExposureCommute ? 'Still wear an N95 on busy roads.' : 'Keep vehicle windows closed in traffic.'}`
            : 'Safest time of the day for errands or transit if necessary.',
        ventilationAdvice:
          pm25 < 150
            ? 'Quick cross-ventilation window (15–20 minutes) permitted around 1:30 PM to clear built-up indoor CO₂ and cooking moisture.'
            : 'Keep windows cracked slightly only if indoor stuffiness is high; otherwise maintain filtration.',
        indoorPurifierAdvice: 'Purifiers can run on Auto or Medium mode to conserve energy.',
        saferTimeWindow: saferWindowStr,
        outdoorVulnerabilityAlert: undefined,
        actionChecklist: [
          'Brief 15-min airing out between 1:00 PM and 2:30 PM if needed',
          'Wipe window sills and flat surfaces with a damp microfiber cloth to pick up settled soot',
          'Stay hydrated to keep respiratory mucous membranes moist',
        ],
      },
      evening: {
        timeRange: '05:00 PM – 10:30 PM',
        slotName: 'Evening',
        icon: 'Moon',
        summary: 'Cooling ground causes smog to descend again; dinner cooking creates indoor PM spikes.',
        commuteAdvice:
          profile.commuteTiming === 'evening' || profile.commuteTiming === 'night'
            ? `Your ${timingLabel} commute coincides with worsening smog and traffic emissions. ${isHighExposureCommute ? 'N95 respirator is mandatory — evening inversion is building.' : 'Keep vehicle cabin fully sealed and use AC recirculation.'}`
            : 'Evening rush hour traffic combines with cooling air. Wear an N95 mask during home commute.',
        ventilationAdvice: 'Seal all windows before sunset (around 5:30 PM) to lock out incoming evening smog plume.',
        indoorPurifierAdvice: 'Move air purifier to main sleeping area 30 minutes before sleep and run on High to scrub air.',
        saferTimeWindow: saferWindowStr,
        indoorSmokeWarning,
        outdoorVulnerabilityAlert: hasKidsOrElderly
          ? 'Children outdoor sports after 5:30 PM should be moved indoors.'
          : undefined,
        actionChecklist: [
          'Operate kitchen exhaust fan on maximum during evening tadka or frying',
          'Seal doors and run bedroom air purifier before turning in',
          'Clean nose and face with fresh water after arriving home from commute',
          ...(hasIndoorSmoke ? ['Avoid incense or tobacco smoke indoors — peak evening smog makes indoor sources especially harmful'] : []),
        ],
      },
    },
  };
}
