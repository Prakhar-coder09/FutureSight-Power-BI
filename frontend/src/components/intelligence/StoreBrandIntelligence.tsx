import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { StoreIntelligenceData, GlobalFilterState } from '../../types';
import { Store, Tag, TrendingUp, DollarSign, Activity, Percent } from 'lucide-react';

interface StoreBrandIntelligenceProps {
  filters: GlobalFilterState;
}

export const StoreBrandIntelligence: React.FC<StoreBrandIntelligenceProps> = ({ filters }) => {
  const [storeId, setStoreId] = useState<number>(typeof filters.store === 'number' ? filters.store : 1000);
  const [brand, setBrand] = useState<string>(filters.brand !== 'ALL' ? filters.brand : 'tropicana');
  const [data, setData] = useState<StoreIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await api.getStoreIntelligence(storeId, brand);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [storeId, brand]);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Loading Granular Store & Brand Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Selector Header Bar */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Store & Brand Intelligence Drilldown</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Micro-level elasticity, price vs quantity response curve, and promotional sensitivity.
          </p>
        </div>

        {/* Drilldown Selectors */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-[#131F37] border border-slate-700 rounded px-3 py-1.5">
            <span className="text-slate-400">Store:</span>
            <select
              value={storeId}
              onChange={(e) => setStoreId(Number(e.target.value))}
              className="bg-transparent text-white font-mono font-semibold outline-none cursor-pointer"
            >
              {[1000, 1017, 1034, 1051, 1068, 1085, 1102, 1119].map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">
                  Store {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#131F37] border border-slate-700 rounded px-3 py-1.5">
            <span className="text-slate-400">Brand:</span>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold outline-none cursor-pointer capitalize"
            >
              {['tropicana', 'minute.maid', 'dominicks'].map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-slate-200">
                  {b.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Micro-KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 font-mono">
          <div className="text-[10px] text-slate-400 uppercase font-sans">Avg Weekly Revenue</div>
          <div className="text-xl font-bold text-white mt-1">${data.kpis.avg_weekly_revenue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">Across trailing 24 weeks</div>
        </div>
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 font-mono">
          <div className="text-[10px] text-slate-400 uppercase font-sans">Avg Unit Price</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">${data.kpis.avg_unit_price.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">Effective retail price</div>
        </div>
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 font-mono">
          <div className="text-[10px] text-slate-400 uppercase font-sans">Demand Volatility (CV)</div>
          <div className="text-xl font-bold text-amber-300 mt-1">{data.kpis.volatility_cv}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">Std Dev / Mean ratio</div>
        </div>
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 font-mono">
          <div className="text-[10px] text-slate-400 uppercase font-sans">Empirical Elasticity (η)</div>
          <div className="text-xl font-bold text-purple-300 mt-1">{data.kpis.empirical_elasticity}</div>
          <div className="text-[10px] text-purple-400/80 mt-1 font-sans">% Δ Volume per % Δ Price</div>
        </div>
      </div>

      {/* Time Series Table */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Store {data.store} • {data.brand.toUpperCase()} Trailing History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekly breakdown of units, retail prices, promotional adverts, and realized revenues.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">24 Weekly Records</span>
        </div>

        <div className="mt-4 overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono sticky top-0">
              <tr>
                <th className="py-2 px-3">Week Starting</th>
                <th className="py-2 px-3 text-right">Unit Price</th>
                <th className="py-2 px-3 text-center">Circular Advert</th>
                <th className="py-2 px-3 text-right">Quantity Sold</th>
                <th className="py-2 px-3 text-right text-emerald-400">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {data.timeline.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-white font-medium">{row.week_starting}</td>
                  <td className="py-2 px-3 text-right text-slate-300">${row.price.toFixed(2)}</td>
                  <td className="py-2 px-3 text-center">
                    {row.advert === 1 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        ACTIVE PROMO
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200">{row.quantity.toLocaleString()} units</td>
                  <td className="py-2 px-3 text-right text-emerald-300 font-bold">${row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
