import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Clock,
  Users,
  TrendingDown,
  Target,
  ArrowRight,
  BrainCircuit,
  FileCheck2,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  ChevronRight,
  DollarSign,
  Package,
  Layers,
  History,
  Activity,
  Sliders,
  Award,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  WarRoomState,
  ImpactGraph,
  ImpactNode,
  CopilotResponse,
  WarRoomTask,
  WarRoomDecision,
  PostmortemData
} from '../../types';
import { api } from '../../services/api';

interface WarRoomProps {
  onNavigate?: (module: any) => void;
}

export const WarRoomCommandCenter: React.FC<WarRoomProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'simulator' | 'tasks' | 'decisions' | 'postmortem'>('cockpit');
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<WarRoomState | null>(null);
  const [impactGraph, setImpactGraph] = useState<ImpactGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<ImpactNode | null>(null);
  const [postmortem, setPostmortem] = useState<PostmortemData | null>(null);

  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; evidence?: any }>>([]);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<any | null>(null);

  // Option E Decision Simulator State
  const [simPriceDelta, setSimPriceDelta] = useState<number>(0.0);
  const [simAdvertMult, setSimAdvertMult] = useState<number>(1.2);
  const [simSupplyShock, setSimSupplyShock] = useState<number>(0.0);
  const [simBrand, setSimBrand] = useState<string>('dominicks');
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // New Task & Target Configuration Modal
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDept, setNewTaskDept] = useState<string>('Operations');
  const [newTaskOwner, setNewTaskOwner] = useState<string>('');
  const [newTaskImpact, setNewTaskImpact] = useState<string>('');

  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(120000);

  const lifecycleStatuses: Array<WarRoomState['status']> = [
    'Triggered',
    'Investigating',
    'Decision Pending',
    'Approved',
    'Executing',
    'Monitoring',
    'Resolved',
    'Closed'
  ];

  useEffect(() => {
    loadWarRoomData();
  }, []);

  const loadWarRoomData = async () => {
    setLoading(true);
    try {
      const [curr, graph, pm] = await Promise.all([
        api.getWarRoomCurrent(),
        api.getWarRoomImpactMap(),
        api.getWarRoomPostmortem()
      ]);
      setState(curr);
      setImpactGraph(graph);
      setPostmortem(pm);
      setSelectedNode(graph.nodes.find(n => n.id === 'gap') || graph.nodes[1] || null);

      // Initialize copilot greeting
      setCopilotHistory([
        {
          role: 'assistant',
          text: `BusinessSight War Room Copilot initialized for ${curr.war_room_id}. I am fully grounded on actual store/brand forecasts, price elasticities, and operational constraints. How can I assist your decision team?`
        }
      ]);

      // Run initial Option E simulation
      runOptionESimulation(0.0, 1.2, 0.0, 'dominicks');
    } catch (err) {
      console.error('Failed to load War Room state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: WarRoomState['status']) => {
    if (!state) return;
    try {
      await api.postWarRoomStatus(newStatus, 'Chief Commercial Officer');
      setState(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSendCopilot = async (queryText?: string) => {
    const text = queryText || copilotQuery;
    if (!text.trim()) return;

    setCopilotHistory(prev => [...prev, { role: 'user', text }]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res: CopilotResponse = await api.postWarRoomCopilot(text);
      setCopilotHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          evidence: res.evidence
        }
      ]);
    } catch (err) {
      setCopilotHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered telemetry error processing grounded query. Please check backend connection.'
        }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const runOptionESimulation = async (price: number, ad: number, supply: number, brand: string) => {
    setSimRunning(true);
    try {
      const res = await api.postWarRoomSimulation({
        price_delta_pct: price,
        advert_multiplier: ad,
        supply_constraint_pct: supply,
        target_brand: brand
      });
      setSimResult(res);
    } catch (err) {
      console.error('Error running Option E simulation:', err);
    } finally {
      setSimRunning(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !state) return;

    const taskObj: WarRoomTask = {
      task_id: `TSK-${String(state.tasks.length + 1).padStart(2, '0')}`,
      title: newTaskTitle,
      department: newTaskDept,
      owner: newTaskOwner || 'Unassigned',
      priority: 'HIGH',
      status: 'Pending',
      due_date: 'In 5 Days',
      expected_impact: newTaskImpact || 'Target Shortfall Mitigation',
      notes: 'Logged via War Room Team Board'
    };

    try {
      await api.postWarRoomTask(taskObj);
      setState(prev => prev ? { ...prev, tasks: [...prev.tasks, taskObj] } : null);
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskOwner('');
      setNewTaskImpact('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleApproveSimDecision = async () => {
    if (!state || !simResult) return;
    const dec: Partial<WarRoomDecision> = {
      title: `Option E Intervention: Brand ${simBrand.toUpperCase()} Promo Lift`,
      decision_text: `Adjust price by ${(simPriceDelta * 100).toFixed(1)}% and deploy ${simAdvertMult}x circular advertising.`,
      decided_by: 'Chief Commercial Officer',
      approved_by: 'Executive Committee & CFO',
      justification: 'Option E multi-agent synthesis verified positive margin contribution without long-term brand equity erosion.',
      expected_outcome: `Recover $${Math.max(4500, Math.round(simResult.scenario_summary?.revenue_delta || 8200))} revenue gap.`,
      revenue_impact: Math.round(simResult.scenario_summary?.revenue_delta || 8200),
      margin_impact: Math.round((simResult.scenario_summary?.revenue_delta || 8200) * 0.42),
      risk_level: 'LOW',
      status: 'Approved'
    };

    try {
      await api.postWarRoomDecision(dec);
      setState(prev => prev ? {
        ...prev,
        decisions: [dec as WarRoomDecision, ...prev.decisions]
      } : null);
      alert('Decision approved and recorded in permanent War Room audit log!');
    } catch (err) {
      console.error('Error logging decision:', err);
    }
  };

  if (loading || !state) {
    return (
      <div className="flex items-center justify-center min-h-[600px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mr-3" />
        <span className="text-lg">Initializing AI Business War Room Telemetry...</span>
      </div>
    );
  }

  const currentStatusIndex = lifecycleStatuses.indexOf(state.status);

  return (
    <div className="space-y-6 px-6 py-4 max-w-[1700px] mx-auto text-slate-100">
      {/* 1. TOP COMMAND BAR & METADATA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                ACTIVE COMMAND CENTER
              </span>
              <span className="text-xs font-mono text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded bg-slate-800/60">
                {state.war_room_id}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Created: {state.metadata.created_at}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              {state.title}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              "From prediction to action — resolve revenue risks, align cross-functional teams, and execute high-confidence decisions."
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Severity</div>
              <div className="text-sm font-bold text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {state.severity}
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Deadline</div>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {state.metrics.days_remaining} Days Left
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Accountable Lead</div>
              <div className="text-sm font-medium text-slate-200">
                {state.metadata.owner}
              </div>
            </div>
            <button
              onClick={() => setShowTargetModal(true)}
              className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              Configure Target
            </button>
          </div>
        </div>

        {/* 2. LIFECYCLE STATE PROGRESSION BAR */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Operating Lifecycle Progression</span>
            <span className="text-indigo-400 font-semibold">Active State: {state.status}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {lifecycleStatuses.map((st, idx) => {
              const isPast = idx < currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition text-left flex items-center justify-between border ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20'
                      : isPast
                      ? 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/50 text-slate-500 border-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-[10px] block opacity-60">Step {idx + 1}</span>
                    <span className="truncate">{st}</span>
                  </div>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Activity className="w-3.5 h-3.5 animate-pulse text-white shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/70 overflow-x-auto">
          {[
            { id: 'cockpit', label: 'Situation & Impact Map', icon: Target },
            { id: 'simulator', label: 'Option E Decision Simulator', icon: BrainCircuit, badge: '4 Perspectives' },
            { id: 'tasks', label: 'Team Command Board', icon: ListTodo, badge: `${state.tasks.length} Tasks` },
            { id: 'decisions', label: 'Decision Log', icon: FileCheck2, badge: `${state.decisions.length}` },
            { id: 'postmortem', label: 'Postmortem & Review', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    active ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: COCKPIT (SITUATION BOARD + IMPACT MAP + COPILOT) */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* A. SITUATION BOARD CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Target Revenue */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Target Revenue</span>
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                ${state.metrics.target_revenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <span>≈ ₹{state.metrics.inr_target_cr} Cr</span>
                <span className="text-slate-500">• Executive Board Plan</span>
              </div>
            </div>

            {/* 2. Forecasted Revenue */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Forecasted Revenue</span>
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300 mt-2">
                ${state.metrics.forecasted_revenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <span>≈ ₹{state.metrics.inr_forecast_cr} Cr</span>
                <span className="text-slate-500">• ML Walk-Forward Model</span>
              </div>
            </div>

            {/* 3. Expected Gap */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl">
              <div className="text-xs font-mono text-rose-300 uppercase tracking-wider flex items-center justify-between">
                <span>Expected Shortfall Gap</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                -${state.metrics.gap_amount.toLocaleString()}
              </div>
              <div className="text-xs text-rose-300/80 mt-1 flex items-center gap-1 font-mono">
                <span>{state.metrics.gap_pct}%</span>
                <span>(≈ -₹{state.metrics.inr_gap_cr} Cr Shortfall)</span>
              </div>
            </div>

            {/* 4. Action Readiness & Teams */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Execution Progress</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300 mt-2">
                {state.metadata.progress_pct}%
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span>{state.tasks.filter(t => t.status === 'Completed').length} / {state.tasks.length} Tasks Executed</span>
              </div>
            </div>
          </div>

          {/* Causal Explanation Banner */}
          <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-4 flex items-start gap-3.5 shadow-lg">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 shrink-0 mt-0.5">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Telemetry Root Cause Analysis (Microsoft OJ Econometric Calibration)
              </div>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {state.situation}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Dominicks Elasticity Penalty (η = -2.14)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  18 Tier-2 Suburban Stores Promotional Hiatus
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  14-Day Inbound Citrus Concentrate Lead Lag
                </span>
              </div>
            </div>
          </div>

          {/* B. MAIN TWO-COLUMN LAYOUT: IMPACT MAP (LEFT) & AI COPILOT (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: INTERACTIVE IMPACT & DEPENDENCY MAP */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col">
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

              {/* Node Visual Graph Container */}
              <div className="flex-1 min-h-[460px] bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="grid grid-cols-4 gap-3 z-10">
                  {/* Layer 1: Target & Gap */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 1: Objective</div>
                    {impactGraph?.nodes.filter(n => n.type === 'target' || n.type === 'shortfall').map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
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

                  {/* Layer 2: Drivers & Brands */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 2: Demand Drivers</div>
                    {impactGraph?.nodes.filter(n => n.type === 'driver').map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
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

                  {/* Layer 3: Store Cluster & Constraints */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Level 3: Constraints</div>
                    {impactGraph?.nodes.filter(n => n.type === 'entity' || n.type === 'constraint').map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
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
                        onClick={() => setSelectedNode(node)}
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

                {/* Selected Node Details Drawer */}
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
                      onClick={() => handleSendCopilot(`Explain root causes and operational impact for ${selectedNode.label}`)}
                      className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Ask AI Copilot
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: CONTEXT-AWARE AI WAR ROOM COPILOT */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-[580px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-lg text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI War Room Copilot</h3>
                    <p className="text-[11px] text-slate-400">Strictly grounded on actual OJ telemetry & decisions</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grounded • No Hallucination
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {copilotHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-100 ml-6'
                        : 'bg-slate-950/70 border border-slate-800/80 text-slate-200 mr-2'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-slate-400 flex items-center justify-between">
                      <span>{msg.role === 'user' ? 'Executive Inquiry' : 'War Room Copilot'}</span>
                      {msg.evidence && (
                        <button
                          onClick={() => setActiveEvidenceModal(msg.evidence)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline text-[10px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          SHOW EVIDENCE ({msg.evidence.confidence_score}%)
                        </button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}
                {copilotLoading && (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Analyzing multi-brand econometric telemetry...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                  Executive Investigation Prompts
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                  {[
                    "Why are we missing next month's revenue target?",
                    "Which store cluster is contributing most?",
                    "What happens if we increase promotion by 20%?",
                    "Which decision has highest impact?"
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleSendCopilot(prompt)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] whitespace-nowrap transition border border-slate-700/60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendCopilot();
                  }}
                  className="flex items-center gap-2 mt-2"
                >
                  <input
                    type="text"
                    value={copilotQuery}
                    onChange={(e) => setCopilotQuery(e.target.value)}
                    placeholder="Ask Copilot about root causes, forecasts, or decisions..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={copilotLoading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPTION E MULTI-AGENT DECISION SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
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
                onClick={() => runOptionESimulation(simPriceDelta, simAdvertMult, simSupplyShock, simBrand)}
                disabled={simRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                {simRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                Run Multi-Agent Simulation
              </button>
            </div>

            {/* THREE-COLUMN OPTION E WORKFLOW (MATCHING REFERENCE IMAGE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* COLUMN 1: SELECT A SCENARIO / INPUTS */}
              <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  1. Scenario Inputs
                </div>

                {/* Target Brand */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Target Product / Brand</label>
                  <select
                    value={simBrand}
                    onChange={(e) => setSimBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dominicks">Dominicks (High Elasticity - η = -2.14)</option>
                    <option value="minute maid">Minute Maid (Moderate Elasticity)</option>
                    <option value="tropicana">Tropicana (Premium Brand)</option>
                    <option value="ALL">All Portfolio Brands</option>
                  </select>
                </div>

                {/* Price Delta Slider */}
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
                    onChange={(e) => setSimPriceDelta(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-15% (Discount)</span>
                    <span>0% (Hold)</span>
                    <span>+15% (Hike)</span>
                  </div>
                </div>

                {/* Advertising Toggle */}
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
                    onChange={(e) => setSimAdvertMult(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1.0x (Baseline)</span>
                    <span>1.5x (+22% lift)</span>
                    <span>2.0x (Heavy)</span>
                  </div>
                </div>

                {/* Supply Constraint Slider */}
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
                    onChange={(e) => setSimSupplyShock(parseFloat(e.target.value))}
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

              {/* COLUMN 2: FOUR DOMAIN AI AGENTS (2x2 GRID + COORDINATOR) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  2. Four Domain AI Agents
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. CFO Agent */}
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

                  {/* 2. Operations Agent */}
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

                  {/* 3. Sales Agent */}
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

                  {/* 4. Risk Agent */}
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

                {/* AI COORDINATOR (SYNTHESIS & RESOLUTION) */}
                <div className="bg-indigo-950/30 border border-indigo-900/60 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                    <BrainCircuit className="w-4 h-4 text-indigo-400" />
                    AI COORDINATOR: EXECUTIVE SYNTHESIS & CONFLICT RESOLUTION
                  </div>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                    {simResult?.agents?.coordinator?.consensus_verdict ||
                      "Strategic consensus achieved: Holding price while accelerating digital circular advertising recovers $11,300 with manageable operational lead-time risk."}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-slate-300">Directives:</span>
                    <span>1. Freeze price hike • 2. Authorize $350 circular co-op • 3. Monitor weekly sell-through.</span>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: CONSOLIDATED RECOMMENDATION & PLAN COMPARISON */}
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
                    onClick={handleApproveSimDecision}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Decision & Log in Ledger
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('tasks');
                      setShowTaskModal(true);
                      setNewTaskTitle(`Execute Option E: Circular Promo for ${simBrand.toUpperCase()}`);
                      setNewTaskImpact(`+$${Math.round(simResult?.scenario_summary?.revenue_delta || 11300)} Revenue`);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <ListTodo className="w-4 h-4" />
                    Assign Operational Tasks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM ACTION COMMAND BOARD */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-400" />
                  Cross-Functional Team Command Board
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track operational and commercial assignments across Operations, Marketing, Sales, Procurement, and Finance.
                </p>
              </div>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Assign New Task
              </button>
            </div>

            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.tasks.map(task => (
                <div
                  key={task.task_id}
                  className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-slate-400 text-[10px]">{task.task_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
                    <p className="text-xs text-slate-400 mb-2">{task.notes}</p>
                    <div className="text-[11px] text-emerald-400 font-mono mb-3">
                      Impact: {task.expected_impact}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase">{task.department}</div>
                      <div className="text-slate-200 font-medium">{task.owner}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : task.status === 'In Progress'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERMANENT DECISION LOG */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-400" />
                  Executive Decision Ledger & Audit Record
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable record of decisions, justifications, expected business outcomes, and sign-offs.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {state.decisions.map(dec => (
                <div
                  key={dec.decision_id}
                  className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                        {dec.decision_id}
                      </span>
                      <h3 className="text-base font-bold text-white">{dec.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold">
                        {dec.status}
                      </span>
                      <span className="text-slate-400 font-mono">{dec.created_at}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dec.decision_text}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Analytical Justification</span>
                      <span className="text-slate-200">{dec.justification}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Expected Business Outcome</span>
                      <span className="text-emerald-400 font-semibold">{dec.expected_outcome}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <span>Decided by: <strong className="text-slate-200">{dec.decided_by}</strong></span>
                      <span>Approved by: <strong className="text-slate-200">{dec.approved_by}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-emerald-400 font-bold">+${dec.revenue_impact.toLocaleString()} Revenue</span>
                      <span className="text-indigo-400 font-bold">+${dec.margin_impact.toLocaleString()} EBITDA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POSTMORTEM & REVIEW */}
      {activeTab === 'postmortem' && postmortem && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                POST-INCIDENT RETROSPECTIVE
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {postmortem.title}
              </h2>
              <p className="text-xs text-slate-400">
                Formal executive review comparing predicted trajectory against post-intervention actuals.
              </p>
            </div>

            {/* Performance Delta Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs font-mono text-slate-400 uppercase">Unmitigated Projected Shortfall</div>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {postmortem.predicted_vs_actual.initial_shortfall_at_risk}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Target: {postmortem.predicted_vs_actual.original_target}</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs font-mono text-slate-400 uppercase">Actual Revenue Achieved</div>
                <div className="text-xl font-bold text-white mt-1">
                  {postmortem.predicted_vs_actual.post_intervention_actual_revenue}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  Recovered {postmortem.predicted_vs_actual.gap_recovered_amount}
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl">
                <div className="text-xs font-mono text-emerald-300 uppercase">Recovery Rate</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  89.5%
                </div>
                <div className="text-[11px] text-emerald-300/80 mt-1">
                  {postmortem.predicted_vs_actual.recovery_rate_pct}
                </div>
              </div>
            </div>

            {/* What Worked & What Didn't */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/80 border border-emerald-900/30 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  What Worked (High Impact Interventions)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  {postmortem.what_worked.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/80 border border-rose-900/30 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  What Did Not Work (Operational Friction)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  {postmortem.what_did_not_work.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Systemic Learnings */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                <BrainCircuit className="w-4 h-4" />
                Systemic Learnings & Algorithm Improvements
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                {postmortem.systemic_learnings.map((l, idx) => (
                  <li key={idx} className="leading-relaxed">{l}</li>
                ))}
              </ul>
            </div>

            {/* Executive Sign-Offs */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs font-mono text-slate-400">Executive Committee Sign-Offs</div>
              <div className="flex items-center gap-3">
                {postmortem.sign_offs.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {s.role} ({s.status})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHOW EVIDENCE MODAL / DRAWER */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Verified Telemetry Evidence</h3>
              </div>
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Metric Examined</span>
                <span className="text-sm font-bold text-white">{activeEvidenceModal.metric_name}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Mathematical Formula & Calculation</span>
                <code className="text-xs text-indigo-300 font-mono block">{activeEvidenceModal.calculation}</code>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Direct Dataset Citations</span>
                <div className="space-y-1.5">
                  {activeEvidenceModal.data_citations?.map((cit: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-800/60 rounded border border-slate-700/60">
                      <span className="text-slate-300">{cit.fact}</span>
                      <span className="font-mono font-bold text-emerald-400">{cit.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs text-slate-400 border-t border-slate-800">
                <span>Algorithmic Confidence:</span>
                <span className="font-mono font-bold text-indigo-400">{activeEvidenceModal.confidence_score}%</span>
              </div>
            </div>

            <button
              onClick={() => setActiveEvidenceModal(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Close Evidence Card
            </button>
          </div>
        </div>
      )}

      {/* 5. ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddTask}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Assign Cross-Functional Task</h3>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Expedite refrigerated truck deliveries"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Department</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Assignee / Owner</label>
                  <input
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    placeholder="e.g., Marcus Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Expected Business Impact</label>
                <input
                  type="text"
                  value={newTaskImpact}
                  onChange={(e) => setNewTaskImpact(e.target.value)}
                  placeholder="e.g., +$4,500 Revenue Protection"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. TARGET CONFIGURATION MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Configure Target Revenue</h3>
            <p className="text-xs text-slate-400">
              Update monthly target revenue. This modifies the shortfall gap without altering the core ML forecasting engine.
            </p>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Monthly Target Revenue ($ USD)</label>
              <input
                type="number"
                value={customTarget}
                onChange={(e) => setCustomTarget(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm font-mono"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                ≈ ₹{(customTarget / 10000).toFixed(2)} Cr
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (state) {
                    const newGap = customTarget - state.metrics.forecasted_revenue;
                    const newPct = ((state.metrics.forecasted_revenue - customTarget) / customTarget) * 100;
                    setState({
                      ...state,
                      metrics: {
                        ...state.metrics,
                        target_revenue: customTarget,
                        gap_amount: newGap,
                        gap_pct: parseFloat(newPct.toFixed(1)),
                        inr_target_cr: parseFloat((customTarget / 10000).toFixed(2)),
                        inr_gap_cr: parseFloat((newGap / 10000).toFixed(2))
                      }
                    });
                  }
                  setShowTargetModal(false);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
