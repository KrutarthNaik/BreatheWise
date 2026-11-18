import React, { useState } from 'react';
import { SunDim, Sun, Moon, CheckSquare, Square, AlertCircle, RefreshCw, Car, Wind, Shield, Clock, Flame } from 'lucide-react';
import { DailyPersonalizedRoutine, RoutineSlot } from '../../types/routine';
import { Card } from '../common/Card';
import { getRoutineCompleted, toggleRoutineItem } from '../../services/storage';

interface DailyRoutineCardProps {
  routine: DailyPersonalizedRoutine;
  onRefreshRoutine?: () => void;
  isRefreshing?: boolean;
}

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
  routine,
  onRefreshRoutine,
  isRefreshing = false,
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => getRoutineCompleted());

  const handleToggle = (key: string) => {
    const updated = toggleRoutineItem(key);
    setCompletedItems(updated);
  };

  const renderSlot = (slot: RoutineSlot, iconComponent: React.ReactNode, borderColor: string, badgeBg: string) => {
    return (
      <Card className={`border-l-4 ${borderColor} space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${badgeBg}`}>
              {iconComponent}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{slot.slotName} Routine</h3>
              <span className="text-xs text-slate-500 font-mono">{slot.timeRange}</span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hidden sm:block">
            {slot.summary}
          </span>
        </div>

        {/* Safest outdoor window callout */}
        {slot.saferTimeWindow && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200/70 text-xs text-teal-900">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Forecast safest window today:</strong> {slot.saferTimeWindow}
            </span>
          </div>
        )}

        {/* Indoor smoke precautions */}
        {slot.indoorSmokeWarning && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
            <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Indoor Smoke Precaution:</strong> {slot.indoorSmokeWarning}
            </span>
          </div>
        )}

        {/* Specific targeted advisories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Car className="w-3.5 h-3.5 text-sky-600" />
              <span>Commute Guidance</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{slot.commuteAdvice}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Ventilation Window</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{slot.ventilationAdvice}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Purifier Strategy</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{slot.indoorPurifierAdvice}</p>
          </div>
        </div>

        {/* Vulnerable alert if any */}
        {slot.outdoorVulnerabilityAlert && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              <strong>Vulnerability Advisory:</strong> {slot.outdoorVulnerabilityAlert}
            </span>
          </div>
        )}

        {/* Interactive Checklist — persisted per day */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Action Checklist for {slot.slotName}
          </h4>
          <div className="space-y-2">
            {slot.actionChecklist.map((action, idx) => {
              const itemKey = `${slot.slotName}-${idx}`;
              const isDone = !!completedItems[itemKey];
              return (
                <div
                  key={idx}
                  onClick={() => handleToggle(itemKey)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                    isDone
                      ? 'bg-emerald-50/70 text-emerald-900 line-through opacity-75'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{action}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personalized Daily Routine</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {routine.severityLevel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic timeline scheduled according to nocturnal temperature inversion and boundary layer movements in {routine.location}.
          </p>
        </div>

        {onRefreshRoutine && (
          <button
            onClick={onRefreshRoutine}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Regenerate with Gemini</span>
          </button>
        )}
      </div>

      {/* Overall advisory */}
      <div className="p-3.5 bg-sky-50/80 border border-sky-200/70 rounded-2xl text-xs text-sky-950">
        <strong>Today's Advisory ({routine.date}):</strong> {routine.overallAdvisory}
      </div>

      {/* Routine Cards Stack */}
      <div className="space-y-4">
        {renderSlot(
          routine.slots.morning,
          <SunDim className="w-5 h-5 text-amber-600" />,
          'border-amber-400',
          'bg-amber-100 text-amber-700'
        )}

        {renderSlot(
          routine.slots.afternoon,
          <Sun className="w-5 h-5 text-teal-600" />,
          'border-teal-400',
          'bg-teal-100 text-teal-700'
        )}

        {renderSlot(
          routine.slots.evening,
          <Moon className="w-5 h-5 text-indigo-600" />,
          'border-indigo-400',
          'bg-indigo-100 text-indigo-700'
        )}
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        ✓ Completed checklist items are saved for today and reset at midnight.
      </p>
    </div>
  );
};
