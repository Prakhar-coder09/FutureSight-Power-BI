import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ScenarioSimulationResult, WarRoomResponse, GlobalFilterState } from '../../types';
import { MultiAgentWarRoomModal } from './MultiAgentWarRoomModal';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ScenarioSimulatorProps {
  filters: GlobalFilterState;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ filters }) => {
  // Scenario control state
  const [priceDeltaPct, setPriceDeltaPct] = useState<number>(0.05); // +5%
  const [advertMultiplier, setAdvertMultiplier] = useState<number>(1.0); // 1.0x
  const [demandShockPct, setDemandShockPct] = useState<number>(0.0);
  const [supplyConstraintPct, setSupplyConstraintPct] = useState<number>(0.0);
  const [targetBrand, setTargetBrand] = useState<string>(filters.brand || 'ALL');

  // Result state
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // War Room modal state
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const [warRoomData, setWarRoomData] = useState<WarRoomResponse | null>(null);
  const [warRoomLoading, setWarRoomLoading] = useState(false);

  // Run simulation whenever controls change
  useEffect(() => {
    async function runSim() {
      setLoading(true);
      try {
        const res = await api.simulateScenario({
          price_delta_pct: priceDeltaPct,
          advert_multiplier: advertMultiplier,
          demand_shock_pct: demandShockPct,
          supply_constraint_pct: supplyConstraintPct,
          target_brand: targetBrand,
          target_store: filters.store === 'ALL' ? 0 : Number(filters.store)
        });
        setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    runSim();
  }, [priceDeltaPct, advertMultiplier, demandShockPct, supplyConstraintPct, targetBrand, filters.store]);

  const handleLaunchWarRoom = async () => {
    setWarRoomOpen(true);
    setWarRoomLoading(true);
    try {
      const data = await api.getWarRoomAnalysis({
        price_delta_pct: priceDeltaPct,
        advert_multiplier: advertMultiplier,
        demand_shock_pct: demandShockPct,
        supply_constraint_pct: supplyConstraintPct,
        target_brand: targetBrand
      });
      setWarRoomData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setWarRoomLoading(false);
    }
  };

  const handleReset = () => {
    setPriceDeltaPct(0.0);
    setAdvertMultiplier(1.0);
    setDemandShockPct(0.0);
    setSupplyConstraintPct(0.0);
    setTargetBrand('ALL');
  };

  const pricePresets = [-0.05, -0.02, 0.0, 0.02, 0.05, 0.10];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E172A] border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white">What-If Scenario Lab & Business Chaos Simulator</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20 font-bold">
              Dynamic Econometric Simulator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Perturb commercial levers (pricing, circular advertising, macro demand shock, DC supply limits) to model chain-wide business outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Levers</span>
          </button>
          <button
            onClick={handleLaunchWarRoom}
            className="px-4 py-1.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Convene Business War Room</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Levers (Left) + Outcome Comparison (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E172A] border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Commercial Decision Levers</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">Live Reaction</span>
          </div>

          {/* Lever 1: Price Delta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Unit Price Adjustment:</span>
              <span className={`font-mono font-bold text-sm ${priceDeltaPct > 0 ? 'text-amber-400' : (priceDeltaPct < 0 ? 'text-cyan-400' : 'text-slate-200')}`}>
                {priceDeltaPct >= 0 ? '+' : ''}{(priceDeltaPct * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.15"
              max="0.20"
              step="0.01"
              value={priceDeltaPct}
              onChange={(e) => setPriceDeltaPct(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            {/* Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
              {pricePresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceDeltaPct(p)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-all cursor-pointer ${
                    Math.abs(priceDeltaPct - p) < 0.001
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#131F37] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p >= 0 ? '+' : ''}{(p * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </div>

          {/* Lever 2: Circular Advertisement */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Circular Promotion Presence:</span>
              <span className="font-mono font-bold text-cyan-400">
                {advertMultiplier === 0 ? 'Off (Zero Promo)' : `${advertMultiplier}x Frequency`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {[
                { val: 0.0, label: 'Off (0x)' },
                { val: 1.0, label: 'Current (1x)' },
                { val: 1.25, label: '+25%' },
                { val: 1.5, label: '+50%' }
              ].map((adv) => (
                <button
                  key={adv.val}
                  onClick={() => setAdvertMultiplier(adv.val)}
                  className={`py-1.5 text-center rounded border transition-all cursor-pointer ${
                    advertMultiplier === adv.val
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {adv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lever 3: External Demand Shock */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Macroeconomic Demand Shift:</span>
              <span className={`font-mono font-bold ${demandShockPct < 0 ? 'text-rose-400' : (demandShockPct > 0 ? 'text-emerald-400' : 'text-slate-300')}`}>
                {demandShockPct >= 0 ? '+' : ''}{(demandShockPct * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="-0.30"
              max="0.30"
              step="0.05"
              value={demandShockPct}
              onChange={(e) => setDemandShockPct(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-30% Recession</span>
              <span>0% Baseline</span>
              <span>+30% Surge</span>
            </div>
          </div>

          {/* Lever 4: Supply Constraint */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Supply / Logistics Constraint:</span>
              <span className={`font-mono font-bold ${supplyConstraintPct < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {supplyConstraintPct === 0 ? '100% Unconstrained' : `${(supplyConstraintPct * 100).toFixed(0)}% Deficit`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {[
                { val: 0.0, label: 'Full Supply' },
                { val: -0.10, label: '-10% Cap' },
                { val: -0.20, label: '-20% Cap' },
                { val: -0.30, label: '-30% Cap' }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setSupplyConstraintPct(s.val)}
                  className={`py-1.5 text-center rounded border transition-all cursor-pointer ${
                    supplyConstraintPct === s.val
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lever 5: Target Scope */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Simulation Scope:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                className="bg-[#131F37] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">All 3 Brands</option>
                <option value="tropicana">Tropicana Only</option>
                <option value="minute.maid">Minute Maid Only</option>
                <option value="dominicks">Dominicks Only</option>
              </select>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center text-slate-400 text-[11px] font-mono">
                {filters.store === 'ALL' ? 'Chainwide (50 Stores)' : `Store ${filters.store} Only`}
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Comparison Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Base Case vs Scenario Comparison Card */}
              <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                      OUTCOME EVALUATION
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Base Case Run-Rate vs Simulated Scenario</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold border ${
                      result.risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : (
                        result.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      )
                    }`}>
                      {result.risk_level} RISK
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {result.confidence}% Conf
                    </span>
                  </div>
                </div>

                {/* Comparative KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 font-mono text-center">
                  <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Base Revenue</div>
                    <div className="text-sm font-bold text-slate-300 mt-1">${(result.base_case.revenue/1000).toFixed(1)}k</div>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                    <div className="text-[10px] text-cyan-400 uppercase font-bold">Scenario Revenue</div>
                    <div className="text-sm font-bold text-cyan-200 mt-1">${(result.scenario.revenue/1000).toFixed(1)}k</div>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    result.scenario.revenue_delta >= 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Revenue Delta</div>
                    <div className={`text-sm font-bold mt-1 ${result.scenario.revenue_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${result.scenario.revenue_delta >= 0 ? '+' : ''}{result.scenario.revenue_delta.toLocaleString()} ({result.scenario.revenue_delta_pct >= 0 ? '+' : ''}{result.scenario.revenue_delta_pct}%)
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    result.scenario.quantity_delta >= 0 ? 'bg-purple-950/20 border-purple-500/30' : 'bg-amber-950/20 border-amber-500/30'
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Volume Delta</div>
                    <div className={`text-sm font-bold mt-1 ${result.scenario.quantity_delta >= 0 ? 'text-purple-300' : 'text-amber-400'}`}>
                      {result.scenario.quantity_delta_pct >= 0 ? '+' : ''}{result.scenario.quantity_delta_pct}%
                    </div>
                  </div>
                </div>

                {/* Recommended Operational Intervention */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                  <span className="text-cyan-400 font-bold block text-[11px] uppercase tracking-wider font-mono">
                    Intervention Recommendation:
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">
                    {result.recommended_action}
                  </p>
                </div>
              </div>

              {/* Connected Ripple Effect Impact Flow Map */}
              <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Business Ripple Effect Impact Chain
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Connected Causal Propagation</span>
                </div>

                {/* Flow Graph Cards */}
                <div className="mt-5 space-y-2.5">
                  {result.ripple_chain.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      {/* Step Indicator */}
                      <div className="w-6 h-6 rounded-full bg-[#131F37] border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0">
                        {idx + 1}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-[#131F37] border border-slate-800 rounded-lg p-3 flex items-center justify-between shadow-sm">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
                            {step.stage}
                          </span>
                          <span className="text-xs font-bold text-white mt-0.5 block">{step.label}</span>
                        </div>
                        <span
                          className="text-xs font-mono font-bold px-2.5 py-1 rounded border shrink-0 ml-2"
                          style={{
                            color: step.color,
                            borderColor: `${step.color}40`,
                            backgroundColor: `${step.color}15`
                          }}
                        >
                          {step.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Multi-Agent War Room Modal */}
      <MultiAgentWarRoomModal
        isOpen={warRoomOpen}
        onClose={() => setWarRoomOpen(false)}
        data={warRoomData}
        loading={warRoomLoading}
      />
    </div>
  );
};
