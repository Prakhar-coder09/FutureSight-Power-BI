import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import HistGradientBoostingRegressor
from app.ml.features import engineer_forecasting_features, FEATURE_COLS

class OJForecastingEngine:
    """
    Forecasting Engine for Store x Brand x Week.
    Target: Quantity.
    Derived Target: Revenue = Quantity * Price.
    Uncertainty: Calibrated residual quantile intervals (80% and 95%).
    """
    def __init__(self):
        self.ml_model = HistGradientBoostingRegressor(
            loss="squared_error",
            learning_rate=0.08,
            max_iter=150,
            max_leaf_nodes=31,
            random_state=42
        )
        self.is_trained = False
        self.residual_std_80 = 45.0  # fallback calibrated residual std
        self.residual_std_95 = 70.0

    def fit(self, train_df: pd.DataFrame) -> Dict[str, float]:
        X_train = train_df[FEATURE_COLS]
        y_train = train_df["Quantity"]
        
        self.ml_model.fit(X_train, y_train)
        self.is_trained = True
        
        # Calculate training residuals
        preds = self.ml_model.predict(X_train)
        residuals = y_train - preds
        std = np.std(residuals)
        self.residual_std_80 = float(std * 1.282)
        self.residual_std_95 = float(std * 1.960)
        
        return {
            "train_mae": float(np.mean(np.abs(residuals))),
            "residual_std": float(std)
        }

    def predict(self, df_with_features: pd.DataFrame) -> pd.DataFrame:
        if not self.is_trained:
            self.fit(df_with_features)

        df = df_with_features.copy()
        X = df[FEATURE_COLS]
        
        # 1. Baseline Predictions
        # Naive: last week's quantity (qty_lag_1)
        df["baseline_naive"] = df["qty_lag_1"].fillna(df["Quantity"])
        # Seasonal Naive: 4-week lag
        df["baseline_seasonal"] = df["qty_lag_4"].fillna(df["qty_lag_1"])

        # 2. ML Prediction (Quantity)
        raw_pred = self.ml_model.predict(X)
        df["forecast_quantity"] = np.maximum(5.0, np.round(raw_pred, 1))

        # 3. Prediction Intervals (80% and 95%)
        df["quantity_lower_80"] = np.maximum(0.0, np.round(df["forecast_quantity"] - self.residual_std_80, 1))
        df["quantity_upper_80"] = np.round(df["forecast_quantity"] + self.residual_std_80, 1)

        df["quantity_lower_95"] = np.maximum(0.0, np.round(df["forecast_quantity"] - self.residual_std_95, 1))
        df["quantity_upper_95"] = np.round(df["forecast_quantity"] + self.residual_std_95, 1)

        # 4. Derived Revenue = Quantity * Price
        df["forecast_revenue"] = np.round(df["forecast_quantity"] * df["Price"], 2)
        df["revenue_lower_80"] = np.round(df["quantity_lower_80"] * df["Price"], 2)
        df["revenue_upper_80"] = np.round(df["quantity_upper_80"] * df["Price"], 2)

        df["revenue_lower_95"] = np.round(df["quantity_lower_95"] * df["Price"], 2)
        df["revenue_upper_95"] = np.round(df["quantity_upper_95"] * df["Price"], 2)

        return df

forecaster = OJForecastingEngine()
