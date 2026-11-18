import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AirQualityData } from '../../types/airQuality';
import { HouseholdProfile } from '../../types/profile';
import { AssistantStructuredResponse, sendAssistantChat } from '../../services/api';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  airQuality: AirQualityData;
  profile: HouseholdProfile;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  userText?: string;
  structured?: AssistantStructuredResponse;
  timestamp: string;
  isError?: boolean;
}

const QUICK_PROMPTS = [
  'Is it safe for my child to play outdoors today?',
  'Do indoor snake plants help reduce winter smog?',
  'What commute precautions should I take on a two-wheeler?',
  'How should I position my air purifier at night?',
  'Which type of mask actually protects against PM2.5?',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  airQuality,
  profile,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      structured: {
        summary: `Hello! I am BreatheWise, your clean-air and pollution-awareness assistant. I am actively monitoring atmospheric conditions in ${
          profile.cityName || airQuality.city
        }.`,
        pollutionContext: `Current fine particulate (PM2.5) in ${
          profile.cityName || airQuality.city
        } is ${airQuality.current?.pm2_5 ?? 180} μg/m³ based on Open-Meteo European/US dispersion models.`,
        recommendations: [
          {
            action: 'Prioritize Certified N95 Filtration Outdoors',
            reason: 'Winter inversion traps diesel and combustion soot near ground level.',
            personalExposureImpact: 'Prevents fine particulates from reaching deep alveolar lung sacs.',
            communityImpact: 'Neutral (Personal protective barrier).',
            effort: 'Low',
          },
          {
            action: 'Review Your Personalized Routine & Ventilation Window',
            reason: 'Airing rooms only around midday minimizes smog ingress into living zones.',
            personalExposureImpact: 'Maintains cleaner indoor air while clearing indoor carbon dioxide.',
            communityImpact: 'Neutral',
            effort: 'Low',
          },
        ],
        precautions: [
          'Vulnerable household members (infants, asthmatics, seniors) should minimize outdoor morning exposure.',
          'BreatheWise provides environmental exposure mitigation, not medical diagnosis.',
        ],
        sources: [
          {
            title: 'WHO Ambient Air Quality Guidelines',
            url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health',
          },
        ],
        demoMode: false,
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (text.length > 2000) {
      alert('Message exceeds maximum limit of 2,000 characters.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: 'user',
      userText: text,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLastFailedText(null);

    try {
      const response = await sendAssistantChat({
        message: text,
        profile,
        airQuality,
      });

      const assistantMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        structured: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setLastFailedText(text);
      const errorMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        structured: {
          summary: 'Unable to communicate with the BreatheWise server at this moment.',
          pollutionContext: 'Connection or timeout issue.',
          recommendations: [],
          precautions: ['Please check that the backend server is running on port 5000 and try again.'],
          sources: [],
          demoMode: true,
          errorNotice: err?.message || 'Network error',
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-sky-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">BreatheWise Clean-Air Advisor</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500">
                Grounded with {profile.cityName} • PM2.5: {airQuality.current?.pm2_5 ?? 180} μg/m³
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex items-start gap-2.5 flex-row-reverse">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1 max-w-[85%] text-right">
                    <div className="p-3.5 rounded-2xl bg-sky-600 text-white text-xs leading-relaxed rounded-tr-none shadow-sm text-left whitespace-pre-wrap">
                      {msg.userText}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono pr-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            const struct = msg.structured;
            if (!struct) return null;

            return (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0 text-xs mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-3 max-w-[92%] flex-1">
                  {/* Assistant Response Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3 text-xs">
                    {/* Top status bar (Demo badge or Active notice) */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        Clean-Air Synthesis
                      </span>

                      {struct.demoMode ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Demo Mode (No API Key)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Gemini 2.5 Active
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    <p className="text-slate-800 leading-relaxed font-medium text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      {struct.summary}
                    </p>

                    {/* Pollution Context Callout */}
                    {struct.pollutionContext && (
                      <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-sky-950 flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Pollution Context:</strong> {struct.pollutionContext}
                        </span>
                      </div>
                    )}

                    {/* Actionable Recommendations List */}
                    {struct.recommendations && struct.recommendations.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Tailored Action Recommendations
                        </h4>

                        <div className="space-y-2">
                          {struct.recommendations.map((rec, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-bold text-xs text-slate-900 leading-snug">
                                  {rIdx + 1}. {rec.action}
                                </h5>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                                    rec.effort === 'Low'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : rec.effort === 'Medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {rec.effort} Effort
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 leading-relaxed">{rec.reason}</p>

                              {/* Dual Impact Metrics */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div className="p-2 rounded-lg bg-sky-50/90 border border-sky-100 text-sky-950 flex items-start gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="block text-[10px] uppercase tracking-wider text-sky-700">
                                      Personal Shield
                                    </strong>
                                    <span>{rec.personalExposureImpact}</span>
                                  </div>
                                </div>

                                <div className="p-2 rounded-lg bg-emerald-50/90 border border-emerald-100 text-emerald-950 flex items-start gap-1.5">
                                  <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="block text-[10px] uppercase tracking-wider text-emerald-700">
                                      Community Impact
                                    </strong>
                                    <span>{rec.communityImpact}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Precautions Callout */}
                    {struct.precautions && struct.precautions.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Safety Precautions & Medical Boundary</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-900/90">
                          {struct.precautions.map((p, pIdx) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Verified Evidence Sources */}
                    {struct.sources && struct.sources.length > 0 && (
                      <div className="pt-1 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-400">Sources:</span>
                        {struct.sources.map((src, sIdx) =>
                          src.url ? (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span key={sIdx}>{src.title}</span>
                          )
                        )}
                      </div>
                    )}

                    {/* Error Note if any */}
                    {struct.errorNotice && (
                      <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {struct.errorNotice}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono pl-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading State */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-600 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                <span>BreatheWise is analyzing live pollution data and household profile...</span>
              </div>
            </div>
          )}

          {/* Retry Button if last message failed */}
          {lastFailedText && !loading && (
            <div className="flex justify-center">
              <button
                onClick={() => handleSend(lastFailedText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs hover:bg-rose-100 transition-all shadow-sm"
              >
                <RotateCcw className="w-3 h-3 text-rose-600" />
                <span>Retry sending: "{lastFailedText.slice(0, 30)}..."</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> Suggested Inquiries:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-[11px] bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 text-slate-600 px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                maxLength={2000}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about outdoor risks, purifiers, commutes, or masks..."
                className="w-full text-xs px-3.5 py-2.5 pr-14 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              {input.length > 0 && (
                <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono">
                  {input.length}/2000
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold disabled:opacity-50 hover:from-sky-700 hover:to-teal-700 transition-all shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            Environmental exposure guidance only. Not a medical diagnosis or treatment plan.
          </p>
        </div>
      </div>
    </div>
  );
};
