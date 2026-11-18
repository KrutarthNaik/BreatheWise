import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Leaf,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { ImpactActionLog, ImpactCategory } from '../../types/impact';
import { addImpactLog, clearImpactLogs, computeImpactSummary, toggleImpactLogCompleted } from '../../services/storage';
import { Card } from '../common/Card';

interface ImpactTrackerProps {
  logs: ImpactActionLog[];
  onLogsUpdated: (logs: ImpactActionLog[]) => void;
}

export const ImpactTracker: React.FC<ImpactTrackerProps> = ({ logs, onLogsUpdated }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ImpactCategory>('personal_exposure_reduction');
  const [actionTitle, setActionTitle] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [metricEstimate, setMetricEstimate] = useState('');

  const summary = computeImpactSummary(logs);

  const personalLogs = logs.filter((l) => l.category === 'personal_exposure_reduction');
  const emissionLogs = logs.filter((l) => l.category === 'community_emission_reduction');

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;

    const updated = addImpactLog({
      category: selectedCategory,
      title: actionTitle,
      description: actionDesc || 'User-reported positive clean-air choice.',
      estimatedMetric:
        metricEstimate ||
        (selectedCategory === 'personal_exposure_reduction'
          ? 'Qualitative personal exposure reduction — no validated numeric estimate entered'
          : 'Qualitative emission avoidance — no validated numeric estimate entered'),
      badge: selectedCategory === 'personal_exposure_reduction' ? 'Personal Shield' : 'Emission Reduction',
      impactType: metricEstimate ? 'calculated' : 'qualitative',
      assumption: metricEstimate
        ? 'User-entered estimate. BreatheWise has not independently verified this figure.'
        : undefined,
    });

    onLogsUpdated(updated);
    setActionTitle('');
    setActionDesc('');
    setMetricEstimate('');
    setShowModal(false);
  };

  const handleClear = () => {
    if (window.confirm('Clear all recorded impact logs?')) {
      clearImpactLogs();
      onLogsUpdated([]);
    }
  };

  const handleToggleComplete = (id: string) => {
    const updated = toggleImpactLogCompleted(id);
    onLogsUpdated(updated);
  };

  const renderLog = (log: ImpactActionLog, accentClass: string, iconEl: React.ReactNode) => {
    return (
      <div
        key={log.id}
        className={`p-3 rounded-xl border space-y-1.5 transition-all ${
          log.isCompleted ? 'bg-emerald-50/60 border-emerald-200/70' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div className="flex items-start gap-2">
          <div
            onClick={() => handleToggleComplete(log.id)}
            className="cursor-pointer shrink-0 mt-0.5"
            title={log.isCompleted ? 'Mark as not done' : 'Mark as done today'}
          >
            {log.isCompleted ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`font-bold text-xs ${log.isCompleted ? 'text-emerald-900 line-through opacity-80' : 'text-slate-900'}`}>
                {log.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-600">{log.description}</p>
            <div className={`pt-1 flex items-start gap-1.5 text-[11px] font-semibold ${accentClass}`}>
              {iconEl}
              <span>{log.estimatedMetric}</span>
            </div>
            {log.assumption && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-slate-500 bg-white/70 rounded-lg p-2 border border-slate-100">
                <BookOpen className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Basis:</strong> {log.assumption}
                </span>
              </div>
            )}
            {log.isCompleted && log.completedAt && (
              <p className="text-[10px] text-emerald-700 mt-1">
                ✓ Completed at {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Clean-Air Impact &amp; Exposure Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking what you do to protect your family's lungs versus what you do to prevent adding emissions to your city.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-teal-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Action</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors"
              title="Clear all logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Crucial Scientific Distinction Banner */}
      <div className="p-3.5 bg-sky-50/80 border border-sky-200/70 rounded-2xl text-xs text-sky-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">Essential Environmental Science Principle:</strong>
          <p className="leading-relaxed">
            Personal protective equipment (like wearing an N95 mask or operating a room HEPA purifier) filters the air entering your personal
            airways, but <strong>does not reduce the ambient outdoor smog</strong> of your city. BreatheWise maintains two independent ledgers
            to avoid false claims. Numeric estimates show documented assumptions and sources where available.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">Personal Shield</span>
          <span className="text-2xl font-black text-slate-900">{summary.exposureAvoidedEvents}</span>
          <span className="text-[11px] text-slate-500 block">protective actions logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">N95 Hours</span>
          <span className="text-2xl font-black text-slate-900">{summary.n95HoursLogged} hrs</span>
          <span className="text-[11px] text-slate-500 block">est. high-filtration time</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">Purifier Hours</span>
          <span className="text-2xl font-black text-slate-900">{summary.purifierHoursLogged} hrs</span>
          <span className="text-[11px] text-slate-500 block">filtered indoor air</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Emission Actions</span>
          <span className="text-2xl font-black text-slate-900">{summary.emissionsAvoidedEvents}</span>
          <span className="text-[11px] text-slate-500 block">source-reduction choices</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Completed Today</span>
          <span className="text-2xl font-black text-emerald-800">{summary.completedCount}</span>
          <span className="text-[11px] text-slate-500 block">of {logs.length} actions ticked</span>
        </div>
      </div>

      {/* Two Column Comparative Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column A: Personal Exposure Shield */}
        <Card className="space-y-4 border-t-4 border-t-sky-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">A. Personal Exposure Reductions</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {personalLogs.length} Actions
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Actions that physically barricade toxic fine particulates from reaching your family's lungs. These do NOT clean the outdoor city air.
          </p>

          <div className="space-y-2.5">
            {personalLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No personal exposure actions logged yet.</p>
            ) : (
              personalLogs.map((log) =>
                renderLog(log, 'text-sky-700', <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />)
              )
            )}
          </div>
        </Card>

        {/* Column B: Community Emission Reductions */}
        <Card className="space-y-4 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">B. Community Emission Reductions</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {emissionLogs.length} Actions
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Actions that directly prevent primary pollutants from entering the neighbourhood airshed — these affect the shared outdoor environment.
          </p>

          <div className="space-y-2.5">
            {emissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No community emission actions logged yet.</p>
            ) : (
              emissionLogs.map((log) =>
                renderLog(log, 'text-emerald-700', <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />)
              )
            )}
          </div>
        </Card>
      </div>

      {/* Log Action Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900">Log Clean-Air Action</h3>

            <form onSubmit={handleAddAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action Category</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('personal_exposure_reduction')}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      selectedCategory === 'personal_exposure_reduction'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🛡️ A. Personal Shield
                    <span className="block font-normal text-[11px] mt-0.5 opacity-70">Filters your lungs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('community_emission_reduction')}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      selectedCategory === 'community_emission_reduction'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🌱 B. Emission Reduction
                    <span className="block font-normal text-[11px] mt-0.5 opacity-70">Stops pollution at source</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedCategory === 'personal_exposure_reduction'
                      ? 'e.g., Wore N95 during 40-min motorcycle commute'
                      : 'e.g., Carpooled / took electric metro to work'
                  }
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Details / Context</label>
                <input
                  type="text"
                  placeholder="e.g., Maintained tight nose clip seal throughout rush hour"
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimated Benefit Metric{' '}
                  <span className="font-normal text-slate-400">(optional — cite source if entering a number)</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedCategory === 'personal_exposure_reduction'
                      ? 'e.g., ~95% PM2.5 inhaled dose reduced (NIOSH 42 CFR 84)'
                      : 'e.g., Avoided tailpipe PM2.5/NOx for 12 km trip (qualitative)'
                  }
                  value={metricEstimate}
                  onChange={(e) => setMetricEstimate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to log as qualitative. BreatheWise does not validate user-entered figures.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
