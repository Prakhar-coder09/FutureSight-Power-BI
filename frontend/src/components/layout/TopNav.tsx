import React from 'react';
import { GlobalFilterState } from '../../types';
import { Filter, Calendar, Store, Tag, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TopNavProps {
  filters: GlobalFilterState;
  onFilterChange: (filters: Partial<GlobalFilterState>) => void;
  title: string;
  subtitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  filters,
  onFilterChange,
  title,
  subtitle
}) => {
  const stores = [
    { id: 'ALL', label: 'All Stores (50 Locations)' },
    { id: 1000, label: 'Store 1000 (Flagship Metro)' },
    { id: 1017, label: 'Store 1017 (Suburban South)' },
    { id: 1034, label: 'Store 1034 (Urban Center)' },
    { id: 1051, label: 'Store 1051 (High Volume North)' },
    { id: 1068, label: 'Store 1068 (Suburban Mall)' },
    { id: 1085, label: 'Store 1085 (Express Format)' }
  ];

  const brands = [
    { id: 'ALL', label: 'All Brands (3 Labels)' },
    { id: 'tropicana', label: 'Tropicana (Premium)' },
    { id: 'minute.maid', label: 'Minute Maid (Mid-Tier)' },
    { id: 'dominicks', label: 'Dominicks (Value Store Brand)' }
  ];

  const horizons = [
    { weeks: 1, label: '1 Week (Immediate)' },
    { weeks: 2, label: '2 Weeks' },
    { weeks: 4, label: '4 Weeks (Next Month)' },
    { weeks: 8, label: '8 Weeks (Bi-Monthly)' },
    { weeks: 12, label: '12 Weeks (Quarterly)' }
  ];

  const riskTiers = [
    { id: 'ALL', label: 'All Risk Tiers' },
    { id: 'CRITICAL', label: 'Critical Risk Only' },
    { id: 'HIGH', label: 'High & Critical' },
    { id: 'MEDIUM', label: 'Medium & Above' },
    { id: 'LOW', label: 'Low Risk' }
  ];

  return (
    <header className="bg-[#0E172A]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
      {/* Title block */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{title}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>CAUSAL LEAK-FREE</span>
          </span>
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex items-center space-x-1 text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Filters:</span>
        </div>

        {/* Store Selector */}
        <div className="flex items-center space-x-1 bg-[#131F37] border border-slate-700/80 rounded px-2.5 py-1.5 shadow-sm">
          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.store}
            onChange={(e) => onFilterChange({ store: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) })}
            className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center space-x-1 bg-[#131F37] border border-slate-700/80 rounded px-2.5 py-1.5 shadow-sm">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.brand}
            onChange={(e) => onFilterChange({ brand: e.target.value })}
            className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center space-x-1 bg-[#131F37] border border-slate-700/80 rounded px-2.5 py-1.5 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={filters.horizonWeeks}
            onChange={(e) => onFilterChange({ horizonWeeks: Number(e.target.value) })}
            className="bg-transparent text-cyan-300 font-medium outline-none cursor-pointer pr-1"
          >
            {horizons.map((h) => (
              <option key={h.weeks} value={h.weeks} className="bg-slate-900 text-slate-200">
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center space-x-1 bg-[#131F37] border border-slate-700/80 rounded px-2.5 py-1.5 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={filters.riskTier}
            onChange={(e) => onFilterChange({ riskTier: e.target.value })}
            className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1"
          >
            {riskTiers.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
