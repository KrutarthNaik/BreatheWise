import { Router, Request, Response } from 'express';
import { genAI, BREATHEWISE_SYSTEM_INSTRUCTION } from '../gemini.js';

export const advisorRouter = Router();

advisorRouter.post('/routine', async (req: Request, res: Response) => {
  try {
    const { profile, airQuality } = req.body;
    const pm25 = airQuality?.current?.pm2_5 ?? 180;
    const city = profile?.cityName || airQuality?.city || 'Delhi NCR';

    if (genAI) {
      const prompt = `
Generate a structured daily clean-air routine in valid JSON for:
- Location: ${city}
- PM2.5: ${pm25} μg/m³ (Data source: Open-Meteo dispersion model, not CPCB)
- Household: ${JSON.stringify(profile || {})}

Return ONLY a raw JSON object with this exact schema:
{
  "date": "Today",
  "location": "${city}",
  "severityLevel": "High Smog Alert",
  "overallAdvisory": "string summary",
  "slots": {
    "morning": {
      "timeRange": "06:00 AM – 11:00 AM",
      "slotName": "Morning",
      "icon": "SunDim",
      "summary": "string",
      "commuteAdvice": "string",
      "ventilationAdvice": "string",
      "indoorPurifierAdvice": "string",
      "outdoorVulnerabilityAlert": "string or null",
      "actionChecklist": ["action 1", "action 2", "action 3"]
    },
    "afternoon": {
      "timeRange": "11:00 AM – 04:30 PM",
      "slotName": "Afternoon",
      "icon": "Sun",
      "summary": "string",
      "commuteAdvice": "string",
      "ventilationAdvice": "string",
      "indoorPurifierAdvice": "string",
      "outdoorVulnerabilityAlert": "string or null",
      "actionChecklist": ["action 1", "action 2", "action 3"]
    },
    "evening": {
      "timeRange": "05:00 PM – 10:30 PM",
      "slotName": "Evening",
      "icon": "Moon",
      "summary": "string",
      "commuteAdvice": "string",
      "ventilationAdvice": "string",
      "indoorPurifierAdvice": "string",
      "outdoorVulnerabilityAlert": "string or null",
      "actionChecklist": ["action 1", "action 2", "action 3"]
    }
  }
}
`;

      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: BREATHEWISE_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ routine: parsed });
        }
      } catch (geminiError) {
        console.warn('Gemini routine generation fallback triggered:', geminiError);
      }
    }

    // Default grounded fallback if no key or error
    const fallbackRoutine = getFallbackRoutine(profile, airQuality);
    return res.json({ routine: fallbackRoutine });
  } catch (err: any) {
    console.error('Advisor routine route error:', err);
    return res.status(500).json({ error: 'Failed to generate advisory routine' });
  }
});

function getFallbackRoutine(profile: any, airQuality: any) {
  const pm25 = airQuality?.current?.pm2_5 ?? 190;
  const city = profile?.cityName || airQuality?.city || 'Delhi';
  const isSevere = pm25 > 120;

  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    location: city,
    severityLevel: isSevere ? 'High Smog Alert' : 'Moderate Smog Alert',
    overallAdvisory: isSevere
      ? `Severe particulate accumulation in ${city}. Winter nocturnal inversion trapping pollution near ground level.`
      : `Moderate particulate accumulation in ${city}. Practice timed ventilation and wear an N95 mask outdoors.`,
    slots: {
      morning: {
        timeRange: '06:00 AM – 11:00 AM',
        slotName: 'Morning',
        icon: 'SunDim',
        summary: 'Nocturnal inversion layer traps toxic particles at street level.',
        commuteAdvice: profile?.commuteMode === 'two_wheeler' || profile?.commuteMode === 'open_auto'
          ? 'High exposure risk on open transport. Wear a certified N95 mask with an airtight nose-pinch seal.'
          : 'Roll car windows up and set AC to internal air recirculation mode.',
        ventilationAdvice: 'Keep all windows tightly closed. Morning air has the highest particulate density.',
        indoorPurifierAdvice: 'Operate air purifiers in occupied living rooms on Medium/High.',
        outdoorVulnerabilityAlert: (profile?.hasChildren || profile?.hasElderly)
          ? 'Children and elderly must avoid outdoor morning walks, runs, or school sports.'
          : undefined,
        actionChecklist: [
          'Pre-check N95 respirator fit before stepping outside',
          'Turn on kitchen exhaust fan while cooking breakfast',
          'Keep home exterior doors shut',
        ],
      },
      afternoon: {
        timeRange: '11:00 AM – 04:30 PM',
        slotName: 'Afternoon',
        icon: 'Sun',
        summary: 'Sunlight warms the ground, raising the atmospheric boundary layer and dispersing smog.',
        commuteAdvice: 'Lowest particulate concentration window for running essential outdoor errands.',
        ventilationAdvice: pm25 < 150
          ? 'A brief 15–20 minute window opening is permissible around 1:30 PM to flush built-up CO2.'
          : 'Keep windows cracked minimally if indoor air feels stale; otherwise maintain filtration.',
        indoorPurifierAdvice: 'Purifiers can run on Auto mode to optimize filter life and power.',
        outdoorVulnerabilityAlert: undefined,
        actionChecklist: [
          'Brief midday room airing if CO2 or humidity is high',
          'Wipe dusty surfaces with a damp cloth (avoid dry brooming which kicks up PM10)',
          'Drink warm fluids to maintain airway hydration',
        ],
      },
      evening: {
        timeRange: '05:00 PM – 10:30 PM',
        slotName: 'Evening',
        icon: 'Moon',
        summary: 'Atmosphere cools rapidly, trapping vehicle exhaust and evening cooking smoke.',
        commuteAdvice: 'Rush hour traffic combined with sinking cold air creates heavy smog. Use an N95 mask.',
        ventilationAdvice: 'Seal all windows by 5:00 PM to lock out descending smog plumes.',
        indoorPurifierAdvice: 'Move purifier to bedrooms 30 minutes before bedtime and run on High, then switch to Sleep mode.',
        outdoorVulnerabilityAlert: (profile?.hasChildren || profile?.hasElderly)
          ? 'Children should play indoors in a filtered room rather than outside after 5:30 PM.'
          : undefined,
        actionChecklist: [
          'Use kitchen exhaust fan during dinner preparation',
          'Pre-filter bedroom before sleep',
          'Rinse face and eyes after returning from outside',
        ],
      },
    },
  };
}
