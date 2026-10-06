import React from 'react';
import { Flame, Clock, Sliders, CheckCircle2, Activity } from 'lucide-react';
import { WarRoomState } from '../../types';

interface WarRoomHeaderProps {
  state: WarRoomState;
  onStatusChange: (status: WarRoomState['status']) => void;
  onOpenTargetModal: () => void;
}

const lifecycleStatuses: Array<WarRoomState['status']> = [
  'Triggered',
  'Investigating',
  'Decision Pending',
  'Approved',
  'Executing',
  'Monitoring',
  'Resolved',
  'Closed'
];

export const WarRoomHeader: React.FC<WarRoomHeaderProps> = ({
  state,
  onStatusChange,
  onOpenTargetModal
}) => {
  const currentStatusIndex = lifecycleStatuses.indexOf(state.status);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              ACTIVE COMMAND CENTER
            </span>
            <span className="text-xs font-mono text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded bg-slate-800/60">
              {state.war_room_id}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Created: {state.metadata.created_at}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5">
            {state.title}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            "From prediction to action — resolve revenue risks, align cross-functional teams, and make better decisions."
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Severity</div>
            <div className="text-sm font-bold text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {state.severity}
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Time Remaining</div>
            <div className="text-sm font-bold text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {state.metrics.days_remaining} Days Left
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Owner</div>
            <div className="text-sm font-medium text-slate-200">
              {state.metadata.owner}
            </div>
          </div>
          <button
            onClick={onOpenTargetModal}
            className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            Configure Target
          </button>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Operating Lifecycle Progression</span>
          <span className="text-indigo-400 font-semibold">Active State: {state.status}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {lifecycleStatuses.map((st, idx) => {
            const isPast = idx < currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            return (
              <button
                key={st}
                onClick={() => onStatusChange(st)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition text-left flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20'
                    : isPast
                    ? 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] block opacity-60">Step {idx + 1}</span>
                  <span className="truncate">{st}</span>
                </div>
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Activity className="w-3.5 h-3.5 animate-pulse text-white shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
