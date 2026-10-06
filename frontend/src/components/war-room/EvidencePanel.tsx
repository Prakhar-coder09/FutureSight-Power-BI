import React from 'react';
import { Sparkles } from 'lucide-react';
import { CopilotEvidence } from '../../types';

interface EvidencePanelProps {
  evidence: CopilotEvidence | null;
  onClose: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Verified Telemetry Evidence</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Metric Examined</span>
            <span className="text-sm font-bold text-white">{evidence.metric_name}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Mathematical Formula & Calculation</span>
            <code className="text-xs text-indigo-300 font-mono block">{evidence.calculation}</code>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Direct Dataset Citations</span>
            <div className="space-y-1.5">
              {evidence.data_citations?.map((cit, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-800/60 rounded border border-slate-700/60">
                  <span className="text-slate-300">{cit.fact}</span>
                  <span className="font-mono font-bold text-emerald-400">{cit.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs text-slate-400 border-t border-slate-800">
            <span>Algorithmic Confidence Score:</span>
            <span className="font-mono font-bold text-indigo-400">{evidence.confidence_score}%</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
        >
          Close Evidence Panel
        </button>
      </div>
    </div>
  );
};
