import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
  Sliders,
  DollarSign,
  Store,
  Lock,
  Globe,
  Cpu,
  Database,
  Lightbulb,
  FileText,
  Activity,
  Flame
} from 'lucide-react';
import { ActiveModule } from '../../types';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  const menuItems: Array<{ id: ActiveModule; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Executive Control Room', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'war_room', label: 'AI Business War Room', icon: <Flame className="w-4 h-4 text-rose-400" />, badge: 'CRITICAL' },
    { id: 'forecast', label: 'Forecast Studio', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'risk', label: 'Demand Risk Radar', icon: <ShieldAlert className="w-4 h-4" />, badge: '8 Risk' },
    { id: 'scenario', label: 'What-If Scenario Lab', icon: <Sliders className="w-4 h-4" />, badge: 'Sim' },
    { id: 'value', label: 'Value & EBITDA Cockpit', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'intelligence', label: 'Store & Brand Intel', icon: <Store className="w-4 h-4" /> },
    { id: 'collaboration', label: 'Data Collaboration Vault', icon: <Lock className="w-4 h-4" />, badge: 'k=10' },
    { id: 'market', label: 'Market Context Signals', icon: <Globe className="w-4 h-4" /> },
    { id: 'model', label: 'Model Performance & Leakage', icon: <Cpu className="w-4 h-4" /> },
    { id: 'quality', label: 'Data Quality & Drift', icon: <Database className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations & War Room', icon: <Lightbulb className="w-4 h-4" />, badge: 'AI' },
    { id: 'audit', label: 'Enterprise Audit Log', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0E172A] border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-white tracking-tight text-base font-sans">BusinessSight</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">AI</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-tight font-medium">Next-Month Predictive Cockpit</p>
        </div>
      </div>

      {/* Dataset & Org Pill */}
      <div className="px-3 pt-3 pb-2">
        <div className="bg-[#131F37] rounded-md p-2.5 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <span className="text-slate-400">Primary Dataset:</span>
            <span className="text-cyan-400 font-mono">Microsoft OJ</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Granularity:</span>
            <span>Store × Brand × Wk</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
            <span>Horizon:</span>
            <span className="text-emerald-400">121 Weeks Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 text-xs">
        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          Core Decision Modules
        </div>
        {menuItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    item.badge === 'k=10'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : item.badge === '8 Risk'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 bg-[#0B1120]">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 font-mono text-[10px]">BACKTEST: WMAPE 7.6%</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.4.2</span>
        </div>
      </div>
    </aside>
  );
};
