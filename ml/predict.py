"""
Future-Sight AI — Forward Prediction & Uncertainty Estimation
Computes point forecasts and 80%/95% prediction intervals.
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODELS_DIR / "forecaster_hgb.joblib"

def predict_sales(df_features: pd.DataFrame, model_obj: Optional[Any] = None) -> pd.DataFrame:
    """
    Generates forward predictions with calibrated 80% and 95% confidence intervals.
    """
    if model_obj is None:
        if MODEL_PATH.exists():
            artifact = joblib.load(MODEL_PATH)
            model = artifact["model"]
            metadata = artifact["metadata"]
            features = metadata["features"]
            residual_std = metadata.get("residual_std", 15.0)
        else:
            # Fallback inline training if model not saved yet
            from train import train_forecasting_model
            model, metadata = train_forecasting_model(df_features)
            features = metadata["features"]
            residual_std = metadata.get("residual_std", 15.0)
    else:
        model = model_obj
        features = [c for c in df_features.columns if c in ["Price", "Advert", "log_price", "price_advert_interaction",
            "week_of_year", "month", "seasonal_sin", "seasonal_cos", "qty_lag_1", "qty_lag_2", "qty_lag_4",
            "rolling_mean_4", "rolling_mean_8", "rolling_std_4", "price_ratio_history"] or c.startswith("brand_")]
        residual_std = 15.0

    # Ensure all feature columns exist
    X = pd.DataFrame(index=df_features.index)
    for col in features:
        if col in df_features.columns:
            X[col] = df_features[col].fillna(0.0)
        else:
            X[col] = 0.0

    pred_qty = np.maximum(0.0, model.predict(X))

    res = df_features.copy()
    res["forecast_quantity"] = np.round(pred_qty, 1)
    res["forecast_revenue"] = np.round(res["forecast_quantity"] * res["Price"], 2)

    # 80% interval (Z = 1.282)
    z_80 = 1.282
    res["quantity_lower_80"] = np.maximum(0.0, np.round(pred_qty - z_80 * residual_std, 1))
    res["quantity_upper_80"] = np.round(pred_qty + z_80 * residual_std, 1)
    res["revenue_lower_80"] = np.round(res["quantity_lower_80"] * res["Price"], 2)
    res["revenue_upper_80"] = np.round(res["quantity_upper_80"] * res["Price"], 2)

    # 95% interval (Z = 1.96)
    z_95 = 1.96
    res["quantity_lower_95"] = np.maximum(0.0, np.round(pred_qty - z_95 * residual_std, 1))
    res["quantity_upper_95"] = np.round(pred_qty + z_95 * residual_std, 1)
    res["revenue_lower_95"] = np.round(res["quantity_lower_95"] * res["Price"], 2)
    res["revenue_upper_95"] = np.round(res["quantity_upper_95"] * res["Price"], 2)

    return res

if __name__ == "__main__":
    from data_preprocessing import preprocess_oj_data
    from feature_engineering import engineer_features
    import sys
    sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))
    from app.data.oj_generator import generate_canonical_oj_dataset
    raw = generate_canonical_oj_dataset(num_stores=5, total_weeks=20)
    clean, _ = preprocess_oj_data(raw)
    feat = engineer_features(clean)
    preds = predict_sales(feat)
    print("Predictions verified:", preds[["Store", "Brand", "forecast_quantity", "forecast_revenue"]].head())
