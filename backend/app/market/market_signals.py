import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List

def get_market_signals() -> Dict[str, Any]:
    """
    Adapter interface for external macroeconomic, commodity, and weather context signals.
    Clearly labeled as scenario context signals only — NOT automated investment advice.
    """
    signals = [
        {
            "id": "SIG_FCOJ",
            "name": "Orange Juice Commodity Futures (FCOJ)",
            "category": "Commodity Benchmark",
            "current_value": 318.50,
            "unit": "USD / lb",
            "change_pct_30d": +8.4,
            "correlation_with_demand": -0.62,
            "status": "SIMULATED",
            "source": "Intercontinental Exchange (ICE) Proxy Feed",
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "impact_interpretation": "Elevated frozen concentrated orange juice futures signal potential upstream wholesale price pressure in Q3."
        },
        {
            "id": "SIG_CPI_FOOD",
            "name": "CPI Food & Beverage Inflation Proxy",
            "category": "Macroeconomic Indicator",
            "current_value": 324.8,
            "unit": "Index (1982=100)",
            "change_pct_30d": +0.3,
            "correlation_with_demand": -0.38,
            "status": "SIMULATED",
            "source": "Bureau of Labor Statistics (BLS) Consumer Price Index",
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "impact_interpretation": "Modest food inflation increases consumer price sensitivity toward premium branded juices (Tropicana) vs store brands (Dominicks)."
        },
        {
            "id": "SIG_UMICH_SENT",
            "name": "Consumer Sentiment Index",
            "category": "Consumer Behavior",
            "current_value": 78.4,
            "unit": "Sentiment Index",
            "change_pct_30d": -2.1,
            "correlation_with_demand": +0.45,
            "status": "SIMULATED",
            "source": "Univ of Michigan Consumer Sentiment Survey Proxy",
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "impact_interpretation": "Softening consumer sentiment correlates with a 3.4% shift toward value brands and increased promotional coupon usage."
        },
        {
            "id": "SIG_FL_WEATHER",
            "name": "Florida Citrus Belt Disruption Index",
            "category": "Agricultural Climate",
            "current_value": 34.0,
            "unit": "Disruption Severity (0-100)",
            "change_pct_30d": -12.0,
            "correlation_with_demand": -0.22,
            "status": "SIMULATED",
            "source": "National Weather Service & Florida Citrus Mutual Index",
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "impact_interpretation": "Favorable harvest weather in Polk and Hendry counties reduces near-term fruit drop risk; supply availability projected stable."
        },
        {
            "id": "SIG_XLP_ETF",
            "name": "S&P Consumer Staples ETF (XLP)",
            "category": "Market Equities Benchmark",
            "current_value": 79.85,
            "unit": "USD",
            "change_pct_30d": +1.8,
            "correlation_with_demand": +0.19,
            "status": "SIMULATED",
            "source": "US Equity Markets Proxy",
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "impact_interpretation": "Consumer staples equities reflect stable operational margins and resilient non-discretionary grocery spend."
        }
    ]

    return {
        "disclaimer": (
            "These market and macroeconomic metrics are provided as scenario and environmental context signals only. "
            "They do NOT constitute financial, investment, or trading advice."
        ),
        "adapter_architecture": "Market API -> Ingestion Service -> Storage Cache -> BI Layer -> Scenario Engine",
        "active_signals_count": len(signals),
        "status_distribution": {
            "live": sum(1 for s in signals if s["status"] == "LIVE"),
            "stale": sum(1 for s in signals if s["status"] == "STALE"),
            "simulated": sum(1 for s in signals if s["status"] == "SIMULATED")
        },
        "signals": signals
    }
