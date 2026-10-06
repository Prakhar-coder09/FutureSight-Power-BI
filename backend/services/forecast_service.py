"""
Future-Sight AI — Forecast Service
"""
import pandas as pd
from typing import Dict, Any
from app.data.ingestion import load_or_initialize_dataset
from app.ml.features import engineer_forecasting_features
from app.ml.forecaster import forecaster
from app.ml.backtesting import run_chronological_backtest
from app.ml.leakage_detector import run_data_leakage_audit

def get_forecast_kpis(db) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    recent_cutoff = df["WeekStarting"].max() - pd.Timedelta(weeks=4)
    recent = df[df["WeekStarting"] >= recent_cutoff]
    current_revenue = float(recent["Revenue"].sum())

    df_feat = engineer_forecasting_features(df)
    pred_df = forecaster.predict(df_feat.tail(len(recent)))
    forecast_revenue = float(pred_df["forecast_revenue"].sum())
    growth_pct = round(((forecast_revenue - current_revenue) / (current_revenue + 1e-4)) * 100, 2)

    bt = run_chronological_backtest(df)
    wmape = bt["ml_model_metrics"]["wmape"]

    return {
        "current_revenue": round(current_revenue, 2),
        "forecast_revenue": round(forecast_revenue, 2),
        "forecast_growth_pct": growth_pct,
        "forecast_accuracy_pct": max(0.0, round(100.0 - wmape, 1)),
        "wmape": wmape,
        "prediction_interval_80": {
            "lower": round(float(pred_df["revenue_lower_80"].sum()), 2),
            "expected": round(forecast_revenue, 2),
            "upper": round(float(pred_df["revenue_upper_80"].sum()), 2)
        }
    }

def get_backtest_metrics(db) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    return run_chronological_backtest(df)

def get_leakage_audit(db) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    df_feat = engineer_forecasting_features(df)
    return run_data_leakage_audit(df_feat)
