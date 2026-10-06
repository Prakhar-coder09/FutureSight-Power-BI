import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EBITDACockpitData } from '../../types';
import { DollarSign, Sliders, Info, TrendingUp, AlertTriangle, Target, BarChart2 } from 'lucide-react';

export const ValueCreationCockpit: React.FC = () => {
  // Configurable business assumptions
  const [grossMarginPct, setGrossMarginPct] = useState<number>(0.42);
  const [opexPct, setOpexPct] = useState<number>(0.18);
  const [adCostPerEvent, setAdCostPerEvent] = useState<number>(350.0);
  const [logisticsCostPerUnit, setLogisticsCostPerUnit] = useState<number>(0.15);
  const [wastagePct, setWastagePct] = useState<number>(0.025);

  const [cockpit, setCockpit] = useState<EBITDACockpitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCockpit() {
      setLoading(true);
      try {
        const res = await api.getEBITDACockpit({
          gross_margin_pct: grossMarginPct,
          opex_pct: opexPct,
          ad_cost_per_event: adCostPerEvent,
          logistics_cost_per_unit: logisticsCostPerUnit,
          wastage_pct: wastagePct
        });
        setCockpit(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCockpit();
  }, [grossMarginPct, opexPct, adCostPerEvent, logisticsCostPerUnit, wastagePct]);

  if (loading || !cockpit) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Calculating EBITDA Proxy & Value Creation Assumptions...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="bg-[#131F37] border-l-4 border-amber-400 rounded-r-xl p-4 text-xs text-slate-300 shadow-sm flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Accounting & Governance Disclosure
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">
            {cockpit.disclaimer}
          </p>
        </div>
      </div>

      {/* Primary Financial Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Monthly Revenue Run-Rate</div>
          <div className="text-xl font-bold font-mono text-white mt-1">${(cockpit.kpis.total_revenue).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">4-Week Empirical Baseline</div>
        </div>

        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Estimated Gross Profit</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">${(cockpit.kpis.estimated_gross_profit).toLocaleString()}</div>
          <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Margin: {(grossMarginPct * 100).toFixed(1)}% (less wastage)</div>
        </div>

        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Estimated Operating Cost</div>
          <div className="text-xl font-bold font-mono text-rose-300 mt-1">${(cockpit.kpis.estimated_operating_cost).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Opex + Freight + Ad Circulars</div>
        </div>

        <div className="bg-[#0E172A] border border-cyan-500/30 rounded-xl p-4 bg-cyan-950/10">
          <div className="text-[11px] text-cyan-400 font-medium font-bold">Estimated EBITDA Proxy</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">${(cockpit.kpis.estimated_ebitda_proxy).toLocaleString()}</div>
          <div className="text-[10px] text-cyan-400/90 mt-1 font-mono font-bold">EBITDA Margin: {cockpit.kpis.ebitda_margin_pct}%</div>
        </div>

        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-purple-400 font-medium">Potential Opportunity</div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">+${(cockpit.kpis.potential_opportunity).toLocaleString()}</div>
          <div className="text-[10px] text-purple-400/80 mt-1">Pricing & Promo Upside</div>
        </div>
      </div>

      {/* Assumptions Configuration (Left) & Trend Waterfall (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configurable Assumptions Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E172A] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Configurable Cost & Margin Assumptions</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Interactive</span>
          </div>

          {/* Assumption 1: Gross Margin % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Gross Margin Assumption:</span>
              <span className="text-emerald-400 font-mono font-bold">{(grossMarginPct * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.60"
              step="0.01"
              value={grossMarginPct}
              onChange={(e) => setGrossMarginPct(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Assumption 2: Operating Cost % */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Base Operating Cost (SG&A):</span>
              <span className="text-rose-400 font-mono font-bold">{(opexPct * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.30"
              step="0.01"
              value={opexPct}
              onChange={(e) => setOpexPct(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Assumption 3: Logistics Cost Per Unit */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Logistics & Freight / Unit:</span>
              <span className="text-cyan-400 font-mono font-bold">${logisticsCostPerUnit.toFixed(2)} / unit</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={logisticsCostPerUnit}
              onChange={(e) => setLogisticsCostPerUnit(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Assumption 4: Ad Cost per Circular Run */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Ad Circular Cost per Event:</span>
              <span className="text-purple-400 font-mono font-bold">${adCostPerEvent.toFixed(0)} / event</span>
            </div>
            <input
              type="range"
              min="100"
              max="800"
              step="25"
              value={adCostPerEvent}
              onChange={(e) => setAdCostPerEvent(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Assumption 5: Spoilage / Wastage % */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Cold-Chain Spoilage / Wastage:</span>
              <span className="text-amber-400 font-mono font-bold">{(wastagePct * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.06"
              step="0.005"
              value={wastagePct}
              onChange={(e) => setWastagePct(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Cost Breakdown & Monthly EBITDA Trend (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Monthly EBITDA Proxy Trajectory
              </h3>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                Trailing 6 Months
              </span>
            </div>

            {/* Monthly Trend Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Gross Profit</th>
                    <th className="py-2.5 px-3 text-right text-cyan-400">EBITDA Proxy</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {cockpit.monthly_trend.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-white font-medium">{row.period}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">${(row.revenue/1000).toFixed(1)}k</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">${(row.gross_profit/1000).toFixed(1)}k</td>
                      <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">${(row.ebitda_proxy/1000).toFixed(1)}k</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.ebitda_margin_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Cost Slices */}
          <div className="mt-5 pt-3 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-2 rounded bg-[#131F37] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Freight & Logistics</div>
              <div className="text-slate-200 font-semibold mt-0.5">${(cockpit.kpis.logistics_cost).toLocaleString()}</div>
            </div>
            <div className="p-2 rounded bg-[#131F37] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Circular Ad Spend</div>
              <div className="text-slate-200 font-semibold mt-0.5">${(cockpit.kpis.advert_spend).toLocaleString()}</div>
            </div>
            <div className="p-2 rounded bg-[#131F37] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Estimated Spoilage</div>
              <div className="text-amber-400 font-semibold mt-0.5">${(cockpit.kpis.wastage_cost).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
