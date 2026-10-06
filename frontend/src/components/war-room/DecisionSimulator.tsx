import React from 'react';
import { Sliders, RefreshCw, DollarSign, Package, Award, ShieldAlert, BrainCircuit, CheckCircle2, ListTodo } from 'lucide-react';
import { WarRoomState } from '../../types';

interface DecisionSimulatorProps {
  state: WarRoomState;
  simPriceDelta: number;
  simAdvertMult: number;
  simSupplyShock: number;
  simBrand: string;
  simRunning: boolean;
  simResult: any;
  onPriceChange: (v: number) => void;
  onAdvertChange: (v: number) => void;
  onSupplyChange: (v: number) => void;
  onBrandChange: (b: string) => void;
  onRunSimulation: () => void;
  onApproveDecision: () => void;
  onAssignTasks: () => void;
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  state,
  simPriceDelta,
  simAdvertMult,
  simSupplyShock,
  simBrand,
  simRunning,
  simResult,
  onPriceChange,
  onAdvertChange,
  onSupplyChange,
  onBrandChange,
  onRunSimulation,
  onApproveDecision,
  onAssignTasks
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            OPTION E ARCHITECTURE
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Business War Room: Four Perspectives. One Decision.
          </h2>
          <p className="text-xs text-slate-400">
            Simulate commercial, operational, and financial scenarios through 4 autonomous domain agents reconciled by an AI Coordinator.
          </p>
        </div>
        <button
          onClick={onRunSimulation}
          disabled={simRunning}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
        >
          {simRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
          Run Multi-Agent Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Inputs */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
            1. Scenario Inputs
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Target Product / Brand</label>
            <select
              value={simBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="dominicks">Dominicks (High Elasticity - η = -2.14)</option>
              <option value="minute maid">Minute Maid (Moderate Elasticity)</option>
              <option value="tropicana">Tropicana (Premium Brand)</option>
              <option value="ALL">All Portfolio Brands</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Price Adjustment</span>
              <span className="font-mono font-bold text-amber-300">
                {simPriceDelta > 0 ? `+${(simPriceDelta * 100).toFixed(1)}%` : `${(simPriceDelta * 100).toFixed(1)}%`}
              </span>
            </div>
            <input
              type="range"
              min="-0.15"
              max="0.15"
              step="0.01"
              value={simPriceDelta}
              onChange={(e) => onPriceChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-15% (Discount)</span>
              <span>0% (Hold)</span>
              <span>+15% (Hike)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Promotional Circular Intensity</span>
              <span className="font-mono font-bold text-emerald-400">{simAdvertMult}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={simAdvertMult}
              onChange={(e) => onAdvertChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0x (Baseline)</span>
              <span>1.5x (+22% lift)</span>
              <span>2.0x (Heavy)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Supply Capacity Shock</span>
              <span className="font-mono font-bold text-rose-400">
                {(simSupplyShock * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.0"
              step="0.05"
              value={simSupplyShock}
              onChange={(e) => onSupplyChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-30% Deficit</span>
              <span>Normal Run</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-0.5">Econometric Model Applied</div>
            Demand Quantity = 142.5 × (Price)^(-2.14) × (1.225 if Advert=1).
          </div>
        </div>

        {/* Column 2: 4 Domain Agents */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
            2. Four Domain AI Agents
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CFO */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  CFO AGENT
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Confidence 88%
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 font-medium">
                {simResult?.agents?.cfo_agent?.finding || "Net top-line revenue expands under promotional lift."}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                <div className="text-emerald-400 font-mono font-bold">
                  {simResult?.agents?.cfo_agent?.impact || "+$4,746 Operating EBITDA"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Recommendation: {simResult?.agents?.cfo_agent?.recommendation || "Approve scenario; pair with feature circular."}
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-sky-400" />
                  OPERATIONS AGENT
                </span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                  Confidence 82%
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 font-medium">
                {simResult?.agents?.operations_agent?.finding || "Logistics turnaround sufficient for run-rate."}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                <div className="text-sky-400 font-mono font-bold">
                  {simResult?.agents?.operations_agent?.impact || "2.1 Wks Safety Buffer Required"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Recommendation: {simResult?.agents?.operations_agent?.recommendation || "Maintain safety buffer in regional DCs."}
                </div>
              </div>
            </div>

            {/* Sales */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  SALES AGENT
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Confidence 85%
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 font-medium">
                {simResult?.agents?.sales_agent?.finding || "Promotional circulars drive strong shelf velocity."}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                <div className="text-amber-400 font-mono font-bold">
                  {simResult?.agents?.sales_agent?.impact || "+18.2% Velocity Lift"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Recommendation: {simResult?.agents?.sales_agent?.recommendation || "Secure retail end-cap displays."}
                </div>
              </div>
            </div>

            {/* Risk */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  RISK AGENT
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  Confidence 91%
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 font-medium">
                {simResult?.agents?.risk_agent?.finding || "Model uncertainty within acceptable 80% CI."}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                <div className="text-rose-400 font-mono font-bold">
                  {simResult?.agents?.risk_agent?.impact || "Low Downside Exposure"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Recommendation: {simResult?.agents?.risk_agent?.recommendation || "Calibrate 80% intervals for downside risk."}
                </div>
              </div>
            </div>
          </div>

          {/* AI Coordinator */}
          <div className="bg-indigo-950/30 border border-indigo-900/60 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              AI COORDINATOR: EXECUTIVE SYNTHESIS & CONFLICT RESOLUTION
            </div>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              {simResult?.agents?.coordinator?.consensus_verdict ||
                "Strategic consensus achieved: Holding price while accelerating digital circular advertising recovers $11,300 with manageable operational lead-time risk."}
            </p>
          </div>
        </div>

        {/* Column 3: Plan Comparison */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold mb-3">
              3. Consolidated Plan Comparison
            </div>

            <table className="w-full text-xs text-left mb-4">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                  <th className="py-1">Metric</th>
                  <th className="py-1">Current Plan</th>
                  <th className="py-1 text-emerald-400">Simulated Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-1.5 text-slate-400">Revenue</td>
                  <td className="py-1.5 font-mono text-slate-300">${state.metrics.forecasted_revenue.toLocaleString()}</td>
                  <td className="py-1.5 font-mono font-bold text-emerald-400">
                    +${Math.round(simResult?.scenario_summary?.revenue_delta || 11300).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Gap Recovery</td>
                  <td className="py-1.5 font-mono text-rose-400">0.0%</td>
                  <td className="py-1.5 font-mono font-bold text-emerald-400">
                    {Math.round(((simResult?.scenario_summary?.revenue_delta || 11300) / state.metrics.gap_amount) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">EBITDA Margin</td>
                  <td className="py-1.5 font-mono text-slate-300">42.0%</td>
                  <td className="py-1.5 font-mono font-bold text-emerald-400">+$4,746</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Stockout Risk</td>
                  <td className="py-1.5 font-mono text-amber-400">24%</td>
                  <td className="py-1.5 font-mono text-emerald-400">4%</td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-300">
              <div className="font-bold flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Executive Recommendation Ready
              </div>
              Option E recovers 64% of the target gap while protecting retail partner relationships.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={onApproveDecision}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Decision & Log in Ledger
            </button>
            <button
              onClick={onAssignTasks}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <ListTodo className="w-4 h-4" />
              Assign Operational Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
