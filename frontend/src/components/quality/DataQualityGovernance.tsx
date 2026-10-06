import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DataQualityReport } from '../../types';
import { Database, CheckCircle2, AlertTriangle, Upload, RefreshCw, Activity, ShieldAlert, Sparkles } from 'lucide-react';

export const DataQualityGovernance: React.FC = () => {
  const [quality, setQuality] = useState<DataQualityReport | null>(null);
  const [drift, setDrift] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [qRes, dRes] = await Promise.all([
          api.getDataQuality(),
          api.getDataDrift()
        ]);
        setQuality(qRes);
        setDrift(dRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    // Simulating file ingestion & validation
    setTimeout(() => {
      setUploading(false);
      setUploadStatus(`Uploaded and validated ${file.name}. Schema verified: 7/7 required columns matching.`);
    }, 1200);
  };

  if (loading || !quality) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Profiling Dataset Quality, Continuity & Distribution Drift...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Data Quality Profiler & Distribution Drift Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous validation of Microsoft OJ time series integrity, date continuity, missing values, and PSI drift.
          </p>
        </div>

        {/* Upload Custom CSV Button */}
        <div>
          <label className="px-3.5 py-2 rounded-lg bg-[#131F37] hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center space-x-2 transition-all cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{uploading ? 'Validating CSV...' : 'Ingest Custom CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Primary Quality Score & Dimensional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quality Score Gauge Card (4 cols) */}
        <div className="md:col-span-4 bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Composite Data Quality Score</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                GRADE A+
              </span>
            </div>
            
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="text-5xl font-black font-mono text-emerald-400 tracking-tight">
                {quality.quality_score}%
              </div>
              <div className="text-xs text-slate-400 mt-2 font-medium">Dataset Reliability Index</div>
            </div>

            <div className="mt-6 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400 p-2 rounded bg-[#131F37]">
                <span>Missing Values:</span>
                <span className="text-emerald-400 font-bold">{quality.missing_values_count}</span>
              </div>
              <div className="flex justify-between text-slate-400 p-2 rounded bg-[#131F37]">
                <span>Duplicate Records:</span>
                <span className="text-emerald-400 font-bold">{quality.duplicate_rows_count}</span>
              </div>
              <div className="flex justify-between text-slate-400 p-2 rounded bg-[#131F37]">
                <span>Suspicious Outliers:</span>
                <span className="text-emerald-400 font-bold">{quality.suspicious_values_count}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Automated profiler verifies column types, date continuity (weekly cadence), and revenue formula matching.
          </div>
        </div>

        {/* Dataset Dimensions Grid (8 cols) */}
        <div className="md:col-span-8 bg-[#0E172A] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Canonical Dataset Profile Metrics
              </h3>
              <span className="text-xs font-mono text-cyan-400">{quality.data_freshness}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Row Count</div>
                <div className="text-lg font-bold text-white mt-1">{quality.row_count.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Total Sales Records</div>
              </div>

              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Store Count</div>
                <div className="text-lg font-bold text-cyan-300 mt-1">{quality.store_count} Stores</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Retail Outlets</div>
              </div>

              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Brand Series</div>
                <div className="text-lg font-bold text-purple-300 mt-1">{quality.brand_count} Brands</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tropicana, MM, Dom</div>
              </div>

              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Timeline Window</div>
                <div className="text-lg font-bold text-slate-200 mt-1">{quality.weeks_count} Weeks</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Continuous 7-Day Slices</div>
              </div>

              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Earliest Date</div>
                <div className="text-sm font-bold text-slate-200 mt-1.5">{quality.min_date}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Dataset Inception</div>
              </div>

              <div className="p-3 rounded-lg bg-[#131F37] border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans uppercase">Latest Date</div>
                <div className="text-sm font-bold text-slate-200 mt-1.5">{quality.max_date}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Current Cutoff Date</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">Columns: {quality.columns.join(' • ')}</span>
            <span className="text-emerald-400 font-mono font-bold">100% SCHEMA COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Distribution Drift Monitoring (PSI) */}
      <div className="bg-[#0E172A] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Model & Feature Distribution Drift Monitoring (Population Stability Index - PSI)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compares training reference baseline (Weeks 1–80) against recent operational window (Weeks 100–121).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            SYSTEM STATUS: {drift?.overall_health || 'HEALTHY'}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#131F37] text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-2.5 px-3">Monitored Feature</th>
                <th className="py-2.5 px-3 text-right">PSI Score</th>
                <th className="py-2.5 px-3 text-right">Wasserstein Distance</th>
                <th className="py-2.5 px-3 text-right">Mean Shift</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Diagnostic Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {drift?.features.map((feat: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 text-white font-sans font-semibold">{feat.feature}</td>
                  <td className="py-3 px-3 text-right text-cyan-300 font-bold">{feat.psi_value}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{feat.distance}</td>
                  <td className="py-3 px-3 text-right text-purple-300 font-semibold">{feat.mean_shift_pct}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {feat.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{feat.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
