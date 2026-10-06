import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  subtext?: string;
  interval?: string;
  badge?: {
    label: string;
    color: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'slate';
  };
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  subtext,
  interval,
  badge,
  icon
}) => {
  const badgeColorMap = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    slate: 'bg-slate-700/40 text-slate-300 border-slate-600/30'
  };

  return (
    <div className="bg-[#0E172A] border border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="truncate">{title}</span>
          <div className="flex items-center space-x-2">
            {badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${badgeColorMap[badge.color]}`}>
                {badge.label}
              </span>
            )}
            {icon && <span className="text-slate-400">{icon}</span>}
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {value}
          </div>
          {delta && (
            <div
              className={`text-xs font-semibold font-mono flex items-center space-x-0.5 ${
                delta.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span>{delta.isPositive ? '↑' : '↓'}</span>
              <span>{delta.value}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">{subtext}</span>
        {interval && <span className="font-mono text-[10px] text-cyan-400/90 font-medium shrink-0 ml-1">{interval}</span>}
      </div>
    </div>
  );
};
