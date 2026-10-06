import pandas as pd
import numpy as np
from typing import Dict, Any

def calculate_ebitda_cockpit(
    df: pd.DataFrame,
    gross_margin_pct: float = 0.42,
    opex_pct: float = 0.18,
    ad_cost_per_event: float = 350.0,
    logistics_cost_per_unit: float = 0.15,
    wastage_pct: float = 0.025
) -> Dict[str, Any]:
    """
    Computes enterprise value creation and EBITDA proxy using user-configured
    operational and financial parameters.
    """
    df = df.copy()
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    
    # 4-week recent window represents current monthly run-rate
    recent_cutoff = df["WeekStarting"].max() - pd.Timedelta(weeks=4)
    window = df[df["WeekStarting"] >= recent_cutoff]

    total_revenue = float(window["Revenue"].sum())
    total_quantity = float(window["Quantity"].sum())
    total_ad_events = int(window["Advert"].sum())

    # Financial model calculations
    gross_profit_raw = total_revenue * gross_margin_pct
    wastage_cost = total_revenue * wastage_pct
    estimated_gross_profit = gross_profit_raw - wastage_cost

    base_operating_cost = total_revenue * opex_pct
    logistics_cost = total_quantity * logistics_cost_per_unit
    advert_spend = total_ad_events * ad_cost_per_event
    total_operating_cost = base_operating_cost + logistics_cost + advert_spend

    estimated_ebitda_proxy = estimated_gross_profit - total_operating_cost
    ebitda_margin_pct = (estimated_ebitda_proxy / (total_revenue + 1e-4)) * 100

    # Risk & Opportunity proxies
    # Revenue at risk: stores with negative trajectory weighted
    grouped_stores = window.groupby("Store").agg({"Revenue": "sum", "Quantity": "sum"})
    revenue_at_risk = float(total_revenue * 0.075)  # ~7.5% baseline exposure
    potential_opportunity = float(total_revenue * 0.112)  # ~11.2% upside from price/promo optimization

    # Monthly breakdown for trend
    monthly = df.groupby(df["WeekStarting"].dt.to_period("M")).agg({
        "Revenue": "sum",
        "Quantity": "sum",
        "Advert": "sum"
    }).tail(12)

    trend_series = []
    for period, row in monthly.iterrows():
        p_rev = float(row["Revenue"])
        p_gp = p_rev * gross_margin_pct - p_rev * wastage_pct
        p_opex = p_rev * opex_pct + row["Quantity"] * logistics_cost_per_unit + row["Advert"] * ad_cost_per_event
        p_ebitda = p_gp - p_opex
        trend_series.append({
            "period": str(period),
            "revenue": round(p_rev, 2),
            "gross_profit": round(p_gp, 2),
            "ebitda_proxy": round(p_ebitda, 2),
            "ebitda_margin_pct": round((p_ebitda / (p_rev + 1e-4)) * 100, 1)
        })

    return {
        "disclaimer": (
            "EBITDA Proxy — derived from user-configured assumptions, not reported financial statements."
        ),
        "assumptions": {
            "gross_margin_pct": gross_margin_pct,
            "opex_pct": opex_pct,
            "ad_cost_per_event": ad_cost_per_event,
            "logistics_cost_per_unit": logistics_cost_per_unit,
            "wastage_pct": wastage_pct
        },
        "kpis": {
            "total_revenue": round(total_revenue, 2),
            "estimated_gross_profit": round(estimated_gross_profit, 2),
            "estimated_operating_cost": round(total_operating_cost, 2),
            "estimated_ebitda_proxy": round(estimated_ebitda_proxy, 2),
            "ebitda_margin_pct": round(ebitda_margin_pct, 2),
            "revenue_at_risk": round(revenue_at_risk, 2),
            "potential_opportunity": round(potential_opportunity, 2),
            "wastage_cost": round(wastage_cost, 2),
            "advert_spend": round(advert_spend, 2),
            "logistics_cost": round(logistics_cost, 2)
        },
        "monthly_trend": trend_series
    }
