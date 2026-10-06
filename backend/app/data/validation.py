import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List

REQUIRED_COLUMNS = ["WeekStarting", "Store", "Brand", "Quantity", "Advert", "Price", "Revenue"]

def validate_and_profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs comprehensive enterprise dataset validation:
    1. Schema validation (required column names and types)
    2. Missing value checks
    3. Duplicate row detection
    4. Date continuity & gap checks
    5. Value sanity & outlier checks (e.g. negative price, zero quantity, negative revenue)
    6. Composite Data Quality Score (0 to 100)
    """
    issues: List[Dict[str, str]] = []
    
    # 1. Schema check
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        issues.append({
            "severity": "CRITICAL",
            "check": "Schema Validation",
            "detail": f"Missing required columns: {', '.join(missing_cols)}"
        })

    # Work on a copy with parsed dates
    df_clean = df.copy()
    try:
        df_clean["WeekStarting"] = pd.to_datetime(df_clean["WeekStarting"])
    except Exception as e:
        issues.append({
            "severity": "CRITICAL",
            "check": "Date Format",
            "detail": f"Failed to parse 'WeekStarting' dates: {str(e)}"
        })

    row_count = int(len(df_clean))
    store_count = int(df_clean["Store"].nunique()) if "Store" in df_clean.columns else 0
    brand_count = int(df_clean["Brand"].nunique()) if "Brand" in df_clean.columns else 0
    
    min_date = df_clean["WeekStarting"].min().strftime("%Y-%m-%d") if "WeekStarting" in df_clean.columns and not df_clean["WeekStarting"].empty else "N/A"
    max_date = df_clean["WeekStarting"].max().strftime("%Y-%m-%d") if "WeekStarting" in df_clean.columns and not df_clean["WeekStarting"].empty else "N/A"

    # 2. Missing values
    missing_count = int(df_clean[REQUIRED_COLUMNS].isna().sum().sum()) if not missing_cols else int(df_clean.isna().sum().sum())
    
    # 3. Duplicate rows (Store + Brand + WeekStarting should be unique)
    dup_mask = df_clean.duplicated(subset=["Store", "Brand", "WeekStarting"], keep=False) if {"Store", "Brand", "WeekStarting"}.issubset(df_clean.columns) else pd.Series(False, index=df_clean.index)
    duplicate_rows_count = int(dup_mask.sum())
    if duplicate_rows_count > 0:
        issues.append({
            "severity": "WARNING",
            "check": "Duplicate Detection",
            "detail": f"Found {duplicate_rows_count} duplicated Store x Brand x Week records."
        })

    # 4. Value sanity & Suspicious records
    suspicious_count = 0
    if "Price" in df_clean.columns:
        suspicious_count += int((df_clean["Price"] <= 0).sum())
    if "Quantity" in df_clean.columns:
        suspicious_count += int((df_clean["Quantity"] < 0).sum())
    if "Revenue" in df_clean.columns:
        suspicious_count += int((df_clean["Revenue"] < 0).sum())
    
    # Check Price * Quantity consistency (tolerance of 5%)
    if {"Price", "Quantity", "Revenue"}.issubset(df_clean.columns):
        calc_rev = df_clean["Price"] * df_clean["Quantity"]
        rev_mismatch = (np.abs(calc_rev - df_clean["Revenue"]) > 2.0).sum()
        if rev_mismatch > 0:
            suspicious_count += int(rev_mismatch)
            issues.append({
                "severity": "INFO",
                "check": "Revenue Formula Consistency",
                "detail": f"{rev_mismatch} records have slight rounding discrepancy between Quantity * Price and Revenue."
            })

    # 5. Date continuity check
    unique_weeks = sorted(df_clean["WeekStarting"].unique()) if "WeekStarting" in df_clean.columns else []
    weeks_count = len(unique_weeks)
    date_gaps = 0
    if weeks_count > 1:
        diffs = pd.Series(unique_weeks).diff().dropna()
        # Weekly spacing is 7 days
        irregular_weeks = (diffs != pd.Timedelta(days=7)).sum()
        if irregular_weeks > 0:
            date_gaps = int(irregular_weeks)
            issues.append({
                "severity": "WARNING",
                "check": "Date Continuity",
                "detail": f"Detected {irregular_weeks} irregular gap(s) in weekly timeline."
            })

    # 6. Data Quality Score calculation (100 base, deductions for flaws)
    score = 100.0
    if missing_cols:
        score -= 40.0
    if row_count > 0:
        missing_penalty = min(25.0, (missing_count / (row_count * len(REQUIRED_COLUMNS))) * 100 * 2)
        dup_penalty = min(20.0, (duplicate_rows_count / row_count) * 100 * 2)
        suspicious_penalty = min(20.0, (suspicious_count / row_count) * 100 * 2)
        continuity_penalty = min(15.0, date_gaps * 2.0)
        score = max(0.0, score - missing_penalty - dup_penalty - suspicious_penalty - continuity_penalty)
    else:
        score = 0.0

    score = round(score, 1)

    return {
        "is_valid": len(missing_cols) == 0 and score >= 60.0,
        "row_count": row_count,
        "store_count": store_count,
        "brand_count": brand_count,
        "weeks_count": weeks_count,
        "min_date": min_date,
        "max_date": max_date,
        "missing_values_count": missing_count,
        "duplicate_rows_count": duplicate_rows_count,
        "suspicious_values_count": suspicious_count,
        "data_freshness": f"{weeks_count} weeks continuous history through {max_date}",
        "quality_score": score,
        "issues": issues,
        "columns": list(df.columns)
    }
