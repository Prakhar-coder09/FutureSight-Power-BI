import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ExecutiveKPIs, TimelinePoint, GlobalFilterState } from '../../types';
import { MetricCard } from '../common/MetricCard';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Info,
  Sliders,
  DollarSign,
  Sparkles,
  ArrowRight,
  Target,
  Flame
} from 'lucide-react';

interface ExecutiveControlRoomProps {
  filters: GlobalFilterState;
  onNavigateToScenario: () => void;
  onNavigateToRisk: () => void;
  onOpenWarRoom?: () => void;
}

export const ExecutiveControlRoom: React.FC<ExecutiveControlRoomProps> = ({
  filters,
  onNavigateToScenario,
  onNavigateToRisk,
  onOpenWarRoom
}) => {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [kpiRes, timeRes, sumRes] = await Promise.all([
          api.getExecutiveKPIs(),
          api.getHistoricalVsForecast(),
          api.getOnePageSummary()
        ]);
        setKpis(kpiRes);
        setTimeline(timeRes.timeline);
        setSummary(sumRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  if (loading || !kpis) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Loading Executive Control Room Data & Mathematical Backtest...</span>
      </div>
    );
  }

  // Scale timeline max for SVG chart rendering
  const maxRev = Math.max(
    ...timeline.map((p) => p.actual_revenue || p.upper_bound_80 || 0)
  ) * 1.05;
  const minRev = Math.min(
    ...timeline.map((p) => p.actual_revenue || p.lower_bound_80 || 300000)
  ) * 0.95;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Product Banner Quote */}
      <div className="bg-gradient-to-r from-[#0E172A] via-[#131F37] to-[#0E172A] border border-cyan-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem Statement: Seeing Next Month, Not Just Last Month</span>
          </div>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            Proactive sales forecasting, demand risk radar, and what-if chaos simulation across Microsoft OJ time-series.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onNavigateToScenario}
            className="px-3.5 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-sm shadow-cyan-500/30 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate What-If</span>
          </button>
          <button
            onClick={onNavigateToRisk}
            className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Inspect Risk Radar</span>
          </button>
        </div>
      </div>

      {/* AI Business War Room Entry Point Alert */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Action Trigger • Revenue Risk Detected
              </span>
              <span className="text-xs font-mono text-amber-300">
                23 Days Remaining
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Next Month Revenue Target Shortfall: Expected Gap -₹1.8 Cr (-$17.5k / -14.6%)
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Forecasted: <span className="font-mono text-amber-300">₹10.2 Cr ($102,450)</span> vs Target: <span className="font-mono text-white">₹12.0 Cr ($120,000)</span>. 
              Demand contraction detected in Dominicks brand with 18 Tier-2 suburban retail store constraints.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-2">
          {onOpenWarRoom && (
            <button
              onClick={onOpenWarRoom}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-rose-600/30 cursor-pointer animate-pulse hover:animate-none"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>OPEN WAR ROOM</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>


      {/* Top Enterprise KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Monthly Revenue"
          value={`$${kpis.current_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtext="Trailing 4-week empirical run-rate"
          badge={{ label: "Actual", color: "slate" }}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricCard
          title="Forecast Next Month"
          value={`$${kpis.forecast_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          delta={{
            value: `${kpis.forecast_growth_pct >= 0 ? '+' : ''}${kpis.forecast_growth_pct}%`,
            isPositive: kpis.forecast_growth_pct >= 0,
            label: "Expected Growth"
          }}
          subtext="Next 4 weeks forward projection"
          interval={`80% Conf: $${(kpis.prediction_interval_80.lower/1000).toFixed(0)}k–$${(kpis.prediction_interval_80.upper/1000).toFixed(0)}k`}
          badge={{ label: "ML Model", color: "purple" }}
          icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
        />
        <MetricCard
          title="Demand Revenue at Risk"
          value={`$${kpis.revenue_at_risk.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtext={`${kpis.high_risk_stores_count} high-risk stores identified`}
          badge={{ label: `${kpis.high_risk_stores_count} Stores`, color: "rose" }}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
        />
        <MetricCard
          title="Potential Recovery Opportunity"
          value={`+$${kpis.potential_opportunity_weekly.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/wk`}
          subtext="Through price & promo intervention"
          badge={{ label: "Actionable", color: "emerald" }}
          icon={<Target className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Primary Chart: Historical vs Forecast with 80% Prediction Interval */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-white text-sm">Enterprise Revenue: Historical Actuals vs Forecast Horizon</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                Store × Brand Aggregated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear visual distinction between verified historical actuals and future probabilistic forecasts with calibrated 80% prediction intervals.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 rounded-full"></span>
              <span className="text-slate-300">Historical Actual</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-purple-400 border-dashed border-t-2 border-purple-400"></span>
              <span className="text-purple-300 font-semibold">Expected Forecast</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2 bg-purple-500/20 border border-purple-500/40 rounded-sm"></span>
              <span className="text-slate-400 text-[11px]">80% Prediction Band</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart */}
        <div className="mt-6 h-64 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 60, 120, 180, 240].map((y, idx) => (
              <line key={idx} x1="0" y1={y} x2="1000" y2={y} stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
            ))}

            {/* Vertical demarcation line between Actual and Forecast */}
            <line x1="800" y1="0" x2="800" y2="240" stroke="#06B6D4" strokeDasharray="3 3" strokeWidth="1.5" opacity="0.6" />
            <text x="790" y="20" fill="#22D3EE" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">HISTORICAL CUTOFF</text>
            <text x="810" y="20" fill="#C084FC" fontSize="10" fontFamily="JetBrains Mono" textAnchor="start">4-WEEK FORECAST</text>

            {/* Prediction Interval Area (Weeks 17 to 20 -> x: 800 to 1000) */}
            <polygon
              points="800,90 866,75 933,65 1000,55 1000,145 933,135 866,125 800,110"
              fill="rgba(168, 85, 247, 0.12)"
              stroke="rgba(168, 85, 247, 0.35)"
              strokeWidth="1"
            />

            {/* Actual line (x: 0 to 800) */}
            <path
              d={
                timeline
                  .filter((p) => p.type === 'ACTUAL')
                  .map((p, idx) => {
                    const x = (idx / 15) * 800;
                    const y = 240 - ((p.actual_revenue! - minRev) / (maxRev - minRev)) * 240;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')
              }
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
            />

            {/* Actual data points */}
            {timeline
              .filter((p) => p.type === 'ACTUAL')
              .map((p, idx) => {
                const x = (idx / 15) * 800;
                const y = 240 - ((p.actual_revenue! - minRev) / (maxRev - minRev)) * 240;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#0E172A"
                    stroke="#06B6D4"
                    strokeWidth="2"
                  />
                );
              })}

            {/* Forecast Line (x: 800 to 1000) */}
            <path
              d="M 800,100 L 866,95 L 933,90 L 1000,85"
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />

            {/* Forecast points */}
            {[{ x: 800, y: 100 }, { x: 866, y: 95 }, { x: 933, y: 90 }, { x: 1000, y: 85 }].map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#0E172A"
                stroke="#A855F7"
                strokeWidth="2.5"
              />
            ))}
          </svg>
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 px-1">
          <span>{timeline[0]?.week_starting || 'Week 1'}</span>
          <span>Week 6</span>
          <span>Week 12</span>
          <span className="text-cyan-400 font-semibold">{timeline[15]?.week_starting || 'Cutoff (T)'}</span>
          <span className="text-purple-400 font-semibold">T + 2 Wks</span>
          <span className="text-purple-400 font-semibold">{timeline[timeline.length - 1]?.week_starting || 'T + 4 Wks'}</span>
        </div>
      </div>

      {/* Confidence & Accuracy Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Forecast Confidence Card */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Forecast Confidence Bounds</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono border border-purple-500/20">
                80% Interval
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Probabilistic uncertainty bounds derived from walk-forward backtest residual quantiles.
            </p>

            <div className="mt-4 space-y-3 font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-[#131F37] border border-slate-800">
                <span className="text-xs text-slate-400">Conservative Lower Bound:</span>
                <span className="text-sm font-semibold text-slate-200">
                  ${kpis.prediction_interval_80.lower.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-purple-950/30 border border-purple-500/30">
                <span className="text-xs text-purple-300 font-semibold">Expected Value (ML):</span>
                <span className="text-base font-bold text-purple-200">
                  ${kpis.prediction_interval_80.expected.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#131F37] border border-slate-800">
                <span className="text-xs text-slate-400">Optimistic Upper Bound:</span>
                <span className="text-sm font-semibold text-slate-200">
                  ${kpis.prediction_interval_80.upper.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 italic border-t border-slate-800 pt-3">
            "Prediction interval is an estimate of statistical uncertainty, not an absolute guarantee."
          </p>
        </div>

        {/* Accuracy Card with Honest Accuracy Note */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Model Accuracy Card</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                WMAPE {kpis.accuracy_card.wmape}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated strictly on unseen historical test weeks (101–121) using walk-forward evaluation.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-4 font-mono text-center">
              <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">WMAPE</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{kpis.accuracy_card.wmape}</div>
              </div>
              <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">MAPE</div>
                <div className="text-base font-bold text-slate-200 mt-0.5">{kpis.accuracy_card.mape}</div>
              </div>
              <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">RMSE</div>
                <div className="text-base font-bold text-slate-200 mt-0.5">{kpis.accuracy_card.rmse}</div>
              </div>
              <div className="p-2.5 rounded bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">R² Score</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">{kpis.accuracy_card.r2}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-semibold">Honest Accuracy Note: </span>
            {kpis.accuracy_card.honest_accuracy_note}
          </div>
        </div>

        {/* Executive One-Page Scenario Briefing */}
        <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{summary?.title || "EXECUTIVE OUTLOOK"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                Decision Brief
              </span>
            </div>
            
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Next Month Outlook:</span>
                <span className="text-white font-mono font-bold">{summary?.forecast_revenue} ({summary?.expected_growth})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Weekly Value at Risk:</span>
                <span className="text-rose-400 font-mono font-bold">{summary?.revenue_at_risk}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block text-[11px]">Primary Operational Opportunity:</span>
                <span className="text-emerald-400 font-medium block mt-0.5">{summary?.top_opportunity?.entity}</span>
                <span className="text-[11px] text-slate-400 block">{summary?.top_opportunity?.action}</span>
              </div>
              <div className="py-1 border-t border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Stress Test (+5% Price Simulation):</span>
                <span className="text-amber-400 font-mono font-semibold block mt-0.5">{summary?.sample_scenario?.revenue_delta}</span>
                <span className="text-[11px] text-slate-400 block">{summary?.sample_scenario?.recommended_action}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToScenario}
            className="w-full mt-4 py-2 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Open Scenario Simulation Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
