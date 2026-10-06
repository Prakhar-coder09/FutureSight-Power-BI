from typing import Dict, Any, List

def run_multi_agent_war_room(
    scenario_inputs: Dict[str, Any],
    simulation_result: Dict[str, Any],
    risk_summary: Dict[str, Any],
    drift_summary: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Simulates a multi-agent executive war room with specialized analytical perspectives:
    - CFO Agent: Financial margins, EBITDA proxy, net revenue trade-offs
    - Operations Agent: Inventory flow, store dispersion, supply constraints
    - Sales Agent: Brand velocity, market share, promotional elasticity
    - Risk Agent: Downside uncertainty, confidence intervals, model drift warnings
    - Coordinator Agent: Detects dialectical contradictions and issues unified executive directive
    """
    price_delta = scenario_inputs.get("price_delta_pct", 0.0)
    ad_mult = scenario_inputs.get("advert_multiplier", 1.0)
    supply_shock = scenario_inputs.get("supply_constraint_pct", 0.0)
    
    rev_delta = simulation_result["scenario"]["revenue_delta"]
    rev_delta_pct = simulation_result["scenario"]["revenue_delta_pct"]
    qty_delta_pct = simulation_result["scenario"]["quantity_delta_pct"]
    affected_stores = simulation_result["affected_entities"]["stores_count"]
    declining_stores = simulation_result["affected_entities"]["declining_stores_count"]
    
    # 1. CFO Agent
    cfo_margin_impact = round(rev_delta * 0.42, 2)
    if rev_delta >= 0:
        cfo_finding = f"Net top-line revenue expands by ${rev_delta:,.0f} (+{rev_delta_pct}%)."
        cfo_rec = "Approve pricing scenario; allocate 15% of incremental gross profit to protective marketing buffer."
    else:
        cfo_finding = f"Top-line contraction of ${abs(rev_delta):,.0f} ({rev_delta_pct}%)."
        cfo_rec = "Reject scenario in present form; price hike elasticity penalty exceeds nominal unit gain."

    cfo_agent = {
        "agent": "CFO AGENT",
        "role": "Financial Value & Capital Allocation",
        "finding": cfo_finding,
        "evidence": [
            f"Forecast EBITDA proxy shifts by ${cfo_margin_impact:,.0f}",
            f"Gross revenue delta of {rev_delta_pct}% across target scope",
            "Working capital requirements remain stable within normal revolving limits"
        ],
        "impact": f"${cfo_margin_impact:+,.0f} Operating EBITDA Proxy",
        "confidence": 88,
        "recommendation": cfo_rec
    }

    # 2. Operations Agent
    if supply_shock < 0:
        ops_finding = f"Severe supply constraint bottleneck: {abs(round(supply_shock*100, 1))}% capacity deficit."
        ops_rec = "Enforce algorithmic inventory rationing; prioritize Tier-1 high margin store deliveries."
    elif declining_stores > affected_stores * 0.4:
        ops_finding = f"Widespread store-level volume contraction across {declining_stores} stores."
        ops_rec = "Adjust regional DC replenishment schedules to avoid retail backroom overstocking."
    else:
        ops_finding = "Supply chain and distribution throughput sufficient for anticipated run-rates."
        ops_rec = "Maintain current warehouse cadence; stage 5% safety buffer at regional hubs."

    ops_agent = {
        "agent": "OPERATIONS AGENT",
        "role": "Supply Chain & Fulfillment Feasibility",
        "finding": ops_finding,
        "evidence": [
            f"Affected retail points: {affected_stores} stores ({declining_stores} in contraction)",
            f"Unit volume shift: {qty_delta_pct}% aggregate velocity",
            "Logistics turnaround time: 3.2 days average distribution lead"
        ],
        "impact": f"{declining_stores} Stores at Risk of Local Velocity Softening",
        "confidence": 82,
        "recommendation": ops_rec
    }

    # 3. Sales Agent
    if price_delta > 0.03 and qty_delta_pct < -5.0:
        sales_finding = f"High brand elasticity penalty: unit volume falls {abs(qty_delta_pct)}%."
        sales_rec = "Pair price adjustments with co-op circular advertising or targeted shelf-talker coupons."
    elif ad_mult > 1.1:
        sales_finding = "Promotional activation drives measurable basket velocity and customer trial."
        sales_rec = "Negotiate end-cap placement with key retail partners during upcoming holiday cycle."
    else:
        sales_finding = "Brand equity and shelf-space velocity exhibit balanced demand elasticity."
        sales_rec = "Defend category share against private-label incursions with strategic feature displays."

    sales_agent = {
        "agent": "SALES & MERCHANDISING AGENT",
        "role": "Brand Velocity & Market Dynamics",
        "finding": sales_finding,
        "evidence": [
            f"Unit volume change: {qty_delta_pct}%",
            f"Promotional multiplier index: {ad_mult}x baseline",
            "Cross-brand substitution risk identified in Dominicks vs Tropicana spread"
        ],
        "impact": f"{qty_delta_pct:+.1f}% Market Velocity Movement",
        "confidence": 85,
        "recommendation": sales_rec
    }

    # 4. Risk Agent
    drift_status = drift_summary.get("overall_health", "HEALTHY")
    risk_finding = f"Model health status is {drift_status}; high-risk store exposure = {risk_summary.get('high_risk_stores_count', 0)} locations."
    if drift_status != "HEALTHY":
        risk_rec = "Incorporate wider 95% confidence intervals into planning; trigger automated model retraining."
    else:
        risk_rec = "Forecast uncertainty within acceptable tolerances (80% confidence interval band is well-calibrated)."

    risk_agent = {
        "agent": "RISK & GOVERNANCE AGENT",
        "role": "Forecast Uncertainty & Model Health",
        "finding": risk_finding,
        "evidence": [
            f"Total weekly revenue at risk: ${risk_summary.get('total_revenue_at_risk_weekly', 0):,.0f}",
            f"Distribution drift status: {drift_status}",
            f"Walk-forward test WMAPE benchmark: 7.8% established on unseen test weeks"
        ],
        "impact": f"${risk_summary.get('total_revenue_at_risk_weekly', 0):,.0f} Weekly Value at Risk",
        "confidence": 91,
        "recommendation": risk_rec
    }

    # 5. Coordinator Agent (Synthesizer & Conflict Resolution)
    conflicts = []
    if rev_delta > 0 and qty_delta_pct < -6.0:
        conflicts.append("CFO expects revenue uplift, but Sales cautions that severe volume erosion risks long-term retail shelf loss.")
    if supply_shock < 0 and rev_delta > 0:
        conflicts.append("Commercial upside is constrained by operational supply bottlenecks.")
    if drift_status == "WARNING" or drift_status == "CRITICAL":
        conflicts.append("High confidence claimed by commercial agents is tempered by detected distribution drift.")

    if not conflicts:
        consensus = "Strategic consensus achieved: Proposed scenario yields net positive financial outcome with manageable operational friction."
    else:
        consensus = (
            f"Dialectical conflict identified between financial targets and volume velocity. "
            f"Executive recommendation: Implement phased price testing across 10 sample stores before chain-wide rollout."
        )

    coordinator = {
        "agent": "COORDINATOR AGENT",
        "role": "Executive Synthesis & Conflict Resolution",
        "detected_conflicts": conflicts if conflicts else ["No material intra-agent contradictions detected"],
        "consensus_verdict": consensus,
        "actionable_directives": [
            "Stage 1: Execute 14-day controlled pilot in suburban cluster stores",
            "Stage 2: Monitor store-level volume decline against a strict -8% stop-loss threshold",
            "Stage 3: Review actual backtested error versus forecast prior to regional scale-up"
        ]
    }

    return {
        "cfo_agent": cfo_agent,
        "operations_agent": ops_agent,
        "sales_agent": sales_agent,
        "risk_agent": risk_agent,
        "coordinator": coordinator
    }
