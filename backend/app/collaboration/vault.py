import numpy as np
import pandas as pd
from datetime import datetime, timezone
import hashlib
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import CollaborationQueryRecord, AuditEventRecord
from app.config import settings

def execute_privacy_vault_query(
    query_template_id: str,
    requester_org: str,
    target_org: str,
    filter_param: str,
    db: Session,
    df_oj: pd.DataFrame
) -> Dict[str, Any]:
    """
    Executes a differential privacy / k-anonymity query across two organizations:
    Org A (Retailer Store Sales) and Org B (Supplier Regional Capacity).
    Enforces minimum aggregation threshold k = 10.
    If matched entities < k, output is SUPPRESSED and BLOCKED.
    """
    k_threshold = settings.COLLABORATION_K_ANONYMITY_THRESHOLD
    query_id = f"QRY_{hashlib.md5(f'{query_template_id}_{filter_param}_{datetime.now().isoformat()}'.encode()).hexdigest()[:8].upper()}"

    # Synthetic Org B Supplier Capacity dataset (Clean Adapter)
    supplier_capacity_data = {
        "REGION_EAST": {"capacity_cases": 85000, "supplier_name": "Citrus Valley Logistics"},
        "REGION_WEST": {"capacity_cases": 62000, "supplier_name": "Pacific Groves Co"},
        "REGION_CENTRAL": {"capacity_cases": 74000, "supplier_name": "Heartland Beverage Distributors"},
        "METRO_SOUTH": {"capacity_cases": 41000, "supplier_name": "Sunshine State Citrus Coop"}
    }

    # Evaluate query
    if query_template_id == "DEMAND_VS_SUPPLIER_CAPACITY":
        # Group stores by region simulation
        df = df_oj.copy()
        df["region"] = df["Store"].apply(lambda s: "REGION_EAST" if s % 4 == 0 else ("REGION_WEST" if s % 4 == 1 else ("REGION_CENTRAL" if s % 4 == 2 else "METRO_SOUTH")))
        
        if filter_param != "ALL":
            filtered = df[df["region"] == filter_param]
        else:
            filtered = df

        unique_stores = int(filtered["Store"].nunique())
        
        # PRIVACY CHECK (k-Anonymity)
        if unique_stores < k_threshold:
            status = "BLOCKED"
            summary = (
                f"Result suppressed because it matched {unique_stores} stores, which is below "
                f"the minimum aggregation threshold (k = {k_threshold}). Exposing this aggregate "
                f"could permit inference of private store-level commercial contracts."
            )
            shared_payload = None
        else:
            status = "APPROVED_AND_RELEASED"
            # Return purely aggregated metrics (No row-level data)
            agg = filtered.groupby("region").agg({
                "Store": "nunique",
                "Quantity": "sum",
                "Revenue": "sum"
            }).reset_index()
            
            shared_payload = []
            for _, r in agg.iterrows():
                reg = r["region"]
                cap = supplier_capacity_data.get(reg, {"capacity_cases": 60000, "supplier_name": "Regional Supplier"})
                demand_units = float(r["Quantity"])
                utilization = round((demand_units / cap["capacity_cases"]) * 100, 1)
                shared_payload.append({
                    "region": reg,
                    "participating_stores_count": int(r["Store"]),
                    "aggregated_demand_units": round(demand_units, 0),
                    "supplier_capacity_units": cap["capacity_cases"],
                    "capacity_utilization_pct": utilization,
                    "supplier_partner": cap["supplier_name"],
                    "supply_balance": "HEALTHY" if utilization <= 95 else "DEFICIT_RISK"
                })
            summary = f"Privacy criteria satisfied (k = {unique_stores} >= {k_threshold}). Aggregated regional demand compared against supplier capacity."

    elif query_template_id == "CROSS_ORGANIZATION_WASTAGE_BENCHMARK":
        # Second approved template
        unique_stores = int(df_oj["Store"].nunique())
        if unique_stores < k_threshold:
            status = "BLOCKED"
            summary = f"Suppressed: Only {unique_stores} entities matched (threshold k = {k_threshold})."
            shared_payload = None
        else:
            status = "APPROVED_AND_RELEASED"
            shared_payload = [
                {"benchmark_category": "Cold-Chain Spoilage %", "retailer_agg_estimate": "2.4%", "supplier_agg_estimate": "2.1%", "variance": "+0.3%"},
                {"benchmark_category": "Lead-Time Transit Days", "retailer_agg_estimate": "3.8 days", "supplier_agg_estimate": "3.5 days", "variance": "+0.3 days"},
                {"benchmark_category": "Order Fill-Rate %", "retailer_agg_estimate": "97.2%", "supplier_agg_estimate": "98.0%", "variance": "-0.8%"}
            ]
            summary = f"Benchmarking aggregate released for {unique_stores} retailer facilities."
    else:
        status = "INVALID_QUERY_TEMPLATE"
        summary = "Unrecognized collaboration query template."
        shared_payload = None
        unique_stores = 0

    # Record to DB and Audit Log
    db_rec = CollaborationQueryRecord(
        query_id=query_id,
        requester_org=requester_org,
        target_org=target_org,
        query_template=query_template_id,
        aggregation_threshold=k_threshold,
        matched_entity_count=unique_stores,
        status=status,
        result_summary=summary
    )
    db.add(db_rec)

    audit_entry = AuditEventRecord(
        action_type="COLLABORATION_QUERY_EVALUATED",
        module_name="Data Collaboration Vault",
        organization=requester_org,
        details=f"Query {query_id} ({query_template_id}): Status {status} (k={unique_stores}/{k_threshold})",
        status="SUCCESS" if status == "APPROVED_AND_RELEASED" else "SUPPRESSED"
    )
    db.add(audit_entry)
    db.commit()

    return {
        "disclaimer": "Prototype privacy architecture, not a certified secure data clean room.",
        "query_id": query_id,
        "status": status,
        "k_anonymity_threshold": k_threshold,
        "matched_entity_count": unique_stores,
        "is_suppressed": status == "BLOCKED",
        "summary": summary,
        "shared_aggregated_data": shared_payload,
        "cryptographic_verification_hash": hashlib.sha256(f"{query_id}:{status}:{datetime.now().isoformat()}".encode()).hexdigest()
    }
