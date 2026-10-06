"""
Future-Sight AI — Scenario & Multi-Agent Simulator Service
"""
from typing import Dict, Any
from app.data.ingestion import load_or_initialize_dataset
from app.engines.scenario_engine import simulate_scenario
from app.engines.war_room import run_multi_agent_war_room
from app.engines.risk_radar import compute_risk_radar
from app.ml.features import engineer_forecasting_features
from app.ml.drift_monitor import evaluate_model_drift

def run_simulation(db, payload: Dict[str, Any]) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    price_delta = float(payload.get("price_delta_pct", 0.0))
    advert_mult = float(payload.get("advert_multiplier", 1.0))
    demand_shock = float(payload.get("demand_shock_pct", 0.0))
    supply_shock = float(payload.get("supply_constraint_pct", 0.0))
    target_brand = str(payload.get("target_brand", "ALL"))

    sim_res = simulate_scenario(
        df,
        price_delta_pct=price_delta,
        advert_multiplier=advert_mult,
        demand_shock_pct=demand_shock,
        supply_constraint_pct=supply_shock,
        target_brand=target_brand
    )

    risk_summary = compute_risk_radar(df)
    df_feat = engineer_forecasting_features(df)
    drift_summary = evaluate_model_drift(df_feat)

    war_room_output = run_multi_agent_war_room(
        payload,
        sim_res,
        risk_summary,
        drift_summary
    )

    return {
        "scenario_summary": sim_res["scenario"],
        "agents": war_room_output,
        "ripple_chain": sim_res.get("ripple_chain", [])
    }
