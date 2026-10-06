import pandas as pd
import numpy as np
from typing import Dict, Any, List

def simulate_scenario(
    df: pd.DataFrame,
    price_delta_pct: float = 0.0,       # e.g. +0.05 for +5%
    advert_multiplier: float = 1.0,     # e.g. 1.20 for +20% promo lift or 0.0 for Off
    demand_shock_pct: float = 0.0,      # e.g. -0.10 for -10% market shock
    supply_constraint_pct: float = 0.0, # e.g. -0.15 for -15% supply cap
    target_brand: str = "ALL",          # 'ALL', 'tropicana', 'minute.maid', 'dominicks'
    target_store: int = 0               # 0 = All stores
) -> Dict[str, Any]:
    """
    Simulates business scenario outcomes by perturbing econometric drivers:
    Q_scenario = Q_base * (1 + price_delta * elasticity) * ad_impact * (1 + demand_shock)
    subject to supply constraint cap.
    """
    df = df.copy()
    df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
    recent_cutoff = df["WeekStarting"].max() - pd.Timedelta(weeks=4)
    base_window = df[df["WeekStarting"] >= recent_cutoff]

    if target_brand != "ALL":
        base_window = base_window[base_window["Brand"] == target_brand]
    if target_store != 0:
        base_window = base_window[base_window["Store"] == target_store]

    # Brand elasticity assumptions calibrated from empirical data
    brand_elasticities = {
        "tropicana": -2.25,
        "minute.maid": -1.95,
        "dominicks": -1.60
    }

    base_quantity = float(base_window["Quantity"].sum())
    base_revenue = float(base_window["Revenue"].sum())

    sim_rows = []
    
    for _, row in base_window.iterrows():
        b = row["Brand"]
        elasticity = brand_elasticities.get(b, -2.0)
        
        # New Price
        new_price = round(row["Price"] * (1.0 + price_delta_pct), 2)
        
        # Elasticity effect: (P_new / P_old)^elasticity
        price_ratio = (1.0 + price_delta_pct)
        elasticity_factor = price_ratio ** elasticity if price_ratio > 0 else 1.0
        
        # Advert effect
        if advert_multiplier == 0.0:
            # Promo turned off
            ad_factor = 0.75 if row["Advert"] == 1 else 1.0
        else:
            ad_factor = (1.0 + 0.25 * (advert_multiplier - 1.0)) if row["Advert"] == 1 else 1.0
            
        # Demand shock
        shock_factor = 1.0 + demand_shock_pct
        
        # Unconstrained expected demand
        raw_sim_qty = row["Quantity"] * elasticity_factor * ad_factor * shock_factor
        
        # Supply cap constraint (if supply constraint is negative, e.g. -15%, max available is 85% of baseline)
        if supply_constraint_pct < 0:
            max_supply = row["Quantity"] * (1.0 + supply_constraint_pct)
            sim_qty = min(raw_sim_qty, max_supply)
        else:
            sim_qty = raw_sim_qty
            
        sim_qty = max(0.0, round(sim_qty, 1))
        sim_rev = round(sim_qty * new_price, 2)
        
        sim_rows.append({
            "store": row["Store"],
            "brand": row["Brand"],
            "sim_qty": sim_qty,
            "sim_rev": sim_rev,
            "base_qty": row["Quantity"],
            "base_rev": row["Revenue"]
        })

    sim_df = pd.DataFrame(sim_rows)
    scenario_quantity = float(sim_df["sim_qty"].sum())
    scenario_revenue = float(sim_df["sim_rev"].sum())

    rev_delta = round(scenario_revenue - base_revenue, 2)
    rev_delta_pct = round((rev_delta / (base_revenue + 1e-4)) * 100, 2)
    
    qty_delta = round(scenario_quantity - base_quantity, 1)
    qty_delta_pct = round((qty_delta / (base_quantity + 1e-4)) * 100, 2)

    # Affected stores and brands counts
    affected_stores = int(sim_df["store"].nunique())
    affected_brands = int(sim_df["brand"].nunique())
    
    # Store-level downside vulnerability
    store_diffs = sim_df.groupby("store").agg({"base_rev": "sum", "sim_rev": "sum"})
    neg_stores = int((store_diffs["sim_rev"] < store_diffs["base_rev"]).sum())
    pos_stores = int((store_diffs["sim_rev"] >= store_diffs["base_rev"]).sum())

    # Risk and confidence calculation
    risk_level = "HIGH" if rev_delta_pct < -5.0 else ("MEDIUM" if rev_delta_pct < 0.0 else "LOW")
    confidence_score = max(55.0, round(88.0 - abs(price_delta_pct) * 80 - abs(demand_shock_pct) * 50, 1))

    # Recommended intervention based on outcome
    if rev_delta < 0 and price_delta_pct > 0:
        action = "Elasticity penalty outpaces price gain. Recommend selective promotional discounting or targeting value brand."
    elif rev_delta > 0 and qty_delta_pct < -8:
        action = "Revenue increases but velocity drops sharply. Monitor shelf-space share loss to competing private labels."
    elif supply_constraint_pct < 0:
        action = "Supply bottleneck detected. Prioritize allocation to top-tier high margin flagship stores."
    else:
        action = "Favorable scenario trajectory. Test promotional rollout in suburban cluster first."

    # Ripple Effect Graph Data
    ripple_chain = [
        {"stage": "Input Decision", "label": f"Price {price_delta_pct*100:+.1f}%, Promo x{advert_multiplier}", "value": "Applied", "color": "#06B6D4"},
        {"stage": "Demand Shock", "label": f"Volume Velocity Delta: {qty_delta_pct:+.1f}%", "value": f"{qty_delta:+.0f} units", "color": "#8B5CF6"},
        {"stage": "Store Distribution", "label": f"{affected_stores} Stores Affected ({neg_stores} negative)", "value": f"{affected_stores} Stores", "color": "#F59E0B" if neg_stores > pos_stores else "#10B981"},
        {"stage": "Revenue Outcome", "label": f"Enterprise Revenue Delta: {rev_delta_pct:+.1f}%", "value": f"${rev_delta:+,.0f}", "color": "#10B981" if rev_delta >= 0 else "#EF4444"},
        {"stage": "EBITDA Proxy", "label": f"Approx Operating Impact: ${(rev_delta * 0.42):+,.0f}", "value": "42% Margin Proxy", "color": "#3B82F6"}
    ]

    return {
        "inputs": {
            "price_delta_pct": price_delta_pct,
            "advert_multiplier": advert_multiplier,
            "demand_shock_pct": demand_shock_pct,
            "supply_constraint_pct": supply_constraint_pct,
            "target_brand": target_brand,
            "target_store": target_store
        },
        "base_case": {
            "revenue": round(base_revenue, 2),
            "quantity": round(base_quantity, 1)
        },
        "scenario": {
            "revenue": round(scenario_revenue, 2),
            "quantity": round(scenario_quantity, 1),
            "revenue_delta": rev_delta,
            "revenue_delta_pct": rev_delta_pct,
            "quantity_delta": qty_delta,
            "quantity_delta_pct": qty_delta_pct
        },
        "affected_entities": {
            "stores_count": affected_stores,
            "brands_count": affected_brands,
            "declining_stores_count": neg_stores,
            "growing_stores_count": pos_stores
        },
        "risk_level": risk_level,
        "confidence": confidence_score,
        "recommended_action": action,
        "ripple_chain": ripple_chain,
        "label": "Scenario Simulation Estimate (Econometrically Modelled)"
    }
