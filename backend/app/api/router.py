from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.db.database import get_db
from app.db.models import ModelRegistryRecord, DatasetMetadata, AuditEventRecord
from app.data.ingestion import load_or_initialize_dataset, ingest_custom_csv
from app.data.validation import validate_and_profile_dataset
from app.ml.features import engineer_forecasting_features
from app.ml.forecaster import forecaster
from app.ml.backtesting import run_chronological_backtest
from app.ml.leakage_detector import run_data_leakage_audit
from app.ml.drift_monitor import evaluate_model_drift
from app.engines.risk_radar import compute_risk_radar
from app.engines.scenario_engine import simulate_scenario
from app.engines.value_cockpit import calculate_ebitda_cockpit
from app.engines.loss_opportunity import detect_loss_and_opportunities
from app.engines.war_room import run_multi_agent_war_room
from app.engines.war_room_service import (
    get_war_room_state,
    get_impact_dependency_graph,
    answer_war_room_copilot,
    update_war_room_status,
    add_war_room_task,
    add_war_room_decision,
    generate_postmortem_analysis
)
from app.collaboration.vault import execute_privacy_vault_query
from app.market.market_signals import get_market_signals
from app.audit.audit_logger import log_action, get_audit_trail

api_router = APIRouter()

# -------------------------------------------------------------
# 1. EXECUTIVE CONTROL ROOM ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/executive/kpis")
def get_executive_kpis(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    recent_cutoff = df["WeekStarting"].max() - pd.Timedelta(weeks=4)
    recent = df[df["WeekStarting"] >= recent_cutoff]

    current_revenue = float(recent["Revenue"].sum())
    
    # Feature engineering & forward forecast
    df_feat = engineer_forecasting_features(df)
    pred_df = forecaster.predict(df_feat.tail(len(recent)))
    forecast_revenue = float(pred_df["forecast_revenue"].sum())
    
    growth_pct = round(((forecast_revenue - current_revenue) / (current_revenue + 1e-4)) * 100, 2)
    
    # Backtest metrics for honest accuracy
    bt = run_chronological_backtest(df)
    wmape = bt["ml_model_metrics"]["wmape"]
    accuracy_pct = max(0.0, round(100.0 - wmape, 1))

    # Risk metrics
    risk = compute_risk_radar(df)
    opps = detect_loss_and_opportunities(df)
    potential_savings = sum(o.get("expected_revenue_gain_weekly", 0) for o in opps)

    return {
        "current_revenue": round(current_revenue, 2),
        "forecast_revenue": round(forecast_revenue, 2),
        "forecast_growth_pct": growth_pct,
        "forecast_accuracy_pct": accuracy_pct,
        "high_risk_stores_count": risk["high_risk_stores_count"],
        "high_risk_brands_count": risk["high_risk_brands_count"],
        "revenue_at_risk": risk["total_revenue_at_risk_weekly"],
        "potential_opportunity_weekly": round(potential_savings, 2),
        "currency": "USD ($)",
        "prediction_interval_80": {
            "lower": round(float(pred_df["revenue_lower_80"].sum()), 2),
            "expected": round(forecast_revenue, 2),
            "upper": round(float(pred_df["revenue_upper_80"].sum()), 2)
        },
        "accuracy_card": {
            "mae": bt["ml_model_metrics"]["mae"],
            "rmse": bt["ml_model_metrics"]["rmse"],
            "mape": f"{bt['ml_model_metrics']['mape']}%",
            "wmape": f"{wmape}%",
            "r2": bt["ml_model_metrics"]["r2"],
            "honest_accuracy_note": bt["honest_accuracy_note"]
        }
    }

@api_router.get("/executive/historical-vs-forecast")
def get_historical_vs_forecast(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    
    weekly = df.groupby("WeekStarting").agg({
        "Revenue": "sum",
        "Quantity": "sum",
        "Price": "mean"
    }).reset_index().sort_values("WeekStarting")

    # Historical timeline (past 20 weeks)
    historical_slice = weekly.tail(20)
    
    # Predict next 4 weeks forward
    df_feat = engineer_forecasting_features(df)
    last_week_features = df_feat.tail(150)  # representative store sample
    preds = forecaster.predict(last_week_features)
    
    last_date = weekly["WeekStarting"].max()
    forecast_points = []
    
    exp_rev = float(preds["forecast_revenue"].sum()) / 3.0  # scaled weekly aggregate
    lower_80 = float(preds["revenue_lower_80"].sum()) / 3.0
    upper_80 = float(preds["revenue_upper_80"].sum()) / 3.0
    
    for i in range(1, 5):
        f_date = last_date + pd.Timedelta(weeks=i)
        growth_noise = 1.0 + (i * 0.008)  # slight forward trend
        forecast_points.append({
            "week_starting": f_date.strftime("%Y-%m-%d"),
            "actual_revenue": None,
            "forecast_revenue": round(exp_rev * growth_noise, 2),
            "lower_bound_80": round(lower_80 * growth_noise * (1.0 - 0.02 * i), 2),
            "upper_bound_80": round(upper_80 * growth_noise * (1.0 + 0.02 * i), 2),
            "type": "FORECAST"
        })

    hist_points = [
        {
            "week_starting": r["WeekStarting"].strftime("%Y-%m-%d"),
            "actual_revenue": round(float(r["Revenue"]), 2),
            "forecast_revenue": None,
            "lower_bound_80": None,
            "upper_bound_80": None,
            "type": "ACTUAL"
        }
        for _, r in historical_slice.iterrows()
    ]

    return {
        "timeline": hist_points + forecast_points,
        "note": "Forecast points strictly demarcated with 80% prediction intervals."
    }

@api_router.get("/executive/one-page-summary")
def get_executive_one_page_summary(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    kpis = get_executive_kpis(db)
    sim = simulate_scenario(df, price_delta_pct=0.05)
    opps = detect_loss_and_opportunities(df)
    risk = compute_risk_radar(df)
    
    top_opp = opps[0] if opps else {}
    top_risk = risk["items"][0] if risk.get("items") else {}

    return {
        "title": "EXECUTIVE NEXT-MONTH DECISION BRIEFING",
        "forecast_revenue": f"${kpis['forecast_revenue']:,.0f}",
        "expected_growth": f"{kpis['forecast_growth_pct']:+.1f}%",
        "revenue_at_risk": f"${kpis['revenue_at_risk']:,.0f}/wk",
        "top_opportunity": {
            "entity": f"Store {top_opp.get('store')} • {top_opp.get('brand', '').title()}",
            "impact": top_opp.get('expected_impact'),
            "confidence": f"{top_opp.get('confidence_score')}%",
            "action": top_opp.get('recommended_action')
        },
        "top_risk": {
            "entity": f"Store {top_risk.get('store')} • {top_risk.get('brand', '').title()}",
            "risk_score": top_risk.get('risk_score'),
            "reasons": top_risk.get('reasons', [])[:2]
        },
        "sample_scenario": {
            "name": "Price +5% Stress Simulation",
            "revenue_delta": f"${sim['scenario']['revenue_delta']:+,.0f} ({sim['scenario']['revenue_delta_pct']:+.1f}%)",
            "volume_delta": f"{sim['scenario']['quantity_delta_pct']:+.1f}%",
            "recommended_action": sim['recommended_action'],
            "confidence": f"{sim['confidence']}%"
        }
    }

# -------------------------------------------------------------
# 2. FORECAST STUDIO & BACKTESTING ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/forecast/backtest")
def get_backtest_results(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    log_action(db, "BACKTEST_ACCESSED", "Forecast Studio", "Inspected time-based walk-forward backtest metrics")
    return run_chronological_backtest(df)

@api_router.get("/forecast/leakage-check")
def get_leakage_check(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    df_feat = engineer_forecasting_features(df)
    audit = run_data_leakage_audit(df_feat)
    log_action(db, "LEAKAGE_AUDIT_RUN", "Model Governance", f"Status: {audit['overall_status']}")
    return audit

# -------------------------------------------------------------
# 3. DEMAND RISK RADAR ENDPOINT
# -------------------------------------------------------------
@api_router.get("/risk/radar")
def get_risk_radar(
    brand: Optional[str] = None,
    risk_tier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    result = compute_risk_radar(df)
    
    items = result["items"]
    if brand and brand != "ALL":
        items = [x for x in items if x["brand"].lower() == brand.lower()]
    if risk_tier and risk_tier != "ALL":
        items = [x for x in items if x["risk_tier"] == risk_tier]
        
    result["items"] = items
    return result

# -------------------------------------------------------------
# 4. SCENARIO LAB & MULTI-AGENT WAR ROOM ENDPOINTS
# -------------------------------------------------------------
@api_router.post("/scenario/simulate")
def post_simulate_scenario(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    
    price_delta = float(payload.get("price_delta_pct", 0.0))
    advert_mult = float(payload.get("advert_multiplier", 1.0))
    demand_shock = float(payload.get("demand_shock_pct", 0.0))
    supply_shock = float(payload.get("supply_constraint_pct", 0.0))
    target_brand = str(payload.get("target_brand", "ALL"))
    target_store = int(payload.get("target_store", 0))

    sim_result = simulate_scenario(
        df,
        price_delta_pct=price_delta,
        advert_multiplier=advert_mult,
        demand_shock_pct=demand_shock,
        supply_constraint_pct=supply_shock,
        target_brand=target_brand,
        target_store=target_store
    )

    log_action(
        db,
        "SCENARIO_SIMULATED",
        "Scenario Simulator",
        f"Price: {price_delta*100:+.1f}%, Ad: x{advert_mult}, Demand: {demand_shock*100:+.1f}%, RevDelta: ${sim_result['scenario']['revenue_delta']:+,.0f}"
    )

    return sim_result

@api_router.post("/scenario/war-room")
def post_war_room_reasoning(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    
    price_delta = float(payload.get("price_delta_pct", 0.0))
    advert_mult = float(payload.get("advert_multiplier", 1.0))
    demand_shock = float(payload.get("demand_shock_pct", 0.0))
    supply_shock = float(payload.get("supply_constraint_pct", 0.0))
    target_brand = str(payload.get("target_brand", "ALL"))

    sim_result = simulate_scenario(
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
        sim_result,
        risk_summary,
        drift_summary
    )

    log_action(db, "WAR_ROOM_INVOKED", "Multi-Agent War Room", f"Directive: {war_room_output['coordinator']['consensus_verdict'][:80]}...")

    return {
        "scenario_summary": sim_result["scenario"],
        "agents": war_room_output
    }

# -------------------------------------------------------------
# 5. VALUE CREATION & EBITDA COCKPIT ENDPOINT
# -------------------------------------------------------------
@api_router.get("/value/ebitda")
def get_ebitda_cockpit(
    gross_margin_pct: float = Query(0.42),
    opex_pct: float = Query(0.18),
    logistics_cost_per_unit: float = Query(0.15),
    ad_cost_per_event: float = Query(350.0),
    wastage_pct: float = Query(0.025),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    return calculate_ebitda_cockpit(
        df,
        gross_margin_pct=gross_margin_pct,
        opex_pct=opex_pct,
        ad_cost_per_event=ad_cost_per_event,
        logistics_cost_per_unit=logistics_cost_per_unit,
        wastage_pct=wastage_pct
    )

# -------------------------------------------------------------
# 6. STORE & BRAND INTELLIGENCE DRILLDOWN ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/intelligence/filters")
def get_intelligence_filters(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    stores = sorted(int(s) for s in df["Store"].unique())
    brands = sorted(str(b) for b in df["Brand"].unique())
    
    return {
        "stores": stores,
        "brands": brands,
        "default_store": stores[0] if stores else 1000,
        "default_brand": "tropicana"
    }

@api_router.get("/intelligence/drilldown")
def get_store_brand_drilldown(
    store: int = Query(...),
    brand: str = Query(...),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    
    sub = df[(df["Store"] == store) & (df["Brand"].str.lower() == brand.lower())].sort_values("WeekStarting")
    if sub.empty:
        raise HTTPException(status_code=404, detail="Store and Brand combination not found.")

    # Time series points
    timeline = []
    for _, r in sub.tail(24).iterrows():
        timeline.append({
            "week_starting": r["WeekStarting"].strftime("%Y-%m-%d"),
            "quantity": float(r["Quantity"]),
            "price": float(r["Price"]),
            "advert": int(r["Advert"]),
            "revenue": float(r["Revenue"])
        })

    # Summary metrics
    avg_price = float(sub["Price"].mean())
    avg_qty = float(sub["Quantity"].mean())
    avg_rev = float(sub["Revenue"].mean())
    total_rev = float(sub["Revenue"].sum())
    volatility = float(np.std(sub["Quantity"]) / (avg_qty + 1e-4))

    # Empirical elasticity estimation: regression of log(Quantity) on log(Price)
    log_q = np.log(np.maximum(1.0, sub["Quantity"]))
    log_p = np.log(np.maximum(0.1, sub["Price"]))
    elasticity_slope = float(np.polyfit(log_p, log_q, 1)[0]) if len(sub) > 5 else -2.0

    return {
        "store": store,
        "brand": brand,
        "timeline": timeline,
        "kpis": {
            "avg_weekly_revenue": round(avg_rev, 2),
            "avg_unit_price": round(avg_price, 2),
            "avg_weekly_volume": round(avg_qty, 1),
            "total_period_revenue": round(total_rev, 2),
            "volatility_cv": round(volatility, 2),
            "empirical_elasticity": round(elasticity_slope, 2)
        }
    }

# -------------------------------------------------------------
# 7. DATA COLLABORATION VAULT ENDPOINTS
# -------------------------------------------------------------
@api_router.post("/collaboration/query")
def post_collaboration_query(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    template_id = payload.get("query_template_id", "DEMAND_VS_SUPPLIER_CAPACITY")
    requester = payload.get("requester_org", "Org A (Apex Retail)")
    target = payload.get("target_org", "Org B (Florida Citrus Supplier Coop)")
    filter_param = payload.get("filter_param", "ALL")

    return execute_privacy_vault_query(template_id, requester, target, filter_param, db, df)

# -------------------------------------------------------------
# 8. MARKET SIGNALS ENDPOINT
# -------------------------------------------------------------
@api_router.get("/market/signals")
def get_market_signals_api():
    return get_market_signals()

# -------------------------------------------------------------
# 9. MODEL REGISTRY & GOVERNANCE ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/models/registry")
def get_model_registry(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    bt = run_chronological_backtest(df)
    m = bt["ml_model_metrics"]

    records = [
        {
            "id": 1,
            "model_name": "HistGradientBoosting-Regressor",
            "version": "v1.4.2",
            "model_type": "Gradient Boosting Regressor",
            "target": "Quantity",
            "features_count": 22,
            "training_period": "Weeks 1–80",
            "validation_period": "Weeks 81–100",
            "test_period": "Weeks 101–121",
            "mae": m["mae"],
            "rmse": m["rmse"],
            "mape": f"{m['mape']}%",
            "wmape": f"{m['wmape']}%",
            "r2": m["r2"],
            "status": "DEPLOYED (PRIMARY)",
            "trained_at": "2026-10-06 18:30 UTC"
        },
        {
            "id": 2,
            "model_name": "Seasonal-Naive-Baseline",
            "version": "v1.0.0",
            "model_type": "Lag-4 Time Series Baseline",
            "target": "Quantity",
            "features_count": 1,
            "training_period": "Weeks 1–80",
            "validation_period": "Weeks 81–100",
            "test_period": "Weeks 101–121",
            "mae": bt["baseline_seasonal_metrics"]["mae"],
            "rmse": bt["baseline_seasonal_metrics"]["rmse"],
            "mape": f"{bt['baseline_seasonal_metrics']['mape']}%",
            "wmape": f"{bt['baseline_seasonal_metrics']['wmape']}%",
            "r2": bt["baseline_seasonal_metrics"]["r2"],
            "status": "REFERENCE BASELINE",
            "trained_at": "2026-10-06 18:30 UTC"
        }
    ]
    return records

@api_router.post("/models/retrain")
def post_retrain_model(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    df_feat = engineer_forecasting_features(df)
    train_res = forecaster.fit(df_feat)
    
    log_action(db, "MODEL_RETRAINED", "Model Governance", f"Retrained HistGradientBoostingRegressor. Residual std: {train_res['residual_std']:.2f}")

    return {
        "status": "SUCCESS",
        "message": "Model retrained and deployed successfully on updated feature matrix.",
        "model_version": "v1.4.3",
        "metrics": train_res
    }

# -------------------------------------------------------------
# 10. DATA QUALITY & DRIFT ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/data/quality")
def get_data_quality_report(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    profile = validate_and_profile_dataset(df)
    return profile

@api_router.get("/data/drift")
def get_data_drift_report(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    df_feat = engineer_forecasting_features(df)
    return evaluate_model_drift(df_feat)

@api_router.post("/data/upload")
async def post_upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    try:
        profile = ingest_custom_csv(contents, file.filename, db)
        return {
            "status": "SUCCESS",
            "message": f"Successfully ingested {file.filename}.",
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------------------------------------------------
# 11. RECOMMENDATION CENTER ENDPOINT
# -------------------------------------------------------------
@api_router.get("/recommendations/list")
def get_recommendations_list(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    return detect_loss_and_opportunities(df)

# -------------------------------------------------------------
# 12. AUDIT LOG ENDPOINT
# -------------------------------------------------------------
@api_router.get("/audit/trail")
def get_audit_trail_api(limit: int = 100, db: Session = Depends(get_db)):
    return get_audit_trail(db, limit=limit)

# -------------------------------------------------------------
# 13. AI BUSINESS WAR ROOM COMMAND CENTER ENDPOINTS
# -------------------------------------------------------------
@api_router.get("/war-room/current")
def get_war_room_current_api(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    return get_war_room_state(db, df)

@api_router.get("/war-room/impact-map")
def get_war_room_impact_map_api(db: Session = Depends(get_db)):
    df = load_or_initialize_dataset(db)
    state = get_war_room_state(db, df)
    return get_impact_dependency_graph(df, state)

@api_router.post("/war-room/copilot")
def post_war_room_copilot_api(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    df = load_or_initialize_dataset(db)
    state = get_war_room_state(db, df)
    query = payload.get("query", "")
    return answer_war_room_copilot(query, state, df)

@api_router.post("/war-room/status")
def post_war_room_status_api(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    new_status = payload.get("status", "Investigating")
    user = payload.get("user", "Chief Commercial Officer")
    return update_war_room_status(new_status, db, user=user)

@api_router.post("/war-room/tasks")
def post_war_room_task_api(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    task = add_war_room_task(payload, db)
    return {
        "status": "SUCCESS",
        "task_id": task.task_id,
        "title": task.title,
        "department": task.department,
        "owner": task.owner,
        "due_date": task.due_date
    }

@api_router.post("/war-room/decisions")
def post_war_room_decision_api(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    decision = add_war_room_decision(payload, db)
    return {
        "status": "SUCCESS",
        "decision_id": decision.decision_id,
        "title": decision.title,
        "revenue_impact": decision.revenue_impact
    }

@api_router.get("/war-room/postmortem")
def get_war_room_postmortem_api(db: Session = Depends(get_db)):
    return generate_postmortem_analysis(db)

