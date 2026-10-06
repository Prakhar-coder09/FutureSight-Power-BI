import React from 'react';
import { Layers, Info, Sparkles } from 'lucide-react';
import { ImpactGraph, ImpactNode } from '../../types';

interface ImpactMapProps {
  impactGraph: ImpactGraph | null;
  selectedNode: ImpactNode | null;
  onSelectNode: (node: ImpactNode) => void;
  onAskCopilot: (prompt: string) => void;
}

export const ImpactMap: React.FC<ImpactMapProps> = ({
  impactGraph,
  selectedNode,
  onSelectNode,
  onAskCopilot
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Interactive Situation & Dependency Impact Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visually trace how the revenue shortfall ripples across brands, store clusters, supply constraints, and assigned teams.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 bg-slate-800 rounded text-slate-400">
          Click any node to inspect
        </span>
      </div>

      <div className="flex-1 min-h-[460px] bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="grid grid-cols-4 gap-3 z-10">
          {/* Layer 1: Target & Shortfall */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 1: Objective</div>
            {impactGraph?.nodes.filter(n => n.type === 'target' || n.type === 'shortfall').map(node => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedNode?.id === node.id
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20'
                    : node.type === 'shortfall'
                    ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">{node.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${node.type === 'shortfall' ? 'text-rose-400' : 'text-white'}`}>
                  {node.value}
                </div>
                <div className="text-[10px] font-mono mt-1 text-slate-400">{node.status}</div>
              </div>
            ))}
          </div>

          {/* Layer 2: Drivers */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 2: Demand Drivers</div>
            {impactGraph?.nodes.filter(n => n.type === 'driver').map(node => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedNode?.id === node.id
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">{node.label}</div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">{node.value}</div>
                <div className="text-[10px] text-slate-400 mt-1">{node.status}</div>
              </div>
            ))}
          </div>

          {/* Layer 3: Entities & Constraints */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 3: Constraints</div>
            {impactGraph?.nodes.filter(n => n.type === 'entity' || n.type === 'constraint').map(node => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedNode?.id === node.id
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">{node.label}</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">{node.value}</div>
                <div className="text-[10px] text-slate-400 mt-1">{node.status}</div>
              </div>
            ))}
          </div>

          {/* Layer 4: Action Teams */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 4: Response Teams</div>
            {impactGraph?.nodes.filter(n => n.type === 'team').map(node => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedNode?.id === node.id
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-indigo-950/20 border-indigo-900/40 hover:border-indigo-700'
                }`}
              >
                <div className="text-[10px] font-mono text-indigo-300">{node.label}</div>
                <div className="text-xs font-semibold text-emerald-400 mt-0.5">{node.value}</div>
                <div className="text-[10px] text-slate-400 mt-1">{node.status}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedNode && (
          <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-900/95 p-3 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  {selectedNode.label}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {selectedNode.value}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {selectedNode.detail}
                </div>
              </div>
            </div>
            <button
              onClick={() => onAskCopilot(`Explain root causes and operational impact for ${selectedNode.label}`)}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI Copilot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
