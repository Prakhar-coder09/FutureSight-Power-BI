import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_risk_radar(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes Demand & Revenue Risk Radar across Stores and Brands.
    Score:
    0–30 = Low
    31–60 = Medium
    61–80 = High
    81–100 = Critical
    """
    df = df.copy()
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    recent_cutoff = df["WeekStarting"].max() - pd.Timedelta(weeks=8)
    recent_df = df[df["WeekStarting"] >= recent_cutoff]

    # Store x Brand level grouping
    items = []
    total_rev_at_risk = 0.0
    
    grouped = recent_df.groupby(["Store", "Brand"])
    
    for (store, brand), group in grouped:
        group = group.sort_values("WeekStarting")
        if len(group) < 3:
            continue
            
        qty_series = group["Quantity"].values
        price_series = group["Price"].values
        ad_series = group["Advert"].values
        rev_series = group["Revenue"].values
        
        # 1. 3-4 week sales decline
        slope = (qty_series[-1] - qty_series[0]) / (qty_series[0] + 1e-4)
        has_steep_decline = slope < -0.12
        has_moderate_decline = -0.12 <= slope < -0.05
        
        # 2. Volatility (CV = std / mean)
        cv = np.std(qty_series) / (np.mean(qty_series) + 1e-4)
        is_volatile = cv > 0.28
        
        # 3. Price hike vulnerability
        price_change = (price_series[-1] - np.mean(price_series[:-1])) / (np.mean(price_series[:-1]) + 1e-4)
        has_price_hike = price_change > 0.05
        
        # 4. Inactive advertisement
        recent_ad_ratio = np.mean(ad_series)
        ad_inactive = recent_ad_ratio == 0.0

        # Calculate composite risk score (0 to 100)
        score = 20.0
        reasons = []

        if has_steep_decline:
            score += 35.0
            reasons.append(f"Steep {abs(round(slope * 100, 1))}% velocity decline over recent weeks")
        elif has_moderate_decline:
            score += 18.0
            reasons.append(f"Softening demand trajectory ({abs(round(slope * 100, 1))}% drop)")

        if is_volatile:
            score += 20.0
            reasons.append(f"Elevated demand volatility (CV: {round(cv, 2)})")

        if has_price_hike:
            score += 15.0
            reasons.append(f"Recent price elevated by {round(price_change * 100, 1)}% without promotional offset")

        if ad_inactive and has_moderate_decline:
            score += 10.0
            reasons.append("Zero promotional presence during softening demand window")

        score = min(98.0, round(score, 1))
        
        if score >= 81:
            risk_tier = "CRITICAL"
        elif score >= 61:
            risk_tier = "HIGH"
        elif score >= 31:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "LOW"

        avg_weekly_rev = float(np.mean(rev_series))
        # Revenue at risk is weighted by risk tier
        risk_weight = 0.50 if risk_tier == "CRITICAL" else (0.30 if risk_tier == "HIGH" else (0.10 if risk_tier == "MEDIUM" else 0.02))
        item_rev_at_risk = round(avg_weekly_rev * risk_weight, 2)
        total_rev_at_risk += item_rev_at_risk

        items.append({
            "store": int(store),
            "brand": str(brand),
            "risk_score": score,
            "risk_tier": risk_tier,
            "avg_weekly_revenue": round(avg_weekly_rev, 2),
            "revenue_at_risk": item_rev_at_risk,
            "recent_volume": round(float(qty_series[-1]), 1),
            "recent_price": round(float(price_series[-1]), 2),
            "volatility_cv": round(float(cv), 2),
            "reasons": reasons if reasons else ["Normal demand fluctuations within expected confidence tolerance"]
        })

    # Sort descending by risk score
    items.sort(key=lambda x: x["risk_score"], reverse=True)

    high_risk_stores = set(item["store"] for item in items if item["risk_tier"] in ["HIGH", "CRITICAL"])
    high_risk_brands = set(item["brand"] for item in items if item["risk_tier"] in ["HIGH", "CRITICAL"])

    return {
        "disclaimer": (
            "This dataset does not contain customer churn labels. The platform therefore models store/brand "
            "demand risk as the closest supported operational-risk use case."
        ),
        "total_entities_evaluated": len(items),
        "high_risk_stores_count": len(high_risk_stores),
        "high_risk_brands_count": len(high_risk_brands),
        "total_revenue_at_risk_weekly": round(total_rev_at_risk, 2),
        "risk_distribution": {
            "critical": sum(1 for x in items if x["risk_tier"] == "CRITICAL"),
            "high": sum(1 for x in items if x["risk_tier"] == "HIGH"),
            "medium": sum(1 for x in items if x["risk_tier"] == "MEDIUM"),
            "low": sum(1 for x in items if x["risk_tier"] == "LOW")
        },
        "items": items[:150]  # Return top 150 actionable risk items
    }
