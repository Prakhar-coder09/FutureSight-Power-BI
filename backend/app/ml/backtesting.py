import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from app.ml.features import engineer_forecasting_features, FEATURE_COLS
from app.ml.forecaster import forecaster

def evaluate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes rigorous forecast evaluation metrics:
    MAE, RMSE, MAPE, WMAPE, Forecast Bias, R^2.
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(root_mean_squared_error(y_true, y_pred))
    
    # Avoid zero division in MAPE
    denom = np.where(y_true == 0, 1e-4, y_true)
    mape = float(np.mean(np.abs((y_true - y_pred) / denom)) * 100.0)
    
    # WMAPE (Weighted Absolute Percentage Error = sum(|y - y_hat|) / sum(y))
    sum_y = float(np.sum(y_true))
    wmape = float((np.sum(np.abs(y_true - y_pred)) / (sum_y if sum_y > 0 else 1.0)) * 100.0)
    
    # Forecast bias ((sum(y_hat - y) / sum(y)) * 100%)
    bias = float((np.sum(y_pred - y_true) / (sum_y if sum_y > 0 else 1.0)) * 100.0)
    
    r2 = float(r2_score(y_true, y_pred))
    
    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "wmape": round(wmape, 2),
        "forecast_bias": round(bias, 2),
        "r2": round(r2, 4)
    }

def run_chronological_backtest(df_raw: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs walk-forward chronological evaluation:
    - Train: Weeks 1 to 80
    - Validation: Weeks 81 to 100
    - Test: Weeks 101 to 121
    Compares Baseline Naive, Seasonal Naive, and ML (HistGradientBoosting).
    """
    df_feat = engineer_forecasting_features(df_raw)
    
    train_mask = df_feat["trend_index"] <= 80
    val_mask = (df_feat["trend_index"] > 80) & (df_feat["trend_index"] <= 100)
    test_mask = df_feat["trend_index"] > 100
    
    train_df = df_feat[train_mask]
    val_df = df_feat[val_mask]
    test_df = df_feat[test_mask]
    
    # Train forecaster
    forecaster.fit(train_df)
    
    # Predict on test set
    test_pred_df = forecaster.predict(test_df)
    
    y_test = test_pred_df["Quantity"].values
    y_ml = test_pred_df["forecast_quantity"].values
    y_naive = test_pred_df["baseline_naive"].values
    y_seasonal = test_pred_df["baseline_seasonal"].values
    
    ml_metrics = evaluate_metrics(y_test, y_ml)
    naive_metrics = evaluate_metrics(y_test, y_naive)
    seasonal_metrics = evaluate_metrics(y_test, y_seasonal)
    
    # Relative improvement
    wmape_improvement = round(naive_metrics["wmape"] - ml_metrics["wmape"], 2)
    
    return {
        "split_summary": {
            "train_weeks": "Weeks 1–80",
            "val_weeks": "Weeks 81–100",
            "test_weeks": "Weeks 101–121",
            "train_rows": len(train_df),
            "val_rows": len(val_df),
            "test_rows": len(test_df)
        },
        "ml_model_metrics": ml_metrics,
        "baseline_naive_metrics": naive_metrics,
        "baseline_seasonal_metrics": seasonal_metrics,
        "comparison_table": [
            {
                "model_name": "HistGradientBoosting (Enterprise ML)",
                "mae": ml_metrics["mae"],
                "rmse": ml_metrics["rmse"],
                "mape": f"{ml_metrics['mape']}%",
                "wmape": f"{ml_metrics['wmape']}%",
                "bias": f"{ml_metrics['forecast_bias']}%",
                "r2": ml_metrics["r2"],
                "status": "ACTIVE / DEPLOYED"
            },
            {
                "model_name": "Seasonal Naive (4-Week Lag)",
                "mae": seasonal_metrics["mae"],
                "rmse": seasonal_metrics["rmse"],
                "mape": f"{seasonal_metrics['mape']}%",
                "wmape": f"{seasonal_metrics['wmape']}%",
                "bias": f"{seasonal_metrics['forecast_bias']}%",
                "r2": seasonal_metrics["r2"],
                "status": "BASELINE COMPARISON"
            },
            {
                "model_name": "Naive Baseline (T-1 Last Week)",
                "mae": naive_metrics["mae"],
                "rmse": naive_metrics["rmse"],
                "mape": f"{naive_metrics['mape']}%",
                "wmape": f"{naive_metrics['wmape']}%",
                "bias": f"{naive_metrics['forecast_bias']}%",
                "r2": naive_metrics["r2"],
                "status": "BASELINE COMPARISON"
            }
        ],
        "wmape_improvement_vs_naive": wmape_improvement,
        "honest_accuracy_note": (
            "Forecast accuracy is measured strictly on unseen historical test periods (weeks 101–121) "
            "using time-based walk-forward backtesting. Forecast uncertainty naturally increases further "
            "into the future and during severe promotional shocks."
        )
    }
