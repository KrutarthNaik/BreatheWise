import { Router, Request, Response } from 'express';
import { genAI, geminiModelName, BREATHEWISE_ASSISTANT_SYSTEM_INSTRUCTION } from '../gemini.js';

export const assistantRouter = Router();

// Basic in-memory rate limiting per client IP (30 requests per 60 seconds)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    // 1. Basic Rate Limiting
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a minute before sending another request.',
      });
    }

    // 2. Input Validation
    const { message, messages, profile, airQuality } = req.body;

    const userQuery =
      typeof message === 'string' && message.trim()
        ? message.trim()
        : Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.content || ''
        : '';

    if (!userQuery) {
      return res.status(400).json({ error: 'A valid user message is required.' });
    }

    if (userQuery.length > 2000) {
      return res.status(400).json({
        error: 'Message exceeds maximum allowed length of 2,000 characters.',
      });
    }

    // 3. Assemble Grounding Context
    const city = profile?.cityName || airQuality?.city || 'Delhi NCR';
    const coords =
      airQuality?.latitude && airQuality?.longitude
        ? `${airQuality.latitude.toFixed(3)}°N, ${airQuality.longitude.toFixed(3)}°E`
        : 'Coordinates unavailable';
    const pm25 = airQuality?.current?.pm2_5;
    const pm10 = airQuality?.current?.pm10;
    const sourceNotice = airQuality?.source || 'Open-Meteo European/US Atmospheric Dispersion Model';
    const retrievalTime = airQuality?.retrievalTimestamp || airQuality?.lastUpdated || 'Recent';

    const householdSummary = profile
      ? `Dwelling: ${profile.homeType || 'Apartment'}, Members: [${[
          profile.hasChildren ? 'Children' : null,
          profile.hasElderly ? 'Elderly (60+)' : null,
          profile.hasAsthmaOrRespiratory ? 'Asthma/Respiratory History' : null,
          profile.hasPets ? 'Pets' : null,
        ]
          .filter(Boolean)
          .join(', ') || 'No vulnerable groups declared'}], Commute: ${
          profile.commuteMode ? profile.commuteMode.replace('_', ' ') : 'Metro/Transit'
        } (${profile.commuteDurationMinutes ?? 30} mins), Cooking: ${
          profile.cookingFuel || 'LPG'
        } (Exhaust fan: ${profile.hasKitchenExhaust ? 'Yes' : 'No'}), Equipment: ${
          profile.purifierCount ?? (profile.hasAirPurifier ? 1 : 0)
        } Purifiers (HEPA: ${profile.hasHEPAFilter ? 'Yes' : 'No'}), N95 Masks: ${
          profile.hasN95Masks ? 'Stocked' : 'Not stocked'
        }`
      : 'Default urban family profile';

    const promptContext = `
CURRENT ENVIRONMENTAL CONTEXT:
- Location: ${city} (${coords})
- Current PM2.5: ${typeof pm25 === 'number' ? `${pm25} μg/m³` : 'Data currently unavailable'}
- Current PM10: ${typeof pm10 === 'number' ? `${pm10} μg/m³` : 'Data currently unavailable'}
- Data Provider: ${sourceNotice} (Note: Modelled atmospheric dispersion, NOT official CPCB ground-sensor data)
- Last Retrieved: ${retrievalTime}

USER HOUSEHOLD PROFILE:
${householdSummary}

USER'S INQUIRY:
"${userQuery}"
`;

    // 4. Demo Mode when API key is not configured
    if (!genAI) {
      const demoResponse = generateDemoStructuredResponse(userQuery, profile, airQuality);
      return res.json({
        ...demoResponse,
        demoMode: true,
        notice: 'Gemini API key is not configured in server/.env. Running on BreatheWise grounded demo mode.',
      });
    }

    // 5. Call Google Gemini via official @google/genai SDK
    try {
      const result = await genAI.models.generateContent({
        model: geminiModelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: promptContext }],
          },
        ],
        config: {
          systemInstruction: BREATHEWISE_ASSISTANT_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini model');
      }

      const parsed = JSON.parse(responseText);

      // Ensure minimal required structure exists
      const sanitized = {
        summary: parsed.summary || 'Clean-air advice based on current atmospheric conditions.',
        pollutionContext:
          parsed.pollutionContext ||
          `Current PM2.5 in ${city} is ${pm25 ?? 'N/A'} μg/m³ via Open-Meteo dispersion model.`,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [],
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        demoMode: false,
      };

      return res.json(sanitized);
    } catch (geminiError: any) {
      console.warn('Gemini API call failed, activating graceful demo fallback:', geminiError?.message);
      const fallbackData = generateDemoStructuredResponse(userQuery, profile, airQuality);
      return res.json({
        ...fallbackData,
        demoMode: true,
        errorNotice: `Gemini API query could not be completed (${geminiError?.message || 'Check API key/quota'}). Showing grounded demo response.`,
      });
    }
  } catch (err: any) {
    console.error('Unhandled error in /api/assistant/chat:', err);
    return res.status(500).json({ error: 'Internal server error processing assistant request.' });
  }
});

/**
 * High-quality grounded fallback generator matching the exact structured schema.
 */
function generateDemoStructuredResponse(query: string, profile: any, airQuality: any) {
  const q = query.toLowerCase();
  const city = profile?.cityName || airQuality?.city || 'Delhi NCR';
  const pm25 = airQuality?.current?.pm2_5 ?? 185;
  const isHigh = pm25 > 90;

  if (q.includes('plant') || q.includes('snake plant') || q.includes('areca') || q.includes('spider')) {
    return {
      summary: `Scientific consensus demonstrates that houseplants, while psychologically uplifting, do not provide measurable particulate (PM2.5/PM10) reduction in domestic living volumes during winter smog emergencies.`,
      pollutionContext: `Current modelled PM2.5 in ${city} is ${pm25} μg/m³ (Open-Meteo European/US model). At this concentration, biological absorption rates of plants are negligible compared to heavy atmospheric loading.`,
      recommendations: [
        {
          action: 'Rely on Certified H13+ HEPA Air Filtration',
          reason: 'Mechanical HEPA filters utilize dense borosilicate microfiber webs that mechanically trap 99.97% of particles down to 0.3 microns at high air exchange rates.',
          personalExposureImpact: 'Reduces indoor particulate concentration by 80% to 95% in sealed rooms.',
          communityImpact: 'Neutral (Personal protective barrier; does not alter ambient outdoor city airshed).',
          effort: 'Medium',
        },
        {
          action: 'Appreciate Houseplants for Biophilic Greenery, Not Air Scrubbing',
          reason: 'The 1989 NASA Clean Air Study examined gaseous VOCs (benzene) in tiny airtight chambers, which does not translate to fine particulate smog in homes.',
          personalExposureImpact: 'Enhances mental well-being and indoor humidity, but does not shield lung alveolar tissue.',
          communityImpact: 'Neutral',
          effort: 'Low',
        },
      ],
      precautions: [
        'Avoid over-watering indoor plants during smog episodes, as excess soil moisture in closed rooms can encourage fungal mold spores.',
        'Never replace mask-wearing or HEPA filtration with potted vegetation.',
      ],
      sources: [
        {
          title: 'Waring et al. (2019) Potted Plants Do Not Improve Indoor Air Quality',
          url: 'https://www.nature.com/articles/s41370-019-0175-9',
        },
        {
          title: 'US EPA Guide to Air Cleaners in the Home',
          url: 'https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home',
        },
      ],
    };
  }

  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk') || q.includes('workout')) {
    return {
      summary: isHigh
        ? `Outdoor cardiovascular exercise is strongly discouraged today in ${city} due to elevated fine particulates (PM2.5: ${pm25} μg/m³).`
        : `Moderate outdoor physical activity is permissible in ${city}, though avoiding peak rush-hour traffic corridors is recommended.`,
      pollutionContext: `Current PM2.5 stands at ${pm25} μg/m³ according to Open-Meteo atmospheric dispersion models (${(pm25 / 15).toFixed(1)}× above the WHO 24-hour guideline).`,
      recommendations: [
        {
          action: isHigh ? 'Transition Workouts Indoors in a Filtered Room' : 'Choose Afternoon Hours (1:00 PM – 3:30 PM) for Light Exercise',
          reason: isHigh
            ? 'Vigorous aerobic exertion multiplies breathing minute-volume by 5 to 10× and shifts breathing from nasal to mouth inhalation, sending unfiltered PM2.5 deep into alveolar tissue.'
            : 'Solar radiation expands the atmospheric boundary layer by midday, yielding lower ground-level particle concentrations than cold mornings.',
          personalExposureImpact: 'Averts acute airway hyper-reactivity, systemic vascular inflammation, and bronchial spasm.',
          communityImpact: 'Neutral (Personal exposure mitigation choice).',
          effort: 'Low',
        },
        {
          action: 'Substitute High-Intensity Cardio with Core & Mobility Training Indoors',
          reason: 'Lowers tidal breathing volume while maintaining physical fitness during winter inversion peaks.',
          personalExposureImpact: 'Maintains baseline resting inhalation rate (~6 to 8 L/min).',
          communityImpact: 'Neutral',
          effort: 'Low',
        },
      ],
      precautions: [
        'Individuals with asthma, hypertension, or ischemic heart disease must not perform outdoor physical exertion when PM2.5 exceeds 90 μg/m³.',
        'Seek emergency medical attention if experiencing chest tightness, persistent wheezing, or shortness of breath.',
      ],
      sources: [
        {
          title: 'WHO Global Air Quality Guidelines (2021)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
        },
        {
          title: 'American Heart Association Scientific Statement on Particulate Pollution',
          url: 'https://www.ahajournals.org/doi/10.1161/CIR.0b013e3181dbece1',
        },
      ],
    };
  }

  // General comprehensive clean-air response
  return {
    summary: `Based on current atmospheric conditions in ${city} (PM2.5: ${pm25} μg/m³), prioritizing personal inhalation barriers and smart ventilation will yield the greatest risk reduction for your household.`,
    pollutionContext: `Atmospheric fine particulate (PM2.5) is currently ${pm25} μg/m³ based on Open-Meteo European/US dispersion models. Thermal ground inversions trap ground-level vehicle and combustion smoke during night and morning hours.`,
    recommendations: [
      {
        action: 'Wear a Certified, Sealed N95 or FFP2 Mask During Any Transit',
        reason: 'Surgical and cloth masks allow fine sub-micron particles to bypass edges. N95 respirators provide an airtight facial seal and electrostatic filtration.',
        personalExposureImpact: 'Filters out 95%+ of fine soot and toxic particulate matter during road-level exposure.',
        communityImpact: 'Neutral (Personal protective barrier).',
        effort: 'Low',
      },
      {
        action: 'Adopt the Midday Ventilation Window (1:00 PM – 2:30 PM)',
        reason: 'Sunlight warms the ground surface and lifts the boundary layer. Airing out living spaces for just 15 minutes clears indoor CO2 without letting in peak nocturnal smog plumes.',
        personalExposureImpact: 'Prevents indoor CO2 drowsiness and stale air accumulation while minimizing PM2.5 ingress.',
        communityImpact: 'Neutral',
        effort: 'Low',
      },
      {
        action: 'Contain Cooking Combustion with Exhaust Fans & Covered Cookware',
        reason: 'Oil frying and spice tempering (tadka) generate severe indoor PM2.5 spikes often exceeding 600 μg/m³.',
        personalExposureImpact: 'Prevents acute indoor particulate accumulation in bedrooms and nursery zones.',
        communityImpact: 'Marginally reduces residential emissions through cleaner induction cooking.',
        effort: 'Medium',
      },
    ],
    precautions: [
      'Children and seniors should refrain from non-essential outdoor transit during morning inversion peaks.',
      'This guidance provides environmental exposure mitigation strategies and does not constitute medical diagnosis.',
    ],
    sources: [
      {
        title: 'WHO Factsheet on Ambient Air Quality & Health',
        url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
      },
      {
        title: 'US EPA AirNow Health Guide for Particle Pollution',
        url: 'https://www.airnow.gov/air-quality-and-health/your-health/',
      },
    ],
  };
}
