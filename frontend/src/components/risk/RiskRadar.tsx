import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { RiskRadarResponse, RiskItem, GlobalFilterState } from '../../types';
import { ShieldAlert, AlertTriangle, Info, ArrowUpDown, Filter, ChevronRight } from 'lucide-react';

interface RiskRadarProps {
  filters: GlobalFilterState;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ filters }) => {
  const [data, setData] = useState<RiskRadarResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<RiskItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRisk() {
      setLoading(true);
      try {
        const res = await api.getRiskRadar(filters.brand, filters.riskTier);
        setData(res);
        if (res.items.length > 0) {
          setSelectedItem(res.items[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRisk();
  }, [filters]);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Evaluating Operational Demand & Revenue Risk Radar...</span>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Methodology Disclaimer Note */}
      <div className="bg-[#131F37] border-l-4 border-cyan-400 rounded-r-xl p-4 text-xs text-slate-300 shadow-sm flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Operational Demand Risk vs Churn Clarification
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">
            {data.disclaimer}
          </p>
        </div>
      </div>

      {/* Risk Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#0E172A] border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] text-slate-400 font-medium">Total Entities Evaluated</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{data.total_entities_evaluated}</div>
          <div className="text-[10px] text-slate-500 mt-1">Store × Brand Pairs</div>
        </div>
        <div className="bg-[#0E172A] border border-rose-500/30 rounded-lg p-3.5 bg-rose-950/10">
          <div className="text-[11px] text-rose-400 font-medium">Critical Risk (81–100)</div>
          <div className="text-xl font-bold font-mono text-rose-300 mt-1">{data.risk_distribution.critical}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Immediate intervention</div>
        </div>
        <div className="bg-[#0E172A] border border-amber-500/30 rounded-lg p-3.5 bg-amber-950/10">
          <div className="text-[11px] text-amber-400 font-medium">High Risk (61–80)</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{data.risk_distribution.high}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">High price sensitivity</div>
        </div>
        <div className="bg-[#0E172A] border border-slate-800 rounded-lg p-3.5">
          <div className="text-[11px] text-yellow-400 font-medium">Medium Risk (31–60)</div>
          <div className="text-xl font-bold font-mono text-yellow-300 mt-1">{data.risk_distribution.medium}</div>
          <div className="text-[10px] text-slate-400 mt-1">Monitoring required</div>
        </div>
        <div className="bg-[#0E172A] border border-slate-800 rounded-lg p-3.5 col-span-2 md:col-span-1">
          <div className="text-[11px] text-cyan-400 font-medium">Revenue At Risk</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">${(data.total_revenue_at_risk_weekly/1000).toFixed(1)}k/wk</div>
          <div className="text-[10px] text-slate-400 mt-1">Expected weekly delta</div>
        </div>
      </div>

      {/* Main Risk Table & Selected Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List */}
        <div className="lg:col-span-2 bg-[#0E172A] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Demand & Revenue Risk Entities</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any row to inspect explainable causal factors.</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Showing top {data.items.length} actionable risks
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-2.5 px-3">Store Location</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3 text-center">Risk Tier</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Rev at Risk</th>
                  <th className="py-2.5 px-3 text-right">CV Volatility</th>
                  <th className="py-2.5 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {data.items.map((item, idx) => {
                  const isSelected = selectedItem?.store === item.store && selectedItem?.brand === item.brand;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-white font-medium">Store {item.store}</td>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium capitalize">{item.brand}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getTierColor(item.risk_tier)}`}>
                          {item.risk_tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">{item.risk_score}</td>
                      <td className="py-3 px-3 text-right text-rose-300 font-semibold">${item.revenue_at_risk.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{item.volatility_cv}</td>
                      <td className="py-3 px-2 text-right">
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable Risk Inspection Card */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {selectedItem ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] text-cyan-400 font-mono font-semibold block">ENTITY INSPECTION</span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Store {selectedItem.store} • {selectedItem.brand.toUpperCase()}
                  </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold border ${getTierColor(selectedItem.risk_tier)}`}>
                  {selectedItem.risk_tier} ({selectedItem.risk_score}/100)
                </span>
              </div>

              {/* Entity Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                  <div className="text-[10px] text-slate-400">Weekly Revenue:</div>
                  <div className="font-bold text-white text-sm mt-0.5">${selectedItem.avg_weekly_revenue.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                  <div className="text-[10px] text-slate-400">Weekly Rev at Risk:</div>
                  <div className="font-bold text-rose-400 text-sm mt-0.5">${selectedItem.revenue_at_risk.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                  <div className="text-[10px] text-slate-400">Recent Velocity:</div>
                  <div className="font-bold text-slate-200 mt-0.5">{selectedItem.recent_volume} units/wk</div>
                </div>
                <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                  <div className="text-[10px] text-slate-400">Unit Price:</div>
                  <div className="font-bold text-slate-200 mt-0.5">${selectedItem.recent_price}</div>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explainable Causal Risk Factors:</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  {selectedItem.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an entity from the table to view explainable causal factors.
            </div>
          )}

          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Risk scores synthesize 6 econometric dimensions: velocity trajectory, demand volatility, price hike vulnerability, promotional absence, forecast variance, and regional elasticity.
          </div>
        </div>
      </div>
    </div>
  );
};
