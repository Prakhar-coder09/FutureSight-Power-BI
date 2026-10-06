import React from 'react';
import { Target, TrendingDown, AlertTriangle, Users, BrainCircuit } from 'lucide-react';
import { WarRoomState } from '../../types';

interface SituationBoardProps {
  state: WarRoomState;
}

export const SituationBoard: React.FC<SituationBoardProps> = ({ state }) => {
  return (
    <div className="space-y-4">
      {/* KPI Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Target Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Target Revenue</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ${state.metrics.target_revenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>≈ ₹{state.metrics.inr_target_cr} Cr</span>
            <span className="text-slate-500">• Executive Board Plan</span>
          </div>
        </div>

        {/* Forecast Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Forecasted Revenue</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-2">
            ${state.metrics.forecasted_revenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>≈ ₹{state.metrics.inr_forecast_cr} Cr</span>
            <span className="text-slate-500">• ML Forward Forecast</span>
          </div>
        </div>

        {/* Gap Amount */}
        <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
          <div className="text-xs font-mono text-rose-300 uppercase tracking-wider flex items-center justify-between">
            <span>Expected Shortfall Gap</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            -${state.metrics.gap_amount.toLocaleString()}
          </div>
          <div className="text-xs text-rose-300/80 mt-1 flex items-center gap-1 font-mono">
            <span>{state.metrics.gap_pct}%</span>
            <span>(≈ -₹{state.metrics.inr_gap_cr} Cr Gap)</span>
          </div>
        </div>

        {/* Execution Progress */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Execution Progress</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-2">
            {state.metadata.progress_pct}%
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>{state.tasks.filter(t => t.status === 'Completed').length} / {state.tasks.length} Action Tasks Completed</span>
          </div>
        </div>
      </div>

      {/* Causal Explanation Card */}
      <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-4 flex items-start gap-3.5 shadow-lg">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 shrink-0 mt-0.5">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Telemetry Root Cause Analysis (Microsoft OJ Econometric Calibration)
          </div>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {state.situation}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Dominicks Elasticity Penalty (η = -2.14)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              18 Tier-2 Suburban Stores Promotional Hiatus
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              14-Day Inbound Citrus Concentrate Lead Lag
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
