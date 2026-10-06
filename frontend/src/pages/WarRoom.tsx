import React, { useState, useEffect } from 'react';
import { Target, BrainCircuit, ListTodo, FileCheck2, History } from 'lucide-react';
import {
  WarRoomHeader,
  SituationBoard,
  ImpactMap,
  WarRoomCopilot,
  EvidencePanel,
  TeamCommandCenter,
  DecisionLog,
  DecisionSimulator,
  PostmortemPanel
} from '../components/war-room';
import { WarRoomState, ImpactGraph, ImpactNode, CopilotEvidence, PostmortemData } from '../types';
import { warRoomService } from '../services/warRoom';

export const WarRoom: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'simulator' | 'tasks' | 'decisions' | 'postmortem'>('cockpit');
  const [loading, setLoading] = useState<boolean>(true);
  const [state, setState] = useState<WarRoomState | null>(null);
  const [impactGraph, setImpactGraph] = useState<ImpactGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<ImpactNode | null>(null);
  const [postmortem, setPostmortem] = useState<PostmortemData | null>(null);

  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; evidence?: CopilotEvidence }>>([]);
  const [activeEvidence, setActiveEvidence] = useState<CopilotEvidence | null>(null);

  // Simulator State
  const [simPriceDelta, setSimPriceDelta] = useState<number>(0.0);
  const [simAdvertMult, setSimAdvertMult] = useState<number>(1.2);
  const [simSupplyShock, setSimSupplyShock] = useState<number>(0.0);
  const [simBrand, setSimBrand] = useState<string>('dominicks');
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDept, setNewTaskDept] = useState<string>('Operations');
  const [newTaskOwner, setNewTaskOwner] = useState<string>('');
  const [newTaskImpact, setNewTaskImpact] = useState<string>('');

  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [customTarget, setCustomTarget] = useState<number>(120000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [curr, graph, pm] = await Promise.all([
        warRoomService.getCurrentState(),
        warRoomService.getImpactMap(),
        warRoomService.getPostmortem()
      ]);
      setState(curr);
      setImpactGraph(graph);
      setPostmortem(pm);
      setSelectedNode(graph.nodes.find(n => n.id === 'gap') || graph.nodes[0] || null);

      setCopilotHistory([
        {
          role: 'assistant',
          text: `BusinessSight War Room Copilot active for ${curr.war_room_id}. Telemetry and econometric models are calibrated. How can I assist?`
        }
      ]);

      runSimulation(0.0, 1.2, 0.0, 'dominicks');
    } catch (e) {
      console.error('Error loading War Room:', e);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (p: number, a: number, s: number, b: string) => {
    setSimRunning(true);
    try {
      const res = await warRoomService.runSimulation({
        price_delta_pct: p,
        advert_multiplier: a,
        supply_constraint_pct: s,
        target_brand: b
      });
      setSimResult(res);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimRunning(false);
    }
  };

  const handleSendCopilot = async (text?: string) => {
    const q = text || copilotQuery;
    if (!q.trim()) return;

    setCopilotHistory(prev => [...prev, { role: 'user', text: q }]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await warRoomService.queryCopilot(q);
      setCopilotHistory(prev => [...prev, { role: 'assistant', text: res.answer, evidence: res.evidence }]);
    } catch (e) {
      setCopilotHistory(prev => [...prev, { role: 'assistant', text: 'Error querying War Room copilot service.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleStatusChange = async (st: WarRoomState['status']) => {
    if (!state) return;
    try {
      await warRoomService.updateStatus(st);
      setState({ ...state, status: st });
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !newTaskTitle.trim()) return;
    const taskObj = {
      task_id: `TSK-${String(state.tasks.length + 1).padStart(2, '0')}`,
      title: newTaskTitle,
      department: newTaskDept,
      owner: newTaskOwner || 'Unassigned',
      priority: 'HIGH' as const,
      status: 'Pending' as const,
      due_date: 'In 5 Days',
      expected_impact: newTaskImpact || 'Target Shortfall Mitigation',
      notes: 'Logged via War Room Team Board'
    };
    try {
      await warRoomService.addTask(taskObj);
      setState({ ...state, tasks: [...state.tasks, taskObj] });
      setShowTaskModal(false);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleApproveDecision = async () => {
    if (!state || !simResult) return;
    const dec = {
      decision_id: `DEC-2026-${String(state.decisions.length + 1).padStart(2, '0')}`,
      title: `Option E Decision: ${simBrand.toUpperCase()} Promotion & Safety Buffer`,
      decision_text: `Hold price and increase circular advertising to ${simAdvertMult}x baseline.`,
      decided_by: 'Chief Commercial Officer',
      approved_by: 'CFO & Executive Committee',
      justification: 'Option E synthesis verified positive EBITDA upside.',
      expected_outcome: `Recover $${Math.round(simResult.scenario_summary?.revenue_delta || 11300)} shortfall.`,
      revenue_impact: Math.round(simResult.scenario_summary?.revenue_delta || 11300),
      margin_impact: Math.round((simResult.scenario_summary?.revenue_delta || 11300) * 0.42),
      risk_level: 'LOW',
      status: 'Approved',
      created_at: new Date().toISOString().split('T')[0]
    };
    try {
      await warRoomService.addDecision(dec);
      setState({ ...state, decisions: [dec as any, ...state.decisions] });
      alert('Decision approved and recorded in audit ledger!');
    } catch (err) {
      console.error('Error approving decision:', err);
    }
  };

  if (loading || !state) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-slate-400 font-mono text-sm">
        <span>Loading AI Business War Room Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-4 max-w-[1700px] mx-auto text-slate-100">
      {/* 1. Header Component */}
      <WarRoomHeader
        state={state}
        onStatusChange={handleStatusChange}
        onOpenTargetModal={() => setShowTargetModal(true)}
      />

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'cockpit', label: 'Situation & Impact Map', icon: Target },
          { id: 'simulator', label: 'Option E Decision Simulator', icon: BrainCircuit, badge: '4 Agents' },
          { id: 'tasks', label: 'Team Command Board', icon: ListTodo, badge: `${state.tasks.length}` },
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cockpit */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          <SituationBoard state={state} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ImpactMap
                impactGraph={impactGraph}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                onAskCopilot={(p) => handleSendCopilot(p)}
              />
            </div>
            <div className="lg:col-span-5">
              <WarRoomCopilot
                history={copilotHistory}
                query={copilotQuery}
                loading={copilotLoading}
                onQueryChange={setCopilotQuery}
                onSend={handleSendCopilot}
                onShowEvidence={setActiveEvidence}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Decision Simulator (Option E) */}
      {activeTab === 'simulator' && (
        <DecisionSimulator
          state={state}
          simPriceDelta={simPriceDelta}
          simAdvertMult={simAdvertMult}
          simSupplyShock={simSupplyShock}
          simBrand={simBrand}
          simRunning={simRunning}
          simResult={simResult}
          onPriceChange={setSimPriceDelta}
          onAdvertChange={setSimAdvertMult}
          onSupplyChange={setSimSupplyShock}
          onBrandChange={setSimBrand}
          onRunSimulation={() => runSimulation(simPriceDelta, simAdvertMult, simSupplyShock, simBrand)}
          onApproveDecision={handleApproveDecision}
          onAssignTasks={() => {
            setActiveTab('tasks');
            setShowTaskModal(true);
          }}
        />
      )}

      {/* Tab 3: Team Command Center */}
      {activeTab === 'tasks' && (
        <TeamCommandCenter
          tasks={state.tasks}
          onOpenTaskModal={() => setShowTaskModal(true)}
        />
      )}

      {/* Tab 4: Decision Log */}
      {activeTab === 'decisions' && (
        <DecisionLog decisions={state.decisions} />
      )}

      {/* Tab 5: Postmortem */}
      {activeTab === 'postmortem' && (
        <PostmortemPanel postmortem={postmortem} />
      )}

      {/* Evidence Modal */}
      <EvidencePanel
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
      />

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddTask} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Assign Cross-Functional Task</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Expedite refrigerated truck deliveries"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Department</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Owner</label>
                  <input
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    placeholder="e.g., Marcus Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Impact</label>
                <input
                  type="text"
                  value={newTaskImpact}
                  onChange={(e) => setNewTaskImpact(e.target.value)}
                  placeholder="e.g., +$4,500 Revenue Protection"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Add Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Configure Target Revenue</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Monthly Target Revenue ($ USD)</label>
              <input
                type="number"
                value={customTarget}
                onChange={(e) => setCustomTarget(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm font-mono"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowTargetModal(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancel</button>
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
                        gap_pct: parseFloat(newPct.toFixed(1))
                      }
                    });
                  }
                  setShowTargetModal(false);
                }}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
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

export default WarRoom;
