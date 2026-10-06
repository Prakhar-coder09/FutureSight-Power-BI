import React from 'react';
import { CheckCircle2, AlertTriangle, BrainCircuit } from 'lucide-react';
import { PostmortemData } from '../../types';

interface PostmortemPanelProps {
  postmortem: PostmortemData | null;
}

export const PostmortemPanel: React.FC<PostmortemPanelProps> = ({ postmortem }) => {
  if (!postmortem) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
          POST-INCIDENT RETROSPECTIVE
        </span>
        <h2 className="text-xl font-bold text-white mt-1">
          {postmortem.title}
        </h2>
        <p className="text-xs text-slate-400">
          Formal executive review comparing predicted trajectory against post-intervention actuals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 uppercase">Unmitigated Projected Shortfall</div>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {postmortem.predicted_vs_actual.initial_shortfall_at_risk}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target: {postmortem.predicted_vs_actual.original_target}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-mono text-slate-400 uppercase">Actual Revenue Achieved</div>
          <div className="text-xl font-bold text-white mt-1">
            {postmortem.predicted_vs_actual.post_intervention_actual_revenue}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">
            Recovered {postmortem.predicted_vs_actual.gap_recovered_amount}
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
          <div className="text-xs font-mono text-emerald-300 uppercase">Recovery Rate</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            89.5%
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            {postmortem.predicted_vs_actual.recovery_rate_pct}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/80 border border-emerald-900/30 p-4 rounded-xl">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            What Worked (High Impact Interventions)
          </h4>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            {postmortem.what_worked.map((w, idx) => (
              <li key={idx} className="leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950/80 border border-rose-900/30 p-4 rounded-xl">
          <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4" />
            What Did Not Work (Operational Friction)
          </h4>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            {postmortem.what_did_not_work.map((w, idx) => (
              <li key={idx} className="leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
        <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
          <BrainCircuit className="w-4 h-4" />
          Systemic Learnings & Algorithm Improvements
        </h4>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
          {postmortem.systemic_learnings.map((l, idx) => (
            <li key={idx} className="leading-relaxed">{l}</li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs font-mono text-slate-400">Executive Committee Sign-Offs</div>
        <div className="flex items-center gap-3">
          {postmortem.sign_offs.map((s, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {s.role} ({s.status})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
