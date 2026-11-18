import React from 'react';
import { Wind, MapPin, Home, Calendar, BookOpen, BarChart3, MessageSquare } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cityName: string;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cityName,
  onOpenAssistant,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Wind },
    { id: 'routine', label: 'Daily Routine', icon: Calendar },
    { id: 'profile', label: 'Household Profile', icon: Home },
    { id: 'guide', label: 'Indoor Air Guide', icon: BookOpen },
    { id: 'impact', label: 'Impact Tracker', icon: BarChart3 },
  ];

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-[37px] z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-800 to-teal-700 bg-clip-text text-transparent">
                  BreatheWise
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Hackathon MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Clean-air intelligence for winter smog resilience</p>
            </div>
          </div>

          {/* Active Location Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Active City:</span>
            <strong className="text-slate-900">{cityName}</strong>
          </div>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/70 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Assistant Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sm shadow-sky-600/25 transition-all transform active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Gemini Advisor</span>
              <span className="sm:hidden">Advisor</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
