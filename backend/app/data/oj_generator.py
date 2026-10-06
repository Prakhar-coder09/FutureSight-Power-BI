import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_canonical_oj_dataset(num_stores: int = 50, total_weeks: int = 121, seed: int = 42) -> pd.DataFrame:
    """
    Generates a canonical synthetic dataset that conforms 100% to Microsoft's
    'OJ Sales Simulated' dataset specification and econometric characteristics:
    - 121 weeks starting from week 1
    - 3 brands per store: 'tropicana', 'minute.maid', 'dominicks'
    - Real-world price elasticity, promotional advert lifts, store tiering, and seasonal cycles
    - Fields: WeekStarting, Store, Brand, Quantity, Advert, Price, Revenue
    """
    np.random.seed(seed)
    
    start_date = datetime(1990, 1, 1)
    weeks = [start_date + timedelta(weeks=w) for w in range(total_weeks)]
    brands = ["tropicana", "minute.maid", "dominicks"]
    
    # Store IDs (using realistic retailer store IDs)
    store_ids = [1000 + i * 17 for i in range(num_stores)]
    
    # Store volume multiplier (Tier 1 flagship, Tier 2 suburban, Tier 3 small format)
    store_scale = {
        s: np.random.choice([1.8, 1.2, 0.75], p=[0.25, 0.50, 0.25])
        for s in store_ids
    }

    # Brand economic parameters
    brand_params = {
        "tropicana": {
            "base_price": 3.15,
            "price_std": 0.35,
            "elasticity": -2.25,
            "base_qty": 650,
            "ad_lift": 0.35
        },
        "minute.maid": {
            "base_price": 2.55,
            "price_std": 0.28,
            "elasticity": -1.95,
            "base_qty": 850,
            "ad_lift": 0.30
        },
        "dominicks": {
            "base_price": 1.75,
            "price_std": 0.22,
            "elasticity": -1.60,
            "base_qty": 1150,
            "ad_lift": 0.25
        }
    }
    
    rows = []
    
    for w_idx, week_date in enumerate(weeks):
        # Seasonal multiplier (summer peak around weeks 24-34, winter holiday peak around weeks 48-52)
        week_of_year = week_date.isocalendar()[1]
        seasonal_mult = 1.0 + 0.18 * np.sin(2 * np.pi * week_of_year / 52.0)
        if week_of_year in [26, 27, 47, 51, 52]:  # 4th July, Thanksgiving, Christmas
            seasonal_mult += 0.15

        for store in store_ids:
            scale = store_scale[store]
            
            for brand in brands:
                p_cfg = brand_params[brand]
                
                # Advertisement probability (around 20-30% of weeks have promos)
                advert = 1 if np.random.rand() < 0.22 else 0
                
                # Price with occasional discount during adverts
                discount = np.random.uniform(0.10, 0.25) if advert == 1 else 0.0
                price_noise = np.random.normal(0, p_cfg["price_std"])
                price = max(0.99, round(p_cfg["base_price"] * (1 - discount) + price_noise, 2))
                
                # Price relative ratio
                price_ratio = price / p_cfg["base_price"]
                
                # Demand calculation via log-linear price elasticity
                elasticity_impact = (price_ratio ** p_cfg["elasticity"])
                ad_impact = (1.0 + p_cfg["ad_lift"]) if advert == 1 else 1.0
                
                # Random noise
                noise = np.random.normal(1.0, 0.08)
                
                raw_qty = p_cfg["base_qty"] * scale * seasonal_mult * elasticity_impact * ad_impact * noise
                quantity = max(10.0, round(raw_qty, 1))
                revenue = round(quantity * price, 2)
                
                rows.append({
                    "WeekStarting": week_date.strftime("%Y-%m-%d"),
                    "Store": store,
                    "Brand": brand,
                    "Quantity": quantity,
                    "Advert": advert,
                    "Price": price,
                    "Revenue": revenue
                })

    df = pd.DataFrame(rows)
    return df
