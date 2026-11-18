import { Router, Request, Response } from 'express';
import { genAI, BREATHEWISE_SYSTEM_INSTRUCTION } from '../gemini.js';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, profile, airQuality } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // Context grounding string
    const contextPrompt = `
CURRENT ENVIRONMENTAL CONTEXT:
- City/Location: ${profile?.cityName || airQuality?.city || 'Delhi NCR'}
- Current PM2.5: ${airQuality?.current?.pm2_5 ?? 'Unknown'} μg/m³
- Current PM10: ${airQuality?.current?.pm10 ?? 'Unknown'} μg/m³
- Data Source: Open-Meteo Atmospheric Dispersion Model (Not official CPCB reading)
- Last Updated: ${airQuality?.lastUpdated || 'Recent'}

HOUSEHOLD PROFILE:
- Home Type: ${profile?.homeType || 'Apartment'}
- Vulnerable Members: ${[
      profile?.hasChildren ? 'Children' : null,
      profile?.hasElderly ? 'Elderly' : null,
      profile?.hasAsthmaOrRespiratory ? 'Asthma/Respiratory History' : null,
    ].filter(Boolean).join(', ') || 'None declared'}
- Commute Mode: ${profile?.commuteMode || 'Metro/Public transit'} (${profile?.commuteDurationMinutes || 30} mins)
- Cooking Fuel: ${profile?.cookingFuel || 'LPG'} (Exhaust fan: ${profile?.hasKitchenExhaust ? 'Yes' : 'No'})
- Equipment: Air Purifiers: ${profile?.purifierCount || 0} (HEPA: ${profile?.hasHEPAFilter ? 'Yes' : 'No'}), N95 Masks: ${profile?.hasN95Masks ? 'Yes' : 'No'}

USER QUERY:
"${lastMessage}"
`;

    if (!genAI) {
      // Graceful offline mock response if GEMINI_API_KEY is not set yet
      return res.json({
        reply: getMockAdvisorReply(lastMessage, profile, airQuality),
        isMock: true,
        notice: 'Gemini API key not detected in server/.env. Running on local grounded advisor engine.',
      });
    }

    // Call Gemini 2.5 Flash
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: contextPrompt }],
        },
      ],
      config: {
        systemInstruction: BREATHEWISE_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const reply = response.text || 'I could not generate a response at this moment.';
    return res.json({ reply, isMock: false });
  } catch (err: any) {
    console.error('Error calling Gemini API:', err);
    // Graceful fallback
    return res.json({
      reply: getMockAdvisorReply(req.body.messages?.[req.body.messages.length - 1]?.content || '', req.body.profile, req.body.airQuality),
      isMock: true,
      errorNotice: err?.message || 'Gemini API call failed, fallback used.',
    });
  }
});

function getMockAdvisorReply(query: string, profile: any, airQuality: any): string {
  const q = query.toLowerCase();
  const pm25 = airQuality?.current?.pm2_5 ?? 195;
  const city = profile?.cityName || airQuality?.city || 'Delhi';

  if (q.includes('plant') || q.includes('snake plant') || q.includes('areca')) {
    return `🌱 **Regarding Houseplants & Severe Smog:**\n\nWhile indoor plants provide biophilic and aesthetic benefits, **scientific experiments show they do not measurably clear particulate matter (PM2.5 or PM10)** in typical household volumes.\n\nTo safeguard your family in ${city}, prioritize **certified H13 HEPA air purifiers** and sealed windows during inversion peaks.`;
  }

  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('workout')) {
    return `⚠️ **Exercise Advisory for ${city} (Current PM2.5: ${pm25} μg/m³):**\n\nOutdoor cardiovascular exertion is **not recommended** today. Heavy breathing pulls fine particulates deep into your lower airways and bloodstream.\n\n*Safe alternative:* Exercise indoors in a closed room with a HEPA purifier operating on high.`;
  }

  return `Based on current modelled conditions in **${city}** (PM2.5: **${pm25} μg/m³** from Open-Meteo):\n\n1. **Personal Exposure Defense:** Wear a properly fitted N95 respirator during outdoor transit.\n2. **Indoor Air Management:** Keep windows closed during early morning inversion peaks. Run your air purifier in the primary living space.\n3. **Safety Note:** This is environmental exposure guidance, not a medical diagnosis. For health symptoms, consult a medical practitioner.`;
}
