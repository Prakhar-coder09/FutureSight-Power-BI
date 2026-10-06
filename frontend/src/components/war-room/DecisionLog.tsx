import React from 'react';
import { FileCheck2 } from 'lucide-react';
import { WarRoomDecision } from '../../types';

interface DecisionLogProps {
  decisions: WarRoomDecision[];
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ decisions }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            Executive Decision Ledger & Audit Record
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable record of decisions, justifications, expected business outcomes, and sign-offs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {decisions.map(dec => (
          <div
            key={dec.decision_id}
            className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {dec.decision_id}
                </span>
                <h3 className="text-base font-bold text-white">{dec.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold">
                  {dec.status}
                </span>
                <span className="text-slate-400 font-mono">{dec.created_at}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {dec.decision_text}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Analytical Justification</span>
                <span className="text-slate-200">{dec.justification}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Expected Business Outcome</span>
                <span className="text-emerald-400 font-semibold">{dec.expected_outcome}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span>Decided by: <strong className="text-slate-200">{dec.decided_by}</strong></span>
                <span>Approved by: <strong className="text-slate-200">{dec.approved_by}</strong></span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-emerald-400 font-bold">+${dec.revenue_impact.toLocaleString()} Revenue</span>
                <span className="text-indigo-400 font-bold">+${dec.margin_impact.toLocaleString()} EBITDA</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
