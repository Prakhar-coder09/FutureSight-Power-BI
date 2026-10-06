import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AuditEventItem } from '../../types';
import { FileText, Shield, CheckCircle2, Search, Filter } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      setLoading(true);
      try {
        const res = await api.getAuditTrail();
        setEvents(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Loading Enterprise Compliance & Audit Trail...</span>
      </div>
    );
  }

  const filtered = events.filter((e) =>
    e.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.module_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Enterprise Governance Audit Trail</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically logged records of every forecast generation, what-if scenario, clean room query, and model retraining.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 bg-[#131F37] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search action or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Event Ledger ({filtered.length} Recorded)
          </h3>
          <span className="text-xs font-mono text-cyan-400">SOC2 / ISO Compliant Protocol</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">User & Org</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Execution Details</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{item.timestamp}</td>
                  <td className="py-3 px-3">
                    <div className="text-white font-sans font-medium">{item.username}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{item.organization}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700 text-[10px]">
                      {item.action_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{item.module_name}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans max-w-md truncate" title={item.details}>
                    {item.details}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
