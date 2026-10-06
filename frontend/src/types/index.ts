export type ActiveModule =
  | 'overview'
  | 'war_room'
  | 'forecast'
  | 'risk'
  | 'scenario'
  | 'value'
  | 'intelligence'
  | 'collaboration'
  | 'market'
  | 'model'
  | 'quality'
  | 'recommendations'
  | 'audit';

export interface GlobalFilterState {
  store: number | 'ALL';
  brand: string;
  horizonWeeks: number;
  riskTier: string;
}

export interface ExecutiveKPIs {
  current_revenue: number;
  forecast_revenue: number;
  forecast_growth_pct: number;
  forecast_accuracy_pct: number;
  high_risk_stores_count: number;
  high_risk_brands_count: number;
  revenue_at_risk: number;
  potential_opportunity_weekly: number;
  currency: string;
  prediction_interval_80: {
    lower: number;
    expected: number;
    upper: number;
  };
  accuracy_card: {
    mae: number;
    rmse: number;
    mape: string;
    wmape: string;
    r2: number;
    honest_accuracy_note: string;
  };
}

export interface TimelinePoint {
  week_starting: string;
  actual_revenue: number | null;
  forecast_revenue: number | null;
  lower_bound_80: number | null;
  upper_bound_80: number | null;
  type: 'ACTUAL' | 'FORECAST';
}

export interface RiskItem {
  store: number;
  brand: string;
  risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  avg_weekly_revenue: number;
  revenue_at_risk: number;
  recent_volume: number;
  recent_price: number;
  volatility_cv: number;
  reasons: string[];
}

export interface RiskRadarResponse {
  disclaimer: string;
  total_entities_evaluated: number;
  high_risk_stores_count: number;
  high_risk_brands_count: number;
  total_revenue_at_risk_weekly: number;
  risk_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  items: RiskItem[];
}

export interface RippleStage {
  stage: string;
  label: string;
  value: string;
  color: string;
}

export interface ScenarioSimulationResult {
  inputs: {
    price_delta_pct: number;
    advert_multiplier: number;
    demand_shock_pct: number;
    supply_constraint_pct: number;
    target_brand: string;
    target_store: number;
  };
  base_case: {
    revenue: number;
    quantity: number;
  };
  scenario: {
    revenue: number;
    quantity: number;
    revenue_delta: number;
    revenue_delta_pct: number;
    quantity_delta: number;
    quantity_delta_pct: number;
  };
  affected_entities: {
    stores_count: number;
    brands_count: number;
    declining_stores_count: number;
    growing_stores_count: number;
  };
  risk_level: string;
  confidence: number;
  recommended_action: string;
  ripple_chain: RippleStage[];
  label: string;
}

export interface AgentPerspective {
  agent: string;
  role: string;
  finding: string;
  evidence: string[];
  impact: string;
  confidence: number;
  recommendation: string;
}

export interface CoordinatorPerspective {
  agent: string;
  role: string;
  detected_conflicts: string[];
  consensus_verdict: string;
  actionable_directives: string[];
}

export interface WarRoomResponse {
  scenario_summary: ScenarioSimulationResult['scenario'];
  agents: {
    cfo_agent: AgentPerspective;
    operations_agent: AgentPerspective;
    sales_agent: AgentPerspective;
    risk_agent: AgentPerspective;
    coordinator: CoordinatorPerspective;
  };
}

export interface EBITDACockpitData {
  disclaimer: string;
  assumptions: {
    gross_margin_pct: number;
    opex_pct: number;
    ad_cost_per_event: number;
    logistics_cost_per_unit: number;
    wastage_pct: number;
  };
  kpis: {
    total_revenue: number;
    estimated_gross_profit: number;
    estimated_operating_cost: number;
    estimated_ebitda_proxy: number;
    ebitda_margin_pct: number;
    revenue_at_risk: number;
    potential_opportunity: number;
    wastage_cost: number;
    advert_spend: number;
    logistics_cost: number;
  };
  monthly_trend: Array<{
    period: string;
    revenue: number;
    gross_profit: number;
    ebitda_proxy: number;
    ebitda_margin_pct: number;
  }>;
}

export interface StoreIntelligenceData {
  store: number;
  brand: string;
  timeline: Array<{
    week_starting: string;
    quantity: number;
    price: number;
    advert: number;
    revenue: number;
  }>;
  kpis: {
    avg_weekly_revenue: number;
    avg_unit_price: number;
    avg_weekly_volume: number;
    total_period_revenue: number;
    volatility_cv: number;
    empirical_elasticity: number;
  };
}

export interface MarketSignalItem {
  id: string;
  name: string;
  category: string;
  current_value: number;
  unit: string;
  change_pct_30d: number;
  correlation_with_demand: number;
  status: 'LIVE' | 'STALE' | 'SIMULATED';
  source: string;
  last_updated: string;
  impact_interpretation: string;
}

export interface LeakageCheckItem {
  check_id: string;
  name: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  details: string;
  risk_level: string;
}

export interface BacktestResponse {
  split_summary: {
    train_weeks: string;
    val_weeks: string;
    test_weeks: string;
    train_rows: number;
    val_rows: number;
    test_rows: number;
  };
  ml_model_metrics: {
    mae: number;
    rmse: number;
    mape: number;
    wmape: number;
    forecast_bias: number;
    r2: number;
  };
  comparison_table: Array<{
    model_name: string;
    mae: number;
    rmse: number;
    mape: string;
    wmape: string;
    bias: string;
    r2: number;
    status: string;
  }>;
  wmape_improvement_vs_naive: number;
  honest_accuracy_note: string;
}

export interface DataQualityReport {
  is_valid: boolean;
  row_count: number;
  store_count: number;
  brand_count: number;
  weeks_count: number;
  min_date: string;
  max_date: string;
  missing_values_count: number;
  duplicate_rows_count: number;
  suspicious_values_count: number;
  data_freshness: string;
  quality_score: number;
  issues: Array<{
    severity: string;
    check: string;
    detail: string;
  }>;
  columns: string[];
}

export interface RecommendationOpportunity {
  id: string;
  type: string;
  store: number;
  brand: string;
  title: string;
  issue: string;
  evidence: string[];
  recommended_action: string;
  expected_impact: string;
  expected_revenue_gain_weekly: number;
  confidence_score: number;
  ease_of_intervention: 'Easy' | 'Moderate' | 'Complex';
  trade_off: string;
}

export interface AuditEventItem {
  id: number;
  timestamp: string;
  username: string;
  organization: string;
  action_type: string;
  module_name: string;
  details: string;
  permission_checked: string;
  status: string;
}

// -------------------------------------------------------------
// AI BUSINESS WAR ROOM TYPES
// -------------------------------------------------------------
export interface WarRoomTask {
  task_id: string;
  title: string;
  department: string;
  owner: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date: string;
  expected_impact: string;
  notes: string;
}

export interface WarRoomDecision {
  decision_id: string;
  title: string;
  decision_text: string;
  decided_by: string;
  approved_by: string;
  justification: string;
  expected_outcome: string;
  revenue_impact: number;
  margin_impact: number;
  risk_level: string;
  status: string;
  created_at: string;
}

export interface WarRoomEvent {
  event_id: string;
  timestamp: string;
  actor: string;
  event_type: string;
  summary: string;
  details: string;
}

export interface WarRoomState {
  war_room_id: string;
  title: string;
  situation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Triggered' | 'Investigating' | 'Decision Pending' | 'Approved' | 'Executing' | 'Monitoring' | 'Resolved' | 'Closed';
  metrics: {
    forecasted_revenue: number;
    target_revenue: number;
    gap_amount: number;
    gap_pct: number;
    days_remaining: number;
    currency: string;
    inr_forecast_cr: number;
    inr_target_cr: number;
    inr_gap_cr: number;
  };
  metadata: {
    owner: string;
    deadline: string;
    affected_areas: string[];
    created_at: string;
    progress_pct: number;
  };
  tasks: WarRoomTask[];
  decisions: WarRoomDecision[];
  timeline: WarRoomEvent[];
}

export interface ImpactNode {
  id: string;
  label: string;
  type: 'target' | 'shortfall' | 'driver' | 'entity' | 'constraint' | 'team';
  value: string;
  status: 'BENCHMARK' | 'CRITICAL' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'WARNING' | 'INFO' | 'ACTIONING';
  detail: string;
}

export interface ImpactEdge {
  from: string;
  to: string;
  label: string;
  weight: number;
}

export interface ImpactGraph {
  nodes: ImpactNode[];
  edges: ImpactEdge[];
}

export interface CopilotEvidence {
  metric_name: string;
  calculation: string;
  data_citations: Array<{ fact: string; value: string }>;
  confidence_score: number;
}

export interface CopilotResponse {
  query: string;
  answer: string;
  evidence: CopilotEvidence;
  suggested_prompts: string[];
}

export interface PostmortemData {
  war_room_id: string;
  title: string;
  resolution_date: string;
  predicted_vs_actual: {
    original_target: string;
    initial_unmitigated_forecast: string;
    initial_shortfall_at_risk: string;
    post_intervention_actual_revenue: string;
    gap_recovered_amount: string;
    recovery_rate_pct: string;
  };
  what_worked: string[];
  what_did_not_work: string[];
  systemic_learnings: string[];
  sign_offs: Array<{ role: string; status: string; date: string }>;
}

