import React from 'react';
import { Sparkles, Send, RefreshCw, ExternalLink } from 'lucide-react';
import { CopilotEvidence } from '../../types';

interface WarRoomCopilotProps {
  history: Array<{ role: 'user' | 'assistant'; text: string; evidence?: CopilotEvidence }>;
  query: string;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onSend: (text?: string) => void;
  onShowEvidence: (evidence: CopilotEvidence) => void;
}

export const WarRoomCopilot: React.FC<WarRoomCopilotProps> = ({
  history,
  query,
  loading,
  onQueryChange,
  onSend,
  onShowEvidence
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-[580px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI War Room Copilot</h3>
            <p className="text-[11px] text-slate-400">Strictly grounded on actual OJ telemetry & decisions</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Grounded • No Hallucination
        </span>
      </div>

      {/* Message stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {history.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-100 ml-6'
                : 'bg-slate-950/70 border border-slate-800/80 text-slate-200 mr-2'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-slate-400 flex items-center justify-between">
              <span>{msg.role === 'user' ? 'Executive Inquiry' : 'War Room Copilot'}</span>
              {msg.evidence && (
                <button
                  onClick={() => onShowEvidence(msg.evidence!)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline text-[10px]"
                >
                  <ExternalLink className="w-3 h-3" />
                  SHOW EVIDENCE ({msg.evidence.confidence_score}%)
                </button>
              )}
            </div>
            <div className="whitespace-pre-wrap">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Analyzing multi-brand econometric telemetry...</span>
          </div>
        )}
      </div>

      {/* Prompt chips and input */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
          Executive Investigation Prompts
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {[
            "Why are we missing next month's revenue target?",
            "Which store cluster is contributing most?",
            "What happens if we increase promotion by 20%?",
            "Which decision has highest impact?"
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] whitespace-nowrap transition border border-slate-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-center gap-2 mt-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Ask Copilot about root causes, forecasts, or decisions..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
