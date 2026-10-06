"""
Future-Sight AI — Model Training Pipeline
Trains high-efficiency HistGradientBoostingRegressor on chronological train partition (Weeks 1-80).
"""

import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import HistGradientBoostingRegressor
from typing import Dict, Any, Tuple

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FEATURE_COLS = [
    "Price", "Advert", "log_price", "price_advert_interaction",
    "week_of_year", "month", "seasonal_sin", "seasonal_cos",
    "qty_lag_1", "qty_lag_2", "qty_lag_4", "qty_lag_8",
    "rolling_mean_4", "rolling_mean_8", "rolling_std_4",
    "price_ratio_history"
]

def train_forecasting_model(df_features: pd.DataFrame, train_cutoff_week: int = 80) -> Tuple[HistGradientBoostingRegressor, Dict[str, Any]]:
    """
    Trains HistGradientBoosting model strictly on Weeks <= train_cutoff_week.
    """
    df = df_features.sort_values("WeekStarting").copy()
    unique_weeks = sorted(df["WeekStarting"].unique())
    cutoff_date = unique_weeks[min(train_cutoff_week - 1, len(unique_weeks) - 1)]

    train_df = df[df["WeekStarting"] <= cutoff_date]
    available_features = [c for c in MODEL_FEATURE_COLS if c in train_df.columns]
    brand_cols = [c for c in train_df.columns if c.startswith("brand_")]
    all_features = available_features + brand_cols

    X_train = train_df[all_features].fillna(0.0)
    y_train = train_df["Quantity"].values

    model = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=31,
        min_samples_leaf=20,
        random_state=42
    )
    model.fit(X_train, y_train)

    train_preds = model.predict(X_train)
    residuals = y_train - train_preds
    residual_std = float(np.std(residuals))

    metadata = {
        "model_name": "HistGradientBoosting-Regressor",
        "version": "v1.4.2",
        "train_rows": len(X_train),
        "features": all_features,
        "residual_std": round(residual_std, 3),
        "train_mae": round(float(np.mean(np.abs(residuals))), 2),
        "train_rmse": round(float(np.sqrt(np.mean(residuals**2))), 2)
    }

    # Save artifact
    model_path = MODELS_DIR / "forecaster_hgb.joblib"
    joblib.dump({"model": model, "metadata": metadata}, model_path)

    return model, metadata

if __name__ == "__main__":
    from data_preprocessing import preprocess_oj_data
    from feature_engineering import engineer_features
    import sys
    sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))
    from app.data.oj_generator import generate_canonical_oj_dataset
    raw = generate_canonical_oj_dataset(num_stores=10, total_weeks=100)
    clean, _ = preprocess_oj_data(raw)
    feat = engineer_features(clean)
    m, meta = train_forecasting_model(feat)
    print("Model trained successfully:", meta)
