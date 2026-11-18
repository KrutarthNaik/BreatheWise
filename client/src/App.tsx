import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Header } from './components/common/Header';
import { SearchLocation } from './components/dashboard/SearchLocation';
import { AQIGaugeCard } from './components/dashboard/AQIGaugeCard';
import { HourlyAQIChart } from './components/dashboard/HourlyAQIChart';
import { QuickRecommendations } from './components/dashboard/QuickRecommendations';
import { HouseholdForm } from './components/profile/HouseholdForm';
import { DailyRoutineCard } from './components/routine/DailyRoutineCard';
import { IndoorGuide } from './components/guide/IndoorGuide';
import { ImpactTracker } from './components/impact/ImpactTracker';
import { ChatDrawer } from './components/assistant/ChatDrawer';
import { fetchAirQuality, getFallbackAirQuality } from './services/openMeteo';
import { getStoredProfile, getStoredImpactLogs } from './services/storage';
import { generateLocalGroundedRoutine, fetchPersonalizedRoutine } from './services/api';
import { AirQualityData } from './types/airQuality';
import { HouseholdProfile } from './types/profile';
import { DailyPersonalizedRoutine } from './types/routine';
import { ImpactActionLog } from './types/impact';
import { Loader2, Sparkles, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<HouseholdProfile>(getStoredProfile());
  const [airQuality, setAirQuality] = useState<AirQualityData>(() =>
    getFallbackAirQuality(profile.cityName, profile.latitude, profile.longitude)
  );
  const [routine, setRoutine] = useState<DailyPersonalizedRoutine>(() =>
    generateLocalGroundedRoutine(profile, airQuality)
  );
  const [impactLogs, setImpactLogs] = useState<ImpactActionLog[]>(() => getStoredImpactLogs());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [loadingAQ, setLoadingAQ] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRefreshingRoutine, setIsRefreshingRoutine] = useState<boolean>(false);

  // Initial air quality load
  useEffect(() => {
    loadAQData(profile.latitude, profile.longitude, profile.cityName);
  }, []);

  const loadAQData = async (
    lat: number,
    lon: number,
    cityName: string,
    stateCountry?: string,
    options?: { forceRefresh?: boolean }
  ) => {
    setLoadingAQ(!airQuality);
    setIsRefreshing(true);
    setApiError(null);

    try {
      const data = await fetchAirQuality(lat, lon, cityName, stateCountry, options);
      setAirQuality(data);
      // Synchronize daily routine with updated environmental air data
      setRoutine(generateLocalGroundedRoutine(profile, data));
    } catch (e: any) {
      console.warn('Open-Meteo Air Quality fetch failed:', e);
      setApiError(e?.message || 'Unable to connect to Open-Meteo Air Quality servers.');
    } finally {
      setLoadingAQ(false);
      setIsRefreshing(false);
    }
  };

  const handleLocationSelect = (lat: number, lon: number, cityName: string, stateCountry?: string) => {
    const updatedProfile = { ...profile, cityName, latitude: lat, longitude: lon };
    setProfile(updatedProfile);
    loadAQData(lat, lon, cityName, stateCountry);
  };

  const handleProfileUpdated = (updated: HouseholdProfile) => {
    setProfile(updated);
    setRoutine(generateLocalGroundedRoutine(updated, airQuality));
  };

  const handleRefreshLive = () => {
    loadAQData(profile.latitude, profile.longitude, profile.cityName, undefined, { forceRefresh: true });
  };

  const handleLoadDemoFallback = () => {
    const fallback = getFallbackAirQuality(profile.cityName, profile.latitude, profile.longitude);
    setAirQuality(fallback);
    setRoutine(generateLocalGroundedRoutine(profile, fallback));
    setApiError(null);
  };

  const handleRefreshRoutine = async () => {
    setIsRefreshingRoutine(true);
    try {
      const newRoutine = await fetchPersonalizedRoutine({ profile, airQuality });
      setRoutine(newRoutine);
    } catch (err) {
      console.error('Routine refresh error:', err);
    } finally {
      setIsRefreshingRoutine(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Scientific & Medical Disclaimer */}
      <DisclaimerBanner />

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cityName={profile.cityName}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Primary Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search Location Bar with Geolocation & Quick Presets */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <SearchLocation
                currentCity={profile.cityName}
                onSelectLocation={handleLocationSelect}
                onLoadDemoSimulation={handleLoadDemoFallback}
                isDemoActive={airQuality.isFallback}
              />
            </div>

            {/* API Error State with Retry & Demo Fallback Options */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Air Quality API Request Error</h4>
                    <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
                      {apiError}. You can retry the live connection or inspect representative sample winter smog data.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={handleRefreshLive}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-900 font-bold text-xs hover:bg-rose-100/50 transition-all shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-rose-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Retry Connection</span>
                  </button>

                  <button
                    onClick={handleLoadDemoFallback}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Sample Smog Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loadingAQ && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-sky-700 text-sm font-semibold bg-white rounded-2xl border border-slate-200/70 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                <p>Retrieving real-time atmospheric dispersion models from Open-Meteo...</p>
                <span className="text-xs text-slate-400 font-normal">Resolving PM2.5, PM10, NO₂, and O₃ concentrations</span>
              </div>
            )}

            {!loadingAQ && (
              <>
                {/* Hero Metric Card, Coordinates, Attribution & Limitations */}
                <AQIGaugeCard
                  data={airQuality}
                  onRefresh={handleRefreshLive}
                  isRefreshing={isRefreshing}
                />

                {/* Quick Immediate Action Cards */}
                <QuickRecommendations data={airQuality} />

                {/* 24-Hour Diurnal Projection with Multi-Pollutant Selector */}
                <HourlyAQIChart hourly={airQuality.hourly} />
              </>
            )}
          </div>
        )}

        {/* TAB 2: DAILY ROUTINE */}
        {activeTab === 'routine' && (
          <div className="animate-fadeIn">
            <DailyRoutineCard
              routine={routine}
              onRefreshRoutine={handleRefreshRoutine}
              isRefreshing={isRefreshingRoutine}
            />
          </div>
        )}

        {/* TAB 3: HOUSEHOLD PROFILE */}
        {activeTab === 'profile' && (
          <div className="animate-fadeIn">
            <HouseholdForm
              initialProfile={profile}
              onProfileUpdated={handleProfileUpdated}
            />
          </div>
        )}

        {/* TAB 4: INDOOR AIR QUALITY GUIDE */}
        {activeTab === 'guide' && (
          <div className="animate-fadeIn">
            <IndoorGuide profile={profile} airQuality={airQuality} />
          </div>
        )}

        {/* TAB 5: IMPACT TRACKER */}
        {activeTab === 'impact' && (
          <div className="animate-fadeIn">
            <ImpactTracker
              logs={impactLogs}
              onLogsUpdated={setImpactLogs}
            />
          </div>
        )}
      </main>

      {/* Floating Gemini Chat Drawer */}
      <ChatDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        airQuality={airQuality}
        profile={profile}
      />

      {/* Floating Action Button (Mobile & Desktop quick access) */}
      {!isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 text-white font-bold text-xs shadow-xl shadow-sky-600/30 hover:scale-105 active:scale-95 transition-all group"
          title="Open Gemini Clean-Air Advisor"
        >
          <Sparkles className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition-transform" />
          <span>Ask AI Advisor</span>
        </button>
      )}

      {/* Clean Modern Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">BreatheWise</span>
            <span>•</span>
            <span>Clean-Air & Environmental Wellness Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Open-Meteo & Google Gemini</span>
            <span>•</span>
            <span>Built for Winter Smog Resilience</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
