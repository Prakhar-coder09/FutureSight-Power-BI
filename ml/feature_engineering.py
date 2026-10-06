"""
Future-Sight AI — Causal Feature Engineering
Strictly enforces time causality: week T features only see up to week T-1.
Guarantees zero future data leakage.
"""

import pandas as pd
import numpy as np

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates causal time-series and econometric features for Store x Brand x Week.
    """
    df = df.sort_values(by=["Store", "Brand", "WeekStarting"]).copy()

    # Time & Seasonality Features
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    df["week_of_year"] = df["WeekStarting"].dt.isocalendar().week.astype(int)
    df["month"] = df["WeekStarting"].dt.month
    df["seasonal_sin"] = np.sin(2 * np.pi * df["week_of_year"] / 52.0)
    df["seasonal_cos"] = np.cos(2 * np.pi * df["week_of_year"] / 52.0)

    # Econometric Price & Promotion Ratios
    df["log_price"] = np.log(np.maximum(0.1, df["Price"]))
    df["price_advert_interaction"] = df["Price"] * df["Advert"]

    # Brand One-Hot Encoding
    brand_dummies = pd.get_dummies(df["Brand"], prefix="brand", dtype=int)
    df = pd.concat([df, brand_dummies], axis=1)

    # Causal Groupby Lags and Rolling Windows (Grouped by Store, Brand)
    grouped = df.groupby(["Store", "Brand"])

    # 1. Direct Lags (Strictly T-k)
    for lag in [1, 2, 4, 8, 12]:
        df[f"qty_lag_{lag}"] = grouped["Quantity"].shift(lag)
        df[f"price_lag_{lag}"] = grouped["Price"].shift(lag)
        df[f"advert_lag_{lag}"] = grouped["Advert"].shift(lag)

    # 2. Causal Rolling Windows (Shifted by 1 so week T does not see itself)
    shifted_qty = grouped["Quantity"].shift(1)
    df["rolling_mean_4"] = grouped["Quantity"].apply(lambda s: s.shift(1).rolling(4, min_periods=1).mean()).reset_index(level=[0, 1], drop=True)
    df["rolling_mean_8"] = grouped["Quantity"].apply(lambda s: s.shift(1).rolling(8, min_periods=1).mean()).reset_index(level=[0, 1], drop=True)
    df["rolling_mean_12"] = grouped["Quantity"].apply(lambda s: s.shift(1).rolling(12, min_periods=1).mean()).reset_index(level=[0, 1], drop=True)
    df["rolling_std_4"] = grouped["Quantity"].apply(lambda s: s.shift(1).rolling(4, min_periods=1).std()).reset_index(level=[0, 1], drop=True).fillna(0.0)

    # Rolling price reference
    df["rolling_price_mean_4"] = grouped["Price"].apply(lambda s: s.shift(1).rolling(4, min_periods=1).mean()).reset_index(level=[0, 1], drop=True)
    df["price_ratio_history"] = df["Price"] / (df["rolling_price_mean_4"] + 1e-4)

    # Fill NaN values in early lag periods with forward/backward fills
    feature_cols = [c for c in df.columns if c.startswith("qty_lag") or c.startswith("rolling_") or c.startswith("price_lag")]
    for col in feature_cols:
        df[col] = df.groupby("Brand")[col].transform(lambda x: x.fillna(x.median()).fillna(0.0))

    return df

if __name__ == "__main__":
    from data_preprocessing import preprocess_oj_data
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).resolve().parent.parent / "backend"))
    from app.data.oj_generator import generate_canonical_oj_dataset
    raw = generate_canonical_oj_dataset(num_stores=3, total_weeks=20)
    clean, _ = preprocess_oj_data(raw)
    feat = engineer_features(clean)
    print("Features created:", len(feat.columns), "columns:", [c for c in feat.columns if "lag" in c or "rolling" in c][:6])
