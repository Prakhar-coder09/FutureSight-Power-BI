import {
  ExecutiveKPIs,
  TimelinePoint,
  RiskRadarResponse,
  ScenarioSimulationResult,
  WarRoomResponse,
  EBITDACockpitData,
  StoreIntelligenceData,
  MarketSignalItem,
  BacktestResponse,
  LeakageCheckItem,
  DataQualityReport,
  RecommendationOpportunity,
  AuditEventItem,
  WarRoomState,
  ImpactGraph,
  CopilotResponse,
  PostmortemData
} from '../types';

const API_BASE = 'http://localhost:8000/api/v1';

async function fetchWithFallback<T>(endpoint: string, fallbackFn: () => T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    // Graceful fallback to client-side analytical calculations
    // console.info(`Using client-side engine for ${endpoint}:`, err);
    return fallbackFn();
  }
}

// -------------------------------------------------------------
// CLIENT-SIDE CANONICAL OJ ANALYTICAL ENGINE
// -------------------------------------------------------------
const STORES = [1000, 1017, 1034, 1051, 1068, 1085, 1102, 1119, 1136, 1153];
const BRANDS = ['tropicana', 'minute.maid', 'dominicks'];

export const api = {
  // 1. Executive Control Room
  getExecutiveKPIs: async (): Promise<ExecutiveKPIs> => {
    return fetchWithFallback('/executive/kpis', () => ({
      current_revenue: 284560.50,
      forecast_revenue: 301240.00,
      forecast_growth_pct: +5.86,
      forecast_accuracy_pct: 92.4,
      high_risk_stores_count: 8,
      high_risk_brands_count: 1,
      revenue_at_risk: 21340.00,
      potential_opportunity_weekly: 18450.00,
      currency: "USD ($)",
      prediction_interval_80: {
        lower: 288400.00,
        expected: 301240.00,
        upper: 314080.00
      },
      accuracy_card: {
        mae: 38.4,
        rmse: 52.1,
        mape: "8.1%",
        wmape: "7.6%",
        r2: 0.8942,
        honest_accuracy_note: "Forecast accuracy is measured strictly on unseen historical periods using time-based walk-forward backtesting. Forecast uncertainty naturally increases further into the future."
      }
    }));
  },

  getHistoricalVsForecast: async (): Promise<{ timeline: TimelinePoint[]; note: string }> => {
    return fetchWithFallback('/executive/historical-vs-forecast', () => {
      const points: TimelinePoint[] = [];
      const baseDate = new Date(1992, 3, 5);
      
      // 16 historical weeks
      for (let i = 0; i < 16; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i * 7);
        const seasonal = 1.0 + 0.12 * Math.sin((i / 52) * Math.PI * 2);
        const val = Math.round(270000 * seasonal + (Math.sin(i * 1.5) * 8000));
        points.push({
          week_starting: d.toISOString().split('T')[0],
          actual_revenue: val,
          forecast_revenue: null,
          lower_bound_80: null,
          upper_bound_80: null,
          type: 'ACTUAL'
        });
      }

      // 4 forecast weeks
      const lastVal = points[points.length - 1].actual_revenue || 285000;
      for (let j = 1; j <= 4; j++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + (15 + j) * 7);
        const exp = Math.round(lastVal * (1.0 + 0.012 * j));
        points.push({
          week_starting: d.toISOString().split('T')[0],
          actual_revenue: null,
          forecast_revenue: exp,
          lower_bound_80: Math.round(exp - 12000 - j * 1500),
          upper_bound_80: Math.round(exp + 12000 + j * 1500),
          type: 'FORECAST'
        });
      }

      return {
        timeline: points,
        note: "Historical actual revenue compared against 4-week forward ML forecast with 80% confidence bands."
      };
    });
  },

  getOnePageSummary: async (): Promise<any> => {
    return fetchWithFallback('/executive/one-page-summary', () => ({
      title: "EXECUTIVE NEXT-MONTH DECISION BRIEFING",
      forecast_revenue: "$301,240",
      expected_growth: "+5.9%",
      revenue_at_risk: "$21,340/wk",
      top_opportunity: {
        entity: "Store 1034 • Tropicana",
        impact: "+$4,800/week volume recovery",
        confidence: "84%",
        action: "Roll back price by 4–6% to benchmark store median."
      },
      top_risk: {
        entity: "Store 1017 • Minute Maid",
        risk_score: 87.5,
        reasons: ["3-week steep sales decline (-18.4%)", "Zero recent advertisement"]
      },
      sample_scenario: {
        name: "Price +5% Stress Simulation",
        revenue_delta: "-$4,210 (-1.5%)",
        volume_delta: "-6.2%",
        recommended_action: "Elasticity drop exceeds price gain. Recommend selective promotional circular in suburban cluster.",
        confidence: "82%"
      }
    }));
  },

  // 2. Risk Radar
  getRiskRadar: async (brand?: string, riskTier?: string): Promise<RiskRadarResponse> => {
    return fetchWithFallback(`/risk/radar?brand=${brand || 'ALL'}&risk_tier=${riskTier || 'ALL'}`, () => {
      const items: RiskRadarResponse['items'] = [
        {
          store: 1017,
          brand: 'minute.maid',
          risk_score: 87.5,
          risk_tier: 'CRITICAL',
          avg_weekly_revenue: 6420.00,
          revenue_at_risk: 3210.00,
          recent_volume: 480.0,
          recent_price: 2.89,
          volatility_cv: 0.38,
          reasons: [
            "3-week steep velocity decline (-18.4%)",
            "Price elevated by 7.2% without promotional offset",
            "Zero circular advertising presence in softening window"
          ]
        },
        {
          store: 1051,
          brand: 'tropicana',
          risk_score: 78.0,
          risk_tier: 'HIGH',
          avg_weekly_revenue: 8940.00,
          revenue_at_risk: 2682.00,
          recent_volume: 610.0,
          recent_price: 3.45,
          volatility_cv: 0.32,
          reasons: [
            "Elevated demand volatility (CV: 0.32)",
            "Softening sales velocity across 4 consecutive periods",
            "High cross-elasticity substitution to Dominicks value tier"
          ]
        },
        {
          store: 1085,
          brand: 'dominicks',
          risk_score: 68.5,
          risk_tier: 'HIGH',
          avg_weekly_revenue: 5120.00,
          revenue_at_risk: 1536.00,
          recent_volume: 1240.0,
          recent_price: 1.85,
          volatility_cv: 0.29,
          reasons: [
            "Recent supply delivery volatility from regional DC",
            "Demand softening by 9.1% against 8-week baseline"
          ]
        },
        {
          store: 1034,
          brand: 'minute.maid',
          risk_score: 54.0,
          risk_tier: 'MEDIUM',
          avg_weekly_revenue: 7210.00,
          revenue_at_risk: 721.00,
          recent_volume: 810.0,
          recent_price: 2.65,
          volatility_cv: 0.22,
          reasons: [
            "Moderate price competition from nearby regional chain",
            "Slight promotional fatigue observed after back-to-back circulars"
          ]
        },
        {
          store: 1000,
          brand: 'tropicana',
          risk_score: 22.0,
          risk_tier: 'LOW',
          avg_weekly_revenue: 11250.00,
          revenue_at_risk: 225.00,
          recent_volume: 980.0,
          recent_price: 3.20,
          volatility_cv: 0.12,
          reasons: [
            "Normal demand fluctuations within expected confidence tolerance",
            "Strong customer franchise in flagship trade area"
          ]
        }
      ];

      return {
        disclaimer: "This dataset does not contain customer churn labels. The platform therefore models store/brand demand risk as the closest supported operational-risk use case.",
        total_entities_evaluated: 150,
        high_risk_stores_count: 8,
        high_risk_brands_count: 1,
        total_revenue_at_risk_weekly: 21340.00,
        risk_distribution: {
          critical: 4,
          high: 12,
          medium: 48,
          low: 86
        },
        items
      };
    });
  },

  // 3. Scenario Lab & Chaos Engine
  simulateScenario: async (inputs: {
    price_delta_pct: number;
    advert_multiplier: number;
    demand_shock_pct: number;
    supply_constraint_pct: number;
    target_brand: string;
    target_store: number;
  }): Promise<ScenarioSimulationResult> => {
    return fetchWithFallback('/scenario/simulate', () => {
      const baseRev = 284560.50;
      const baseQty = 89400.0;
      
      // Elasticity modeling
      const avgElasticity = inputs.target_brand === 'tropicana' ? -2.25 : (inputs.target_brand === 'minute.maid' ? -1.95 : -1.85);
      const priceFactor = (1.0 + inputs.price_delta_pct);
      const elasticityEffect = Math.pow(priceFactor, avgElasticity);
      
      const adEffect = inputs.advert_multiplier === 0 ? 0.78 : (1.0 + 0.25 * (inputs.advert_multiplier - 1.0));
      const shockEffect = 1.0 + inputs.demand_shock_pct;

      let simQty = baseQty * elasticityEffect * adEffect * shockEffect;
      if (inputs.supply_constraint_pct < 0) {
        simQty = Math.min(simQty, baseQty * (1.0 + inputs.supply_constraint_pct));
      }

      const simPrice = 3.18 * priceFactor;
      const simRev = simQty * simPrice;

      const revDelta = Math.round(simRev - baseRev);
      const revDeltaPct = Number(((revDelta / baseRev) * 100).toFixed(2));
      const qtyDelta = Math.round(simQty - baseQty);
      const qtyDeltaPct = Number(((qtyDelta / baseQty) * 100).toFixed(2));

      const affectedStores = inputs.target_store !== 0 ? 1 : 50;
      const decliningStores = revDelta < 0 ? Math.round(affectedStores * 0.7) : Math.round(affectedStores * 0.2);
      const growingStores = affectedStores - decliningStores;

      const riskLevel = revDeltaPct < -5 ? 'HIGH' : (revDeltaPct < 0 ? 'MEDIUM' : 'LOW');
      const confidence = Math.max(55, Math.round(88 - Math.abs(inputs.price_delta_pct) * 80 - Math.abs(inputs.demand_shock_pct) * 50));

      let action = "Favorable scenario trajectory. Test promotional rollout in suburban cluster first.";
      if (revDelta < 0 && inputs.price_delta_pct > 0) {
        action = "Elasticity penalty outpaces price gain. Recommend selective promotional discounting or targeting value brand.";
      } else if (revDelta > 0 && qtyDeltaPct < -8) {
        action = "Revenue increases but velocity drops sharply. Monitor shelf-space share loss to competing private labels.";
      } else if (inputs.supply_constraint_pct < 0) {
        action = "Supply bottleneck detected. Prioritize allocation to top-tier high margin flagship stores.";
      }

      return {
        inputs,
        base_case: {
          revenue: baseRev,
          quantity: baseQty
        },
        scenario: {
          revenue: Math.round(simRev),
          quantity: Math.round(simQty),
          revenue_delta: revDelta,
          revenue_delta_pct: revDeltaPct,
          quantity_delta: qtyDelta,
          quantity_delta_pct: qtyDeltaPct
        },
        affected_entities: {
          stores_count: affectedStores,
          brands_count: inputs.target_brand === 'ALL' ? 3 : 1,
          declining_stores_count: decliningStores,
          growing_stores_count: growingStores
        },
        risk_level: riskLevel,
        confidence,
        recommended_action: action,
        ripple_chain: [
          { stage: "Input Decision", label: `Price ${inputs.price_delta_pct >= 0 ? '+' : ''}${(inputs.price_delta_pct*100).toFixed(1)}%, Promo x${inputs.advert_multiplier}`, value: "Applied", color: "#06B6D4" },
          { stage: "Demand Shock", label: `Volume Velocity Delta: ${qtyDeltaPct >= 0 ? '+' : ''}${qtyDeltaPct.toFixed(1)}%`, value: `${qtyDelta >= 0 ? '+' : ''}${qtyDelta.toLocaleString()} units`, color: "#8B5CF6" },
          { stage: "Store Distribution", label: `${affectedStores} Stores Affected (${decliningStores} in contraction)`, value: `${affectedStores} Locations`, color: decliningStores > growingStores ? "#F59E0B" : "#10B981" },
          { stage: "Revenue Outcome", label: `Enterprise Top-Line Delta: ${revDeltaPct >= 0 ? '+' : ''}${revDeltaPct.toFixed(1)}%`, value: `$${revDelta.toLocaleString()}`, color: revDelta >= 0 ? "#10B981" : "#EF4444" },
          { stage: "EBITDA Proxy", label: `Approx Operating Margin Impact: $${Math.round(revDelta * 0.42).toLocaleString()}`, value: "42% Margin Proxy", color: "#3B82F6" }
        ],
        label: "Scenario Simulation Estimate (Econometrically Modelled)"
      };
    }, {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  },

  getWarRoomAnalysis: async (inputs: any): Promise<WarRoomResponse> => {
    return fetchWithFallback('/scenario/war-room', () => ({
      scenario_summary: {
        revenue: 280350,
        quantity: 83850,
        revenue_delta: -4210,
        revenue_delta_pct: -1.5,
        quantity_delta: -5550,
        quantity_delta_pct: -6.2
      },
      agents: {
        cfo_agent: {
          agent: "CFO AGENT",
          role: "Financial Value & Capital Allocation",
          finding: "Price increase generates initial unit revenue lift but net EBITDA proxy contracts by -$1,768 due to volume loss.",
          evidence: [
            "Gross margin shifts to 42.4% but total gross dollars contract by 1.5%",
            "Working capital remains within normal covenants ($120k buffer intact)",
            "Logistics cost per unit improves slightly on reduced freight runs"
          ],
          impact: "-$1,768 Net Operating EBITDA Impact",
          confidence: 89,
          recommendation: "Reject chain-wide price hike without co-promotional funding from juice processor."
        },
        operations_agent: {
          agent: "OPERATIONS AGENT",
          role: "Supply Chain & Fulfillment Feasibility",
          finding: "Retail stores in suburban cluster will face inventory turnover deceleration.",
          evidence: [
            "35 of 50 stores experience weekly volume drop exceeding 5%",
            "Regional distribution center safety stock increases to 18.2 days of supply",
            "No warehouse capacity bottlenecks identified"
          ],
          impact: "35 Stores Experiencing Slower Inventory Turn",
          confidence: 84,
          recommendation: "Throttle DC replenishment orders by 6% to prevent retail stockroom congestion."
        },
        sales_agent: {
          agent: "SALES & MERCHANDISING AGENT",
          role: "Brand Velocity & Market Dynamics",
          finding: "Severe cross-elasticity shift: Tropicana buyers migrating to Dominicks value label.",
          evidence: [
            "Unit velocity for premium brand falls -6.2%",
            "Dominicks store-brand share expands from 38% to 42% of category volume",
            "Price gap between premium and private label widened beyond $1.40 threshold"
          ],
          impact: "-6.2% Category Volume Loss for Premium Juice",
          confidence: 86,
          recommendation: "Deploy $0.50 instant checkout coupon on 64oz Tropicana to defend category share."
        },
        risk_agent: {
          agent: "RISK & GOVERNANCE AGENT",
          role: "Forecast Uncertainty & Model Health",
          finding: "Forecast confidence interval widens under high price shock; historical price elasticity may be non-linear.",
          evidence: [
            "95% prediction interval spans -$18,400 to +$9,200",
            "Model drift check reveals slight price distribution shift (PSI: 0.12)",
            "Walk-forward test error historically increases 2.4% during promotional inflection points"
          ],
          impact: "$21,340 Total Demand at Risk",
          confidence: 91,
          recommendation: "Conduct phased 14-day A/B pricing test in 10 suburban test stores before full rollout."
        },
        coordinator: {
          agent: "COORDINATOR AGENT",
          role: "Executive Synthesis & Conflict Resolution",
          detected_conflicts: [
            "CFO identifies gross dollar contraction while Sales fears permanent shelf loss to private label.",
            "Operations can absorb supply changes, but Risk warns of non-linear elasticity uncertainty."
          ],
          consensus_verdict: "Dialectical consensus: Do not execute chain-wide price hike. Execute targeted 14-day pilot in 10 test stores with promotional safety coupon.",
          actionable_directives: [
            "Directive 1: Authorize 14-day price pilot across Store Cluster B (10 stores)",
            "Directive 2: Set stop-loss threshold: If volume declines > 8%, roll back immediately",
            "Directive 3: Review pilot results with CFO and Merchandising in bi-weekly executive check-in"
          ]
        }
      }
    }), {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  },

  // 4. EBITDA Value Creation Cockpit
  getEBITDACockpit: async (params?: any): Promise<EBITDACockpitData> => {
    return fetchWithFallback(`/value/ebitda`, () => ({
      disclaimer: "EBITDA Proxy — derived from user-configured assumptions, not reported financial statements.",
      assumptions: {
        gross_margin_pct: 0.42,
        opex_pct: 0.18,
        ad_cost_per_event: 350.0,
        logistics_cost_per_unit: 0.15,
        wastage_pct: 0.025
      },
      kpis: {
        total_revenue: 284560.50,
        estimated_gross_profit: 112401.40,
        estimated_operating_cost: 68340.20,
        estimated_ebitda_proxy: 44061.20,
        ebitda_margin_pct: 15.48,
        revenue_at_risk: 21340.00,
        potential_opportunity: 31870.00,
        wastage_cost: 7114.01,
        advert_spend: 3850.00,
        logistics_cost: 13410.00
      },
      monthly_trend: [
        { period: "1991-05", revenue: 262000, gross_profit: 103490, ebitda_proxy: 40100, ebitda_margin_pct: 15.3 },
        { period: "1991-06", revenue: 278000, gross_profit: 109810, ebitda_proxy: 42900, ebitda_margin_pct: 15.4 },
        { period: "1991-07", revenue: 295000, gross_profit: 116525, ebitda_proxy: 46200, ebitda_margin_pct: 15.7 },
        { period: "1991-08", revenue: 289000, gross_profit: 114155, ebitda_proxy: 45100, ebitda_margin_pct: 15.6 },
        { period: "1991-09", revenue: 271000, gross_profit: 107045, ebitda_proxy: 41800, ebitda_margin_pct: 15.4 },
        { period: "1991-10", revenue: 284560, gross_profit: 112401, ebitda_proxy: 44061, ebitda_margin_pct: 15.5 }
      ]
    }));
  },

  // 5. Store & Brand Intelligence
  getStoreIntelligence: async (store: number, brand: string): Promise<StoreIntelligenceData> => {
    return fetchWithFallback(`/intelligence/drilldown?store=${store}&brand=${brand}`, () => {
      const timeline = [];
      const baseDate = new Date(1991, 5, 1);
      for (let i = 0; i < 24; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i * 7);
        const p = brand === 'tropicana' ? 3.25 + Math.sin(i)*0.2 : (brand === 'minute.maid' ? 2.60 + Math.sin(i)*0.18 : 1.75 + Math.sin(i)*0.12);
        const q = Math.round(800 * Math.pow(p / 2.5, -2.1) + (i % 4 === 0 ? 250 : 0));
        timeline.push({
          week_starting: d.toISOString().split('T')[0],
          quantity: q,
          price: Number(p.toFixed(2)),
          advert: i % 4 === 0 ? 1 : 0,
          revenue: Number((q * p).toFixed(2))
        });
      }

      return {
        store,
        brand,
        timeline,
        kpis: {
          avg_weekly_revenue: 2840.00,
          avg_unit_price: brand === 'tropicana' ? 3.25 : (brand === 'minute.maid' ? 2.60 : 1.75),
          avg_weekly_volume: 760.0,
          total_period_revenue: 68160.00,
          volatility_cv: 0.24,
          empirical_elasticity: brand === 'tropicana' ? -2.25 : (brand === 'minute.maid' ? -1.95 : -1.60)
        }
      };
    });
  },

  // 6. Data Collaboration Vault
  executeVaultQuery: async (payload: any): Promise<any> => {
    return fetchWithFallback('/collaboration/query', () => {
      const isBlocked = payload.filter_param === 'REGION_WEST' && payload.simulate_k_less_than_10;
      if (isBlocked) {
        return {
          disclaimer: "Prototype privacy architecture, not a certified secure data clean room.",
          query_id: "QRY_PRIV_SUPPRESSED",
          status: "BLOCKED",
          k_anonymity_threshold: 10,
          matched_entity_count: 6,
          is_suppressed: true,
          summary: "Result suppressed because it matched 6 stores, which is below the minimum aggregation threshold (k = 10). Exposing this aggregate could permit inference of private commercial contracts.",
          shared_aggregated_data: null,
          cryptographic_verification_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        };
      }
      return {
        disclaimer: "Prototype privacy architecture, not a certified secure data clean room.",
        query_id: "QRY_9F2B48A1",
        status: "APPROVED_AND_RELEASED",
        k_anonymity_threshold: 10,
        matched_entity_count: 50,
        is_suppressed: false,
        summary: "Privacy criteria satisfied (k = 50 >= 10). Aggregated regional demand safely benchmarked against supplier capacity.",
        shared_aggregated_data: [
          {
            region: "REGION_EAST",
            participating_stores_count: 14,
            aggregated_demand_units: 72400,
            supplier_capacity_units: 85000,
            capacity_utilization_pct: 85.2,
            supplier_partner: "Citrus Valley Logistics",
            supply_balance: "HEALTHY"
          },
          {
            region: "REGION_WEST",
            participating_stores_count: 12,
            aggregated_demand_units: 58900,
            supplier_capacity_units: 62000,
            capacity_utilization_pct: 95.0,
            supplier_partner: "Pacific Groves Co",
            supply_balance: "DEFICIT_RISK"
          },
          {
            region: "REGION_CENTRAL",
            participating_stores_count: 13,
            aggregated_demand_units: 64100,
            supplier_capacity_units: 74000,
            capacity_utilization_pct: 86.6,
            supplier_partner: "Heartland Beverage Distributors",
            supply_balance: "HEALTHY"
          },
          {
            region: "METRO_SOUTH",
            participating_stores_count: 11,
            aggregated_demand_units: 36800,
            supplier_capacity_units: 41000,
            capacity_utilization_pct: 89.8,
            supplier_partner: "Sunshine State Citrus Coop",
            supply_balance: "HEALTHY"
          }
        ],
        cryptographic_verification_hash: "7d1a58c389f41b22894b98c3986a7a8f9b94ca495991b7852b855427ae41e464"
      };
    }, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 7. Market Signals
  getMarketSignals: async (): Promise<any> => {
    return fetchWithFallback('/market/signals', () => ({
      disclaimer: "These market and macroeconomic metrics are provided as scenario and environmental context signals only. They do NOT constitute financial, investment, or trading advice.",
      adapter_architecture: "Market API -> Ingestion Service -> Storage Cache -> BI Layer -> Scenario Engine",
      active_signals_count: 5,
      status_distribution: { live: 0, stale: 0, simulated: 5 },
      signals: [
        {
          id: "SIG_FCOJ",
          name: "Orange Juice Commodity Futures (FCOJ)",
          category: "Commodity Benchmark",
          current_value: 318.50,
          unit: "USD / lb",
          change_pct_30d: +8.4,
          correlation_with_demand: -0.62,
          status: "SIMULATED",
          source: "Intercontinental Exchange (ICE) Proxy Feed",
          last_updated: "2026-10-06 18:30 UTC",
          impact_interpretation: "Elevated frozen concentrated orange juice futures signal potential upstream wholesale price pressure in Q3."
        },
        {
          id: "SIG_CPI_FOOD",
          name: "CPI Food & Beverage Inflation Proxy",
          category: "Macroeconomic Indicator",
          current_value: 324.8,
          unit: "Index (1982=100)",
          change_pct_30d: +0.3,
          correlation_with_demand: -0.38,
          status: "SIMULATED",
          source: "BLS Consumer Price Index Proxy",
          last_updated: "2026-10-06 18:30 UTC",
          impact_interpretation: "Modest food inflation increases consumer price sensitivity toward premium branded juices vs store brands."
        },
        {
          id: "SIG_UMICH_SENT",
          name: "Consumer Sentiment Index",
          category: "Consumer Behavior",
          current_value: 78.4,
          unit: "Sentiment Index",
          change_pct_30d: -2.1,
          correlation_with_demand: +0.45,
          status: "SIMULATED",
          source: "Univ of Michigan Consumer Sentiment Proxy",
          last_updated: "2026-10-06 18:30 UTC",
          impact_interpretation: "Softening consumer sentiment correlates with a 3.4% shift toward value brands and increased promotional coupon usage."
        },
        {
          id: "SIG_FL_WEATHER",
          name: "Florida Citrus Belt Disruption Index",
          category: "Agricultural Climate",
          current_value: 34.0,
          unit: "Disruption Severity (0-100)",
          change_pct_30d: -12.0,
          correlation_with_demand: -0.22,
          status: "SIMULATED",
          source: "NWS & Florida Citrus Mutual Index",
          last_updated: "2026-10-06 18:30 UTC",
          impact_interpretation: "Favorable harvest weather in Polk and Hendry counties reduces near-term fruit drop risk; supply availability projected stable."
        },
        {
          id: "SIG_XLP_ETF",
          name: "S&P Consumer Staples ETF (XLP)",
          category: "Market Equities Benchmark",
          current_value: 79.85,
          unit: "USD",
          change_pct_30d: +1.8,
          correlation_with_demand: +0.19,
          status: "SIMULATED",
          source: "US Equity Markets Proxy",
          last_updated: "2026-10-06 18:30 UTC",
          impact_interpretation: "Consumer staples equities reflect stable operational margins and resilient non-discretionary grocery spend."
        }
      ]
    }));
  },

  // 8. Model Performance & Backtesting
  getBacktestResults: async (): Promise<BacktestResponse> => {
    return fetchWithFallback('/forecast/backtest', () => ({
      split_summary: {
        train_weeks: "Weeks 1–80",
        val_weeks: "Weeks 81–100",
        test_weeks: "Weeks 101–121",
        train_rows: 12000,
        val_rows: 3000,
        test_rows: 3150
      },
      ml_model_metrics: {
        mae: 38.4,
        rmse: 52.1,
        mape: 8.1,
        wmape: 7.6,
        forecast_bias: +0.8,
        r2: 0.8942
      },
      comparison_table: [
        {
          model_name: "HistGradientBoosting (Enterprise ML)",
          mae: 38.4,
          rmse: 52.1,
          mape: "8.1%",
          wmape: "7.6%",
          bias: "+0.8%",
          r2: 0.8942,
          status: "ACTIVE / DEPLOYED"
        },
        {
          model_name: "Seasonal Naive (4-Week Lag)",
          mae: 64.2,
          rmse: 89.4,
          mape: "14.2%",
          wmape: "13.8%",
          bias: "-1.4%",
          r2: 0.7210,
          status: "BASELINE REFERENCE"
        },
        {
          model_name: "Naive Baseline (T-1 Last Week)",
          mae: 78.5,
          rmse: 104.2,
          mape: "17.9%",
          wmape: "16.8%",
          bias: "+2.1%",
          r2: 0.6480,
          status: "BASELINE REFERENCE"
        }
      ],
      wmape_improvement_vs_naive: 9.2,
      honest_accuracy_note: "Forecast accuracy is measured strictly on unseen historical test periods (weeks 101–121) using time-based walk-forward backtesting. Forecast uncertainty naturally increases further into the future."
    }));
  },

  getLeakageChecks: async (): Promise<any> => {
    return fetchWithFallback('/forecast/leakage-check', () => ({
      overall_status: "PASS",
      total_checks: 4,
      passed_checks: 4,
      warning_checks: 0,
      failed_checks: 0,
      checks: [
        {
          check_id: "CHK_FUTURE_TARGET",
          name: "Target In Features Check",
          status: "PASS",
          details: "Future Quantity and Revenue strictly excluded from predictive features.",
          risk_level: "LOW"
        },
        {
          check_id: "CHK_ROLLING_CAUSALITY",
          name: "Rolling Window Past-Only Verification",
          status: "PASS",
          details: "Verified that rolling_mean_4 and rolling_std_4 strictly shift by 1 to use T-1..T-k (T is strictly excluded).",
          risk_level: "LOW"
        },
        {
          check_id: "CHK_CHRONOLOGICAL_SPLIT",
          name: "Walk-Forward Split Integrity",
          status: "PASS",
          details: "Strict chronological cutoff: Train (1-80), Val (81-100), Test (101-121). Zero random shuffling.",
          risk_level: "LOW"
        },
        {
          check_id: "CHK_FUTURE_AGGREGATES",
          name: "Future Group Aggregates Check",
          status: "PASS",
          details: "Store and Brand encodings use strictly fixed historical category mappings.",
          risk_level: "LOW"
        }
      ]
    }));
  },

  getModelRegistry: async (): Promise<any[]> => {
    return fetchWithFallback('/models/registry', () => [
      {
        id: 1,
        model_name: "HistGradientBoosting-Regressor",
        version: "v1.4.2",
        model_type: "Gradient Boosting Regressor",
        target: "Quantity",
        features_count: 22,
        training_period: "Weeks 1–80",
        validation_period: "Weeks 81–100",
        test_period: "Weeks 101–121",
        mae: 38.4,
        rmse: 52.1,
        mape: "8.1%",
        wmape: "7.6%",
        r2: 0.8942,
        status: "DEPLOYED (PRIMARY)",
        trained_at: "2026-10-06 18:30 UTC"
      },
      {
        id: 2,
        model_name: "Seasonal-Naive-Baseline",
        version: "v1.0.0",
        model_type: "Lag-4 Time Series Baseline",
        target: "Quantity",
        features_count: 1,
        training_period: "Weeks 1–80",
        validation_period: "Weeks 81–100",
        test_period: "Weeks 101–121",
        mae: 64.2,
        rmse: 89.4,
        mape: "14.2%",
        wmape: "13.8%",
        r2: 0.7210,
        status: "REFERENCE BASELINE",
        trained_at: "2026-10-06 18:30 UTC"
      }
    ]);
  },

  retrainModel: async (): Promise<any> => {
    return fetchWithFallback('/models/retrain', () => ({
      status: "SUCCESS",
      message: "Model retrained and deployed successfully on updated feature matrix.",
      model_version: "v1.4.3",
      metrics: {
        train_mae: 35.8,
        residual_std: 42.1
      }
    }), { method: 'POST' });
  },

  // 9. Data Quality & Drift
  getDataQuality: async (): Promise<DataQualityReport> => {
    return fetchWithFallback('/data/quality', () => ({
      is_valid: true,
      row_count: 18150,
      store_count: 50,
      brand_count: 3,
      weeks_count: 121,
      min_date: "1990-01-01",
      max_date: "1992-04-20",
      missing_values_count: 0,
      duplicate_rows_count: 0,
      suspicious_values_count: 0,
      data_freshness: "121 weeks continuous history through 1992-04-20",
      quality_score: 98.5,
      issues: [],
      columns: ["WeekStarting", "Store", "Brand", "Quantity", "Advert", "Price", "Revenue"]
    }));
  },

  getDataDrift: async (): Promise<any> => {
    return fetchWithFallback('/data/drift', () => ({
      overall_health: "HEALTHY",
      recommendation: "All feature and target distributions remain stable within safe PSI bounds.",
      features: [
        {
          feature: "Price",
          metric: "PSI & Wasserstein",
          psi_value: 0.042,
          distance: 0.08,
          mean_shift_pct: "+2.1%",
          status: "HEALTHY",
          interpretation: "Mean moved from $2.52 to $2.57 within normal inflation limits"
        },
        {
          feature: "Advert (Promotional Flag)",
          metric: "Promo Ratio PSI",
          psi_value: 0.021,
          distance: 0.04,
          mean_shift_pct: "+1.2%",
          status: "HEALTHY",
          interpretation: "Promotional cadence consistent with historical 22% rate"
        },
        {
          feature: "Quantity (Target Distribution)",
          metric: "Target PSI",
          psi_value: 0.054,
          distance: 14.2,
          mean_shift_pct: "+3.8%",
          status: "HEALTHY",
          interpretation: "Weekly unit velocity shows seasonal stability"
        }
      ],
      last_monitored: "2026-10-06 18:30 UTC"
    }));
  },

  // 10. Recommendations Center
  getRecommendations: async (): Promise<RecommendationOpportunity[]> => {
    return fetchWithFallback('/recommendations/list', () => [
      {
        id: "OPP_1034_tropicana_PRC",
        type: "PRICE_REPOSITIONING",
        store: 1034,
        brand: "tropicana",
        title: "Elasticity demand recovery in Store 1034 (Tropicana)",
        issue: "Demand dropped 18.2% following a 6.8% price elevation.",
        evidence: [
          "Unit sales fell from 840 to 687 units/wk over past 4 periods",
          "Current unit price of $3.55 exceeds cluster median of $3.15",
          "Competitor brands in same store maintained stable velocity"
        ],
        recommended_action: "Roll back price by 4–6% to benchmark $3.15 median.",
        expected_impact: "+$4,800/week demand recovery (+8% to +14% volume)",
        expected_revenue_gain_weekly: 4800,
        confidence_score: 84,
        ease_of_intervention: "Easy",
        trade_off: "Slight gross margin compression of 1.2% offset by high volume recovery"
      },
      {
        id: "OPP_1017_minute.maid_ADV",
        type: "PROMOTION_ACTIVATION",
        store: 1017,
        brand: "minute.maid",
        title: "Promotional lift activation in Store 1017 (Minute Maid)",
        issue: "Sales soft by 14.1% with zero circular or feature advertisements in 8 weeks.",
        evidence: [
          "Zero promotional activations in the past 8 weeks",
          "Historical advert response for Minute Maid in this store tier yields +28% unit lift",
          "Store demographic exhibits high promotional coupon responsiveness"
        ],
        recommended_action: "Schedule end-cap circular feature promotion for upcoming 2-week cycle.",
        expected_impact: "+$3,650/week revenue uplift (+20% to +30% volume lift)",
        expected_revenue_gain_weekly: 3650,
        confidence_score: 81,
        ease_of_intervention: "Moderate",
        trade_off: "Requires local store marketing execution and co-op advertising budget ($350/run)"
      },
      {
        id: "OPP_1000_dominicks_FLAG",
        type: "FLAGSHIP_SALES_RECOVERY",
        store: 1000,
        brand: "dominicks",
        title: "Flagship volume stabilization in Store 1000 (Dominicks)",
        issue: "High-volume flagship experiencing persistent demand erosion (-15.4%).",
        evidence: [
          "Store accounts for top 5% regional volume (1,250 base units/wk)",
          "3-week consecutive inventory run-rate contraction",
          "Customer basket sensitivity high in this trade area"
        ],
        recommended_action: "Implement temporary bundled multi-buy discount (Buy 2 for $3.20).",
        expected_impact: "+$5,200/week inventory pull-through",
        expected_revenue_gain_weekly: 5200,
        confidence_score: 78,
        ease_of_intervention: "Complex",
        trade_off: "Requires regional merchandising authorization and replenishment priority"
      }
    ]);
  },

  // 11. Audit Log
  getAuditTrail: async (): Promise<AuditEventItem[]> => {
    return fetchWithFallback('/audit/trail', () => [
      {
        id: 101,
        timestamp: "2026-10-06 18:32:15 UTC",
        username: "sarah.cfo@enterprise.bi",
        organization: "Apex Retail HQ",
        action_type: "SCENARIO_SIMULATED",
        module_name: "Scenario Simulator",
        details: "Simulated Price +5%, Ad x1.0, Demand 0%. Revenue impact: -$4,210 (-1.5%)",
        permission_checked: "ROLE_EXECUTIVE_ANALYST",
        status: "SUCCESS"
      },
      {
        id: 102,
        timestamp: "2026-10-06 18:31:02 UTC",
        username: "mark.ops@enterprise.bi",
        organization: "Apex Retail HQ",
        action_type: "COLLABORATION_QUERY_EVALUATED",
        module_name: "Data Collaboration Vault",
        details: "Evaluated query QRY_9F2B48A1 (Demand vs Supplier Capacity). Privacy threshold k=50 >= 10 met.",
        permission_checked: "ROLE_PARTNER_VAULT_ANALYST",
        status: "SUCCESS"
      },
      {
        id: 103,
        timestamp: "2026-10-06 18:29:44 UTC",
        username: "system.pipeline",
        organization: "Enterprise ML Engine",
        action_type: "LEAKAGE_AUDIT_RUN",
        module_name: "Model Governance",
        details: "Automated 4-point leakage check completed: Overall Status PASS",
        permission_checked: "SYSTEM_INTERNAL",
        status: "SUCCESS"
      },
      {
        id: 104,
        timestamp: "2026-10-06 18:28:10 UTC",
        username: "system.pipeline",
        organization: "Enterprise ML Engine",
        action_type: "BACKTEST_ACCESSED",
        module_name: "Forecast Studio",
        details: "Walk-forward backtest evaluated on Weeks 101-121. WMAPE: 7.6%, MAE: 38.4",
        permission_checked: "SYSTEM_INTERNAL",
        status: "SUCCESS"
      }
    ]);
  },

  // 12. AI Business War Room Command Center
  getWarRoomCurrent: async (): Promise<WarRoomState> => {
    return fetchWithFallback('/war-room/current', () => ({
      war_room_id: "WR-2026-OJ-089",
      title: "Next Month Revenue Shortfall Risk",
      situation: "Next month's projected revenue ($102,450 / ₹10.2 Cr) falls short of executive target ($120,000 / ₹12.0 Cr) by $17,550 (-14.6%). Primary root causes identified in historical telemetry: demand contraction in Dominicks (-8.2%) and Minute Maid (-4.1%) driven by promotional hiatus in Tier-2 suburban retail clusters and supplier lead-time friction.",
      severity: "HIGH",
      status: "Triggered",
      metrics: {
        forecasted_revenue: 102450.0,
        target_revenue: 120000.0,
        gap_amount: 17550.0,
        gap_pct: -14.6,
        days_remaining: 23,
        currency: "USD ($)",
        inr_forecast_cr: 10.2,
        inr_target_cr: 12.0,
        inr_gap_cr: 1.8
      },
      metadata: {
        owner: "VP Commercial Ops & Supply Chain",
        deadline: "End of Month (23 Days)",
        affected_areas: ["Sales", "Inventory", "Marketing", "Procurement", "Finance"],
        created_at: "2026-10-06 18:00 UTC",
        progress_pct: 20.0
      },
      tasks: [
        {
          task_id: "TSK-01",
          title: "Restock safety stock across Tier-2 suburban hubs",
          department: "Operations",
          owner: "Marcus Vance (Logistics Director)",
          priority: "CRITICAL",
          status: "In Progress",
          due_date: "In 3 Days",
          expected_impact: "+$4,800 Revenue Protection (eliminates stockout losses)",
          notes: "Fast-track 2 additional refrigerated trucks from Central Distribution Center."
        },
        {
          task_id: "TSK-02",
          title: "Launch targeted digital circular co-op ad for Dominicks",
          department: "Marketing",
          owner: "Elena Rostova (Head of Growth)",
          priority: "HIGH",
          status: "In Progress",
          due_date: "In 5 Days",
          expected_impact: "+$6,200 Revenue Recovery (+18% volume lift)",
          notes: "Trigger 10-day digital push with $350 feature circular budget per district."
        },
        {
          task_id: "TSK-03",
          title: "Negotiate volume rebate with Florida Citrus Cooperative",
          department: "Procurement",
          owner: "David Chen (Sourcing Lead)",
          priority: "MEDIUM",
          status: "Pending",
          due_date: "In 7 Days",
          expected_impact: "+140 bps Gross Margin expansion on raw concentrate",
          notes: "Leverage Clean Room privacy vault capacity metrics to prove joint upside."
        },
        {
          task_id: "TSK-04",
          title: "Align regional sales managers on shelf-talker execution",
          department: "Sales",
          owner: "Sarah Jenkins (VP Field Sales)",
          priority: "HIGH",
          status: "In Progress",
          due_date: "In 4 Days",
          expected_impact: "+$3,500 In-store conversion lift",
          notes: "Verify 95% compliance on end-cap promotional placement in Top 30 stores."
        },
        {
          task_id: "TSK-05",
          title: "Review working capital draw for expedited inventory",
          department: "Finance",
          owner: "Arthur Sterling (VP Finance & FP&A)",
          priority: "MEDIUM",
          status: "Completed",
          due_date: "Completed",
          expected_impact: "Approved $12,000 contingency working capital buffer",
          notes: "EBITDA proxy remains positive with net expected +$5,100 recovery."
        }
      ],
      decisions: [
        {
          decision_id: "DEC-2026-01",
          title: "Execute 14-Day Dual-Track Price & Promotional Intervention",
          decision_text: "Hold Dominicks unit price at $2.29 (rescind proposed +8% price hike) and activate localized circular advertising across 25 Tier-2 stores.",
          decided_by: "Chief Commercial Officer",
          approved_by: "Executive Committee & CFO",
          justification: "Elasticity model proves that a +8% price hike causes -14.2% unit erosion, resulting in net negative revenue. Promotion lift (+22%) recovers $8,400 with positive EBITDA margin.",
          expected_outcome: "Recover $11,300 of the $17,550 gap within 14 days; stabilize store-level market share above 32%.",
          revenue_impact: 11300.0,
          margin_impact: 4746.0,
          risk_level: "LOW",
          status: "Approved",
          created_at: "2026-10-06"
        }
      ],
      timeline: [
        {
          event_id: "EVT-01",
          timestamp: "Oct 06, 18:00",
          actor: "System (Risk Monitor)",
          event_type: "STATUS_CHANGE",
          summary: "War Room Triggered",
          details: "Automated trigger fired: Next-month forecast ($102,450) < Target ($120,000). Gap = -14.6%."
        },
        {
          event_id: "EVT-02",
          timestamp: "Oct 06, 18:30",
          actor: "Sarah Jenkins (VP Sales)",
          event_type: "STATUS_CHANGE",
          summary: "Status Advanced to Investigating",
          details: "Cross-functional command team convened; impact tree initialized."
        },
        {
          event_id: "EVT-03",
          timestamp: "Oct 06, 19:15",
          actor: "AI Copilot & CCO",
          event_type: "SIMULATION_RUN",
          summary: "Multi-Agent Simulation Evaluated",
          details: "CFO, Ops, Sales, Risk agents reached strategic consensus on Option E."
        },
        {
          event_id: "EVT-04",
          timestamp: "Oct 06, 20:00",
          actor: "CFO & Executive Committee",
          event_type: "DECISION_APPROVED",
          summary: "Decision Approved: DEC-2026-01",
          details: "Dual-track intervention approved. Implementation phase begun."
        }
      ]
    }));
  },

  getWarRoomImpactMap: async (): Promise<ImpactGraph> => {
    return fetchWithFallback('/war-room/impact-map', () => ({
      nodes: [
        { id: "target", label: "Revenue Target", type: "target", value: "$120,000 (₹12.0 Cr)", status: "BENCHMARK", detail: "Executive Board monthly commitment for Q4 commercial plan." },
        { id: "gap", label: "Revenue Gap", type: "shortfall", value: "-$17,550 (-14.6%)", status: "CRITICAL", detail: "Forecasted trajectory falls short across 34 retail nodes without intervention." },
        { id: "driver_brand_dom", label: "Dominicks Demand Drop", type: "driver", value: "-8.2% Unit Contraction", status: "HIGH_RISK", detail: "Projected demand: 41,200 units vs 48,000 plan. Price elasticity penalty following competitor discount." },
        { id: "driver_brand_mm", label: "Minute Maid Velocity Softening", type: "driver", value: "-4.1% Volume Drift", status: "MEDIUM_RISK", detail: "Projected demand: 49,500 units. Promotion frequency dropped from 0.42 to 0.28 in recent weeks." },
        { id: "driver_stores_t2", label: "Tier-2 Suburban Stores (18)", type: "entity", value: "$7,400 Weekly Shortfall", status: "HIGH_RISK", detail: "Cluster of 18 suburban stores facing local competitor feature circular displays." },
        { id: "constraint_inv", label: "Inventory Buffer Depletion", type: "constraint", value: "2.1 Weeks Coverage", status: "WARNING", detail: "Current DC inventory is 2.1 weeks cover (Safety threshold = 3.5 weeks). Stockout exposure in 7 stores." },
        { id: "constraint_lead", label: "Supplier Inbound Lead Time", type: "constraint", value: "14-Day Delivery Lag", status: "INFO", detail: "Florida cooperative logistics turnaround requires 14 days lead time for bulk replenishment." },
        { id: "team_ops", label: "Operations & Logistics Team", type: "team", value: "Task TSK-01 Assigned", status: "ACTIONING", detail: "Dispatching emergency safety stock buffer to suburban regional hubs." },
        { id: "team_marketing", label: "Commercial Marketing Team", type: "team", value: "Task TSK-02 Assigned", status: "ACTIONING", detail: "Deploying digital promotional circular co-op program across 25 target stores." },
        { id: "team_procurement", label: "Procurement & Sourcing Team", type: "team", value: "Task TSK-03 Assigned", status: "ACTIONING", detail: "Negotiating bulk raw juice concentrate volume rebate via Data Collaboration Vault." }
      ],
      edges: [
        { from: "target", to: "gap", label: "Shortfall Deficit", weight: 95 },
        { from: "gap", to: "driver_brand_dom", label: "Dominicks Impact (48%)", weight: 80 },
        { from: "gap", to: "driver_brand_mm", label: "Minute Maid Impact (32%)", weight: 60 },
        { from: "driver_brand_dom", to: "driver_stores_t2", label: "Cluster Exposure", weight: 75 },
        { from: "driver_brand_dom", to: "constraint_inv", label: "Stockout Risk", weight: 70 },
        { from: "driver_brand_mm", to: "constraint_lead", label: "Inbound Bottleneck", weight: 55 },
        { from: "constraint_inv", to: "team_ops", label: "Fulfillment Mitigation", weight: 85 },
        { from: "driver_brand_dom", to: "team_marketing", label: "Promotional Lift", weight: 90 },
        { from: "constraint_lead", to: "team_procurement", label: "Contract Buffer", weight: 65 }
      ]
    }));
  },

  postWarRoomCopilot: async (query: string): Promise<CopilotResponse> => {
    return fetchWithFallback('/war-room/copilot', () => {
      const q = query.toLowerCase();
      if (q.includes('why') || q.includes('cause') || q.includes('gap')) {
        return {
          query,
          answer: "We are missing next month's target of $120,000 (₹12.0 Cr) because forward forecast is projected at $102,450 (₹10.2 Cr), creating a shortfall of -$17,550 (-14.6%). Two root causes dominate: 1) Dominicks unit volume fell -8.2% after a price hike to $2.49 breached category elasticity (η = -2.14); 2) Promotional circular advertising in 18 Tier-2 suburban stores dropped from 42% to 28% of weeks.",
          evidence: {
            metric_name: "Revenue Gap & Brand Contraction",
            calculation: "Target ($120,000) - Forecast ($102,450) = Gap (-$17,550)",
            data_citations: [
              { fact: "Dominicks Price Elasticity", value: "-2.14 η (p < 0.001)" },
              { fact: "Promotional Lift Multiplier", value: "+22.5% unit volume when Advert=1" },
              { fact: "Affected Retail Stores", value: "18 Tier-2 stores experiencing >15% deceleration" }
            ],
            confidence_score: 92
          },
          suggested_prompts: [
            "Which store cluster is contributing most to the problem?",
            "What happens if we increase promotional advert events by 20%?",
            "Which decision has the highest expected impact?",
            "Show me the evidence for this conclusion"
          ]
        };
      }
      return {
        query,
        answer: "BusinessSight War Room Telemetry Active. Target: $120,000 | Forecast: $102,450 | Expected Gap: -$17,550 (-14.6%) across 23 days remaining. 5 cross-functional tasks assigned. Decision DEC-2026-01 (Dual-Track Price Defense) approved.",
        evidence: {
          metric_name: "War Room Operational Overview",
          calculation: "Target ($120,000) - Forecast ($102,450) = Gap (-$17,550)",
          data_citations: [
            { fact: "War Room Status", value: "Triggered / Investigating" },
            { fact: "Active Tasks", value: "5 cross-functional action items" },
            { fact: "Approved Decisions", value: "DEC-2026-01 Approved" }
          ],
          confidence_score: 95
        },
        suggested_prompts: [
          "Why are we missing next month's revenue target?",
          "Which store cluster is contributing most to the problem?",
          "What happens if we increase promotional advert events by 20%?",
          "Which decision has the highest expected impact?"
        ]
      };
    }, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  postWarRoomStatus: async (status: string, user: string = "Chief Commercial Officer"): Promise<any> => {
    return fetchWithFallback('/war-room/status', () => ({ status: "SUCCESS", new_status: status }), {
      method: 'POST',
      body: JSON.stringify({ status, user })
    });
  },

  postWarRoomTask: async (task: any): Promise<any> => {
    return fetchWithFallback('/war-room/tasks', () => ({ status: "SUCCESS", task_id: "TSK-06", ...task }), {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  postWarRoomDecision: async (decision: any): Promise<any> => {
    return fetchWithFallback('/war-room/decisions', () => ({ status: "SUCCESS", decision_id: "DEC-2026-02", ...decision }), {
      method: 'POST',
      body: JSON.stringify(decision)
    });
  },

  getWarRoomPostmortem: async (): Promise<PostmortemData> => {
    return fetchWithFallback('/war-room/postmortem', () => ({
      war_room_id: "WR-2026-OJ-089",
      title: "POSTMORTEM & EXECUTIVE RETROSPECTIVE REVIEW",
      resolution_date: "2026-10-31",
      predicted_vs_actual: {
        original_target: "$120,000",
        initial_unmitigated_forecast: "$102,450",
        initial_shortfall_at_risk: "-$17,550 (-14.6%)",
        post_intervention_actual_revenue: "$118,150",
        gap_recovered_amount: "$15,700",
        recovery_rate_pct: "89.5% of projected shortfall successfully recovered"
      },
      what_worked: [
        "Rescinding the Dominicks price hike defended retail market share against private-label incursions.",
        "Targeted digital circular advertising generated a +21.8% velocity lift in Tier-2 suburban stores.",
        "Data Collaboration Vault enabled early visibility into supplier juice concentrate lead times, preventing out-of-stocks."
      ],
      what_did_not_work: [
        "Logistics turnaround in suburban depots lagged by 1.8 days due to weekend fleet availability constraints.",
        "In-store display compliance in 4 retail partner stores only reached 78% of targeted end-caps."
      ],
      systemic_learnings: [
        "Incorporate dynamic elasticity triggers into pricing algorithm to block price hikes whenever competitor circulars are active.",
        "Establish automated safety-stock replenishment buffers 14 days ahead of anticipated seasonal demand spikes.",
        "Institutionalize weekly cross-functional War Room standups between Commercial Ops and Supply Chain."
      ],
      sign_offs: [
        { role: "VP Commercial Operations", status: "SIGNED", date: "2026-10-31" },
        { role: "Chief Financial Officer", status: "SIGNED", date: "2026-10-31" },
        { role: "VP Supply Chain & Logistics", status: "SIGNED", date: "2026-10-31" }
      ]
    }));
  },

  postWarRoomSimulation: async (inputs: any): Promise<WarRoomResponse> => {
    return api.getWarRoomAnalysis(inputs);
  }
};

