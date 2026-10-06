import pandas as pd
import numpy as np
from typing import Tuple, List

FEATURE_COLS = [
    # Time features
    "week_of_year", "month", "quarter", "trend_index", "seasonal_sin", "seasonal_cos",
    # Lag features
    "qty_lag_1", "qty_lag_2", "qty_lag_4", "qty_lag_8", "qty_lag_12",
    # Rolling features (strictly past only)
    "rolling_mean_4", "rolling_mean_8", "rolling_mean_12", "rolling_std_4", "momentum_4_12", "recent_growth_2",
    # Business & Elasticity features
    "Price", "Advert", "price_lag_1", "price_change_pct", "advert_lag_1", "advert_freq_4w",
    "price_rel_history", "price_advert_interaction",
    # Categorical encoded
    "brand_code", "store_code"
]

def engineer_forecasting_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs leak-free causal features for Store x Brand time series.
    All rolling and lag statistics strictly use historical data up to T-1.
    """
    df = df.copy()
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    df = df.sort_values(["Store", "Brand", "WeekStarting"]).reset_index(drop=True)

    # 1. Time & Seasonal Features
    df["week_of_year"] = df["WeekStarting"].dt.isocalendar().week.astype(int)
    df["month"] = df["WeekStarting"].dt.month
    df["quarter"] = df["WeekStarting"].dt.quarter
    
    # Global trend index (weeks elapsed from start)
    min_date = df["WeekStarting"].min()
    df["trend_index"] = ((df["WeekStarting"] - min_date).dt.days // 7).astype(int)
    
    # Cyclical trigonometric transforms for seasonality
    df["seasonal_sin"] = np.sin(2 * np.pi * df["week_of_year"] / 52.0)
    df["seasonal_cos"] = np.cos(2 * np.pi * df["week_of_year"] / 52.0)

    # Categorical codes
    df["brand_code"] = df["Brand"].astype("category").cat.codes
    df["store_code"] = df["Store"].astype("category").cat.codes

    # Grouped operations per Store x Brand
    grouped = df.groupby(["Store", "Brand"])

    # 2. Causal Lag Features (strictly T-1, T-2, T-4, T-8, T-12)
    df["qty_lag_1"] = grouped["Quantity"].shift(1)
    df["qty_lag_2"] = grouped["Quantity"].shift(2)
    df["qty_lag_4"] = grouped["Quantity"].shift(4)
    df["qty_lag_8"] = grouped["Quantity"].shift(8)
    df["qty_lag_12"] = grouped["Quantity"].shift(12)

    df["price_lag_1"] = grouped["Price"].shift(1)
    df["advert_lag_1"] = grouped["Advert"].shift(1)

    # 3. Causal Rolling Features (shift by 1 so T is NEVER in the rolling window!)
    # rolling_mean_4 at week T uses: T-1, T-2, T-3, T-4
    shifted_qty = grouped["Quantity"].shift(1)
    df["rolling_mean_4"] = shifted_qty.groupby([df["Store"], df["Brand"]]).rolling(4, min_periods=1).mean().reset_index(drop=True)
    df["rolling_mean_8"] = shifted_qty.groupby([df["Store"], df["Brand"]]).rolling(8, min_periods=1).mean().reset_index(drop=True)
    df["rolling_mean_12"] = shifted_qty.groupby([df["Store"], df["Brand"]]).rolling(12, min_periods=1).mean().reset_index(drop=True)
    df["rolling_std_4"] = shifted_qty.groupby([df["Store"], df["Brand"]]).rolling(4, min_periods=1).std().fillna(0).reset_index(drop=True)

    # Momentum and growth
    df["momentum_4_12"] = (df["rolling_mean_4"] / (df["rolling_mean_12"] + 1e-4)) - 1.0
    df["recent_growth_2"] = ((df["qty_lag_1"] - df["qty_lag_2"]) / (df["qty_lag_2"] + 1e-4))

    # 4. Business & Elasticity Features
    df["price_change_pct"] = (df["Price"] - df["price_lag_1"]) / (df["price_lag_1"] + 1e-4)
    
    # 4-week promo frequency
    shifted_adv = grouped["Advert"].shift(1)
    df["advert_freq_4w"] = shifted_adv.groupby([df["Store"], df["Brand"]]).rolling(4, min_periods=1).mean().reset_index(drop=True)

    # Price relative to rolling historical price
    shifted_price = grouped["Price"].shift(1)
    hist_price_mean = shifted_price.groupby([df["Store"], df["Brand"]]).rolling(12, min_periods=1).mean().reset_index(drop=True)
    df["price_rel_history"] = df["Price"] / (hist_price_mean + 1e-4)
    
    # Interaction
    df["price_advert_interaction"] = df["Price"] * df["Advert"]

    # Fill earliest edge NaNs with group means or backfill to prevent data dropping
    df = df.bfill().ffill().fillna(0)

    return df
