import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MarketSignalItem } from '../../types';
import { Globe, TrendingUp, TrendingDown, Info, Clock, AlertCircle } from 'lucide-react';

export const MarketSignals: React.FC = () => {
  const [signals, setSignals] = useState<MarketSignalItem[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSignals() {
      setLoading(true);
      try {
        const res = await api.getMarketSignals();
        setSignals(res.signals);
        setDisclaimer(res.disclaimer);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSignals();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Polling External Market & Commodity Signals Adapter...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="bg-[#131F37] border-l-4 border-cyan-400 rounded-r-xl p-4 text-xs text-slate-300 shadow-sm flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Environmental Context Architecture Disclaimer
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">{disclaimer}</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">External Market Signals Adapter Layer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Pipeline: Market API → Ingestion Service → Storage Cache → BI Layer → Scenario Engine
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">LIVE (0)</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">SIMULATED ADAPTER (5)</span>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {signals.map((sig) => (
          <div key={sig.id} className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">{sig.category}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {sig.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2.5 leading-snug">{sig.name}</h3>

              <div className="mt-3 flex items-baseline justify-between font-mono">
                <div className="text-2xl font-bold text-slate-100">
                  {sig.current_value.toLocaleString()} <span className="text-xs font-normal text-slate-400">{sig.unit}</span>
                </div>
                <div className={`text-xs font-bold flex items-center space-x-0.5 ${sig.change_pct_30d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {sig.change_pct_30d >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{sig.change_pct_30d >= 0 ? '+' : ''}{sig.change_pct_30d}%</span>
                </div>
              </div>

              {/* Demand Correlation */}
              <div className="mt-3 p-2 rounded bg-[#131F37] border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Demand Correlation (r):</span>
                <span className={`font-bold ${sig.correlation_with_demand < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {sig.correlation_with_demand > 0 ? '+' : ''}{sig.correlation_with_demand}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                {sig.impact_interpretation}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span className="truncate">Source: {sig.source}</span>
              <span className="shrink-0 ml-1">{sig.last_updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
