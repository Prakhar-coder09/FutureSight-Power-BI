import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, Shield, Building, CheckCircle2, XCircle, AlertTriangle, Hash, ArrowRight, Info } from 'lucide-react';

export const DataCollaborationVault: React.FC = () => {
  const [activeOrg, setActiveOrg] = useState<'ORG_A' | 'ORG_B'>('ORG_A');
  const [queryTemplate, setQueryTemplate] = useState<string>('DEMAND_VS_SUPPLIER_CAPACITY');
  const [simulateKSuppression, setSimulateKSuppression] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecuteQuery = async () => {
    setLoading(true);
    try {
      const res = await api.executeVaultQuery({
        query_template_id: queryTemplate,
        requester_org: activeOrg === 'ORG_A' ? 'Org A (Apex Retail Enterprise)' : 'Org B (Citrus Growers Supplier Coop)',
        target_org: activeOrg === 'ORG_A' ? 'Org B (Citrus Growers Supplier Coop)' : 'Org A (Apex Retail Enterprise)',
        filter_param: simulateKSuppression ? 'REGION_WEST' : 'ALL',
        simulate_k_less_than_10: simulateKSuppression
      });
      setQueryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="bg-[#131F37] border-l-4 border-purple-500 rounded-r-xl p-4 text-xs text-slate-300 shadow-sm flex items-start space-x-3">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            Privacy Architecture Prototype Notice
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">
            This module is a prototype privacy-preserving data clean room architecture demonstrating k-anonymity (k=10) query suppression and cryptographic auditing. It is not a certified commercial secure data clean room.
          </p>
        </div>
      </div>

      {/* Organization Workspace Switcher */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Secure Data Collaboration Vault</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
              k = 10 Threshold
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enables retail and supplier organizations to collaborate on approved analytical questions without revealing raw customer or supplier commercial records.
          </p>
        </div>

        {/* Organization Toggle */}
        <div className="flex items-center space-x-2 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => { setActiveOrg('ORG_A'); setQueryResult(null); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeOrg === 'ORG_A'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Org A (Retailer Workspace)</span>
          </button>
          <button
            onClick={() => { setActiveOrg('ORG_B'); setQueryResult(null); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeOrg === 'ORG_B'
                ? 'bg-purple-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Org B (Supplier Workspace)</span>
          </button>
        </div>
      </div>

      {/* Query Formulation & Privacy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Approved Template & Privacy Policy (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E172A] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Approved Collaboration Query Template</span>
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Select Approved Business Question:</label>
            <select
              value={queryTemplate}
              onChange={(e) => setQueryTemplate(e.target.value)}
              className="w-full bg-[#131F37] border border-slate-700 rounded p-2.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="DEMAND_VS_SUPPLIER_CAPACITY">
                Compare Store Demand with Supplier Capacity
              </option>
              <option value="CROSS_ORGANIZATION_WASTAGE_BENCHMARK">
                Cross-Organization Cold-Chain Spoilage Benchmark
              </option>
            </select>
          </div>

          {/* Privacy Rules Enforcement Box */}
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400 block tracking-wider">
              Cryptographic Clean Room Policy:
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Aggregation Threshold:</span>
              <span className="font-mono text-cyan-300 font-bold">k ≥ 10 Entities</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Row-Level Access:</span>
              <span className="font-mono text-rose-400 font-bold">STRICTLY BLOCKED</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Query Execution:</span>
              <span className="font-mono text-emerald-400 font-bold">VERIFIED HASH</span>
            </div>
          </div>

          {/* Privacy Test Simulator Toggle */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-300 font-semibold block">Simulate Small Entity Filter:</span>
              <span className="text-[11px] text-slate-500 block">Trigger suppression rule (k &lt; 10 entities)</span>
            </div>
            <input
              type="checkbox"
              checked={simulateKSuppression}
              onChange={(e) => setSimulateKSuppression(e.target.checked)}
              className="w-4 h-4 accent-rose-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleExecuteQuery}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Evaluating Policy...' : 'Execute Privacy-Safe Query'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Column: Shared Aggregated Output (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cryptographically Approved Shared Output
              </h3>
              {queryResult && (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold border ${
                    queryResult.status === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {queryResult.status}
                </span>
              )}
            </div>

            {queryResult ? (
              <div className="mt-4 space-y-4">
                {/* Result Message */}
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    queryResult.is_suppressed
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="font-bold flex items-center space-x-1.5 mb-1 font-mono text-[11px]">
                    {queryResult.is_suppressed ? (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>AGGREGATION THRESHOLD VIOLATION (SUPPRESSED)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>PRIVACY POLICY VERIFIED & OUTPUT RELEASED</span>
                      </>
                    )}
                  </div>
                  {queryResult.summary}
                </div>

                {/* If approved: show aggregated table */}
                {queryResult.shared_aggregated_data && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Regional Cluster</th>
                          <th className="py-2.5 px-3 text-right">Stores (k)</th>
                          <th className="py-2.5 px-3 text-right">Demand Units</th>
                          <th className="py-2.5 px-3 text-right">Supplier Cap</th>
                          <th className="py-2.5 px-3 text-right">Utilization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {queryResult.shared_aggregated_data.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 text-white font-sans font-medium">{row.region}</td>
                            <td className="py-2.5 px-3 text-right text-purple-300 font-bold">{row.participating_stores_count}</td>
                            <td className="py-2.5 px-3 text-right text-slate-200">{row.aggregated_demand_units.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right text-slate-400">{row.supplier_capacity_units.toLocaleString()}</td>
                            <td className={`py-2.5 px-3 text-right font-bold ${row.capacity_utilization_pct > 92 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {row.capacity_utilization_pct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Click "Execute Privacy-Safe Query" to run the clean room query against private partner datasets.
              </div>
            )}
          </div>

          {/* Cryptographic Audit Hash */}
          {queryResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Hash className="w-3 h-3 text-slate-400" />
                <span>Audit Hash: {queryResult.cryptographic_verification_hash.slice(0, 24)}...</span>
              </span>
              <span>Matched k: {queryResult.matched_entity_count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
