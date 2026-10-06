import React, { useState } from 'react';
import { ActiveModule, GlobalFilterState } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { ExecutiveControlRoom } from './components/executive/ExecutiveControlRoom';
import { ForecastStudio } from './components/forecast/ForecastStudio';
import { RiskRadar } from './components/risk/RiskRadar';
import { ScenarioSimulator } from './components/scenario/ScenarioSimulator';
import { ValueCreationCockpit } from './components/value/ValueCreationCockpit';
import { StoreBrandIntelligence } from './components/intelligence/StoreBrandIntelligence';
import { DataCollaborationVault } from './components/collaboration/DataCollaborationVault';
import { MarketSignals } from './components/market/MarketSignals';
import { ModelPerformance } from './components/model/ModelPerformance';
import { DataQualityGovernance } from './components/quality/DataQualityGovernance';
import { RecommendationCenter } from './components/recommendations/RecommendationCenter';
import { AuditLogView } from './components/audit/AuditLogView';
import { WarRoom } from './pages/WarRoom';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');

  const [filters, setFilters] = useState<GlobalFilterState>({
    store: 'ALL',
    brand: 'ALL',
    horizonWeeks: 4,
    riskTier: 'ALL'
  });

  const handleFilterChange = (updated: Partial<GlobalFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const getModuleTitle = (mod: ActiveModule) => {
    switch (mod) {
      case 'overview':
        return {
          title: 'Executive Control Room',
          subtitle: 'Holistic Enterprise Cockpit • Forecast Revenue, Demand Exposure & Value Recovery'
        };
      case 'war_room':
        return {
          title: 'AI Business War Room',
          subtitle: 'From Prediction to Action • Resolve Revenue Risks, Align Teams, and Execute Decisions'
        };
      case 'forecast':
        return {
          title: 'Forecast Studio',
          subtitle: 'Granular Store × Brand Forward Projections • Prediction Intervals & Causal Validation'
        };
      case 'risk':
        return {
          title: 'Demand & Revenue Risk Radar',
          subtitle: 'Operational Velocity Erosion & Price Sensitivity Monitoring (Store & Brand Level)'
        };
      case 'scenario':
        return {
          title: 'What-If Scenario Lab & Chaos Simulator',
          subtitle: 'Interactive Commercial Stress Testing • Ripple Effect Impact Chain'
        };
      case 'value':
        return {
          title: 'Value Creation & EBITDA Cockpit',
          subtitle: 'Configurable Financial Assumptions • Operational Margin & Gross Profit Breakdown'
        };
      case 'intelligence':
        return {
          title: 'Store & Brand Intelligence',
          subtitle: 'Micro-Level Time-Series History, Elasticity Curves & Volume Dispersion'
        };
      case 'collaboration':
        return {
          title: 'Data Collaboration Vault',
          subtitle: 'Privacy-Preserving Clean Room Architecture • k = 10 Aggregation Threshold Enforcement'
        };
      case 'market':
        return {
          title: 'External Market Signals Adapter',
          subtitle: 'Macroeconomic Inflation, Weather Disruption, and Commodity FCOJ Feeds'
        };
      case 'model':
        return {
          title: 'Model Performance & Leakage Protection',
          subtitle: 'Walk-Forward Time-Based Backtest (Weeks 101–121) • Automated Feature Leakage Audit'
        };
      case 'quality':
        return {
          title: 'Data Quality Profiler & Drift Monitor',
          subtitle: 'Canonical Microsoft OJ Schema Validation, Continuity Verification & PSI Metric Tracking'
        };
      case 'recommendations':
        return {
          title: 'Loss & Opportunity Detection Center',
          subtitle: 'Evidence-Ranked Interventions & Multi-Agent Dialectical Reasoning Layer'
        };
      case 'audit':
        return {
          title: 'Enterprise Governance Audit Ledger',
          subtitle: 'Cryptographic Immutable Trail for Regulatory and SOC2 Compliance'
        };
    }
  };

  const currentMeta = getModuleTitle(activeModule);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1120] text-slate-100 font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar activeModule={activeModule} onSelectModule={setActiveModule} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation & Global Filters */}
        <TopNav
          filters={filters}
          onFilterChange={handleFilterChange}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto bg-[#0B1120] pb-12">
          {activeModule === 'overview' && (
            <ExecutiveControlRoom
              filters={filters}
              onNavigateToScenario={() => setActiveModule('scenario')}
              onNavigateToRisk={() => setActiveModule('risk')}
              onOpenWarRoom={() => setActiveModule('war_room')}
            />
          )}

          {activeModule === 'war_room' && (
            <WarRoom />
          )}

          {activeModule === 'forecast' && <ForecastStudio filters={filters} />}

          {activeModule === 'risk' && <RiskRadar filters={filters} />}

          {activeModule === 'scenario' && <ScenarioSimulator filters={filters} />}

          {activeModule === 'value' && <ValueCreationCockpit />}

          {activeModule === 'intelligence' && <StoreBrandIntelligence filters={filters} />}

          {activeModule === 'collaboration' && <DataCollaborationVault />}

          {activeModule === 'market' && <MarketSignals />}

          {activeModule === 'model' && <ModelPerformance />}

          {activeModule === 'quality' && <DataQualityGovernance />}

          {activeModule === 'recommendations' && (
            <RecommendationCenter onOpenWarRoom={() => setActiveModule('scenario')} />
          )}

          {activeModule === 'audit' && <AuditLogView />}
        </main>
      </div>
    </div>
  );
};
export default App;
