import React from 'react';
import { WarRoomResponse } from '../../types';
import { X, ShieldAlert, DollarSign, Truck, ShoppingCart, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MultiAgentWarRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WarRoomResponse | null;
  loading: boolean;
}

export const MultiAgentWarRoomModal: React.FC<MultiAgentWarRoomModalProps> = ({
  isOpen,
  onClose,
  data,
  loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1120] border border-cyan-500/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0E172A] sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Multi-Agent Business War Room</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 font-bold">
                  5 Reasoning Agents
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic multi-agent reasoning layer analyzing scenario trade-offs across finance, ops, sales, and risk.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {loading || !data ? (
            <div className="py-16 text-center text-cyan-400 font-mono text-sm space-y-2">
              <span className="w-4 h-4 rounded-full bg-cyan-400 animate-ping inline-block"></span>
              <p>Convening Multi-Agent War Room & Reconciling Dialectical Perspectives...</p>
            </div>
          ) : (
            <>
              {/* Coordinator Synthesis Banner */}
              <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0E172A] border border-purple-500/40 rounded-xl p-5 shadow-sm">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>{data.agents.coordinator.agent} • {data.agents.coordinator.role}</span>
                </div>
                
                <h4 className="text-sm font-bold text-white mt-2 leading-relaxed">
                  {data.agents.coordinator.consensus_verdict}
                </h4>

                {/* Detected Conflicts */}
                <div className="mt-3 pt-3 border-t border-purple-500/20">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    Detected Dialectical Contradictions:
                  </span>
                  <ul className="mt-1 space-y-1 text-xs text-slate-300">
                    {data.agents.coordinator.detected_conflicts.map((c, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Directives */}
                <div className="mt-3 pt-3 border-t border-purple-500/20">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    Actionable Directives:
                  </span>
                  <div className="mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                    {data.agents.coordinator.actionable_directives.map((dir, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-200">
                        {dir}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Specialized Domain Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. CFO Agent */}
                <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">{data.agents.cfo_agent.agent}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                        {data.agents.cfo_agent.confidence}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{data.agents.cfo_agent.role}</div>
                    
                    <p className="text-xs font-semibold text-slate-200 mt-2.5 leading-relaxed">
                      {data.agents.cfo_agent.finding}
                    </p>

                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Supporting Evidence:</span>
                      {data.agents.cfo_agent.evidence.map((ev, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-emerald-400 font-semibold block text-[11px]">Recommendation:</span>
                    <span className="text-slate-300 text-[11px]">{data.agents.cfo_agent.recommendation}</span>
                  </div>
                </div>

                {/* 2. Operations Agent */}
                <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white">{data.agents.operations_agent.agent}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                        {data.agents.operations_agent.confidence}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{data.agents.operations_agent.role}</div>
                    
                    <p className="text-xs font-semibold text-slate-200 mt-2.5 leading-relaxed">
                      {data.agents.operations_agent.finding}
                    </p>

                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Supporting Evidence:</span>
                      {data.agents.operations_agent.evidence.map((ev, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-cyan-400 font-semibold block text-[11px]">Recommendation:</span>
                    <span className="text-slate-300 text-[11px]">{data.agents.operations_agent.recommendation}</span>
                  </div>
                </div>

                {/* 3. Sales Agent */}
                <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white">{data.agents.sales_agent.agent}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                        {data.agents.sales_agent.confidence}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{data.agents.sales_agent.role}</div>
                    
                    <p className="text-xs font-semibold text-slate-200 mt-2.5 leading-relaxed">
                      {data.agents.sales_agent.finding}
                    </p>

                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Supporting Evidence:</span>
                      {data.agents.sales_agent.evidence.map((ev, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                          <span className="text-purple-400">•</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-purple-400 font-semibold block text-[11px]">Recommendation:</span>
                    <span className="text-slate-300 text-[11px]">{data.agents.sales_agent.recommendation}</span>
                  </div>
                </div>

                {/* 4. Risk Agent */}
                <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">{data.agents.risk_agent.agent}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                        {data.agents.risk_agent.confidence}% Conf
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{data.agents.risk_agent.role}</div>
                    
                    <p className="text-xs font-semibold text-slate-200 mt-2.5 leading-relaxed">
                      {data.agents.risk_agent.finding}
                    </p>

                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Supporting Evidence:</span>
                      {data.agents.risk_agent.evidence.map((ev, i) => (
                        <div key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-amber-400 font-semibold block text-[11px]">Recommendation:</span>
                    <span className="text-slate-300 text-[11px]">{data.agents.risk_agent.recommendation}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
