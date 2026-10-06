import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { RecommendationOpportunity } from '../../types';
import { Lightbulb, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface RecommendationCenterProps {
  onOpenWarRoom: () => void;
}

export const RecommendationCenter: React.FC<RecommendationCenterProps> = ({ onOpenWarRoom }) => {
  const [recommendations, setRecommendations] = useState<RecommendationOpportunity[]>([]);
  const [filterEase, setFilterEase] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      setLoading(true);
      try {
        const res = await api.getRecommendations();
        setRecommendations(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Generating Evidence-Based Recommendations & Sizing Revenue Opportunities...</span>
      </div>
    );
  }

  const filtered = filterEase === 'ALL'
    ? recommendations
    : recommendations.filter((r) => r.ease_of_intervention === filterEase);

  const getEaseBadge = (ease: string) => {
    switch (ease) {
      case 'Easy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Loss & Opportunity Detection Center</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30 font-bold">
              Evidence-Backed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by expected weekly revenue recovery, empirical confidence, and operational ease of execution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Ease Filter */}
          <div className="flex items-center space-x-1.5 text-xs bg-[#131F37] border border-slate-800 rounded px-2.5 py-1.5">
            <span className="text-slate-400">Execution Ease:</span>
            <select
              value={filterEase}
              onChange={(e) => setFilterEase(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Levels</option>
              <option value="Easy" className="bg-slate-900">Easy (Pricing Only)</option>
              <option value="Moderate" className="bg-slate-900">Moderate (Promotions)</option>
              <option value="Complex" className="bg-slate-900">Complex (Supply/Merch)</option>
            </select>
          </div>

          <button
            onClick={onOpenWarRoom}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Multi-Agent War Room</span>
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold">
                  #{idx + 1}
                </span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Store {item.store} • {item.brand.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded font-bold border ${getEaseBadge(item.ease_of_intervention)}`}>
                  {item.ease_of_intervention} Execution
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                  {item.confidence_score}% Confidence
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  +${item.expected_revenue_gain_weekly.toLocaleString()}/wk
                </span>
              </div>
            </div>

            {/* Problem & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-rose-400 block tracking-wider">
                  Operational Issue / Demand Erosion:
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  {item.issue}
                </p>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                    Empirical Evidence:
                  </span>
                  <ul className="mt-1 space-y-1 text-slate-400">
                    {item.evidence.map((ev, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action, Expected Impact & Trade-Off */}
              <div className="space-y-3 bg-[#131F37] p-3.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 block tracking-wider">
                    Recommended Action:
                  </span>
                  <p className="text-white font-semibold mt-0.5">{item.recommended_action}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block tracking-wider">
                    Expected Business Impact:
                  </span>
                  <p className="text-emerald-300 font-mono font-bold mt-0.5">{item.expected_impact}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400">Trade-Off Analysis: </span>
                  <span>{item.trade_off}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
