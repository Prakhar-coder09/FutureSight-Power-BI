import os
from pathlib import Path
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.config import settings
from app.db.models import SalesRecord, DatasetMetadata, AuditEventRecord
from app.data.oj_generator import generate_canonical_oj_dataset
from app.data.validation import validate_and_profile_dataset

def load_or_initialize_dataset(db: Session, force_regenerate: bool = False) -> pd.DataFrame:
    """
    Checks if active dataset exists in DB or CSV. If not, generates the
    canonical Microsoft OJ Sales Simulated dataset, saves to CSV and DB.
    """
    csv_path = Path(settings.DEFAULT_DATASET_CSV)
    
    if not csv_path.exists() or force_regenerate:
        df = generate_canonical_oj_dataset(
            num_stores=settings.NUM_STORES_SAMPLE,
            total_weeks=settings.TOTAL_WEEKS
        )
        df.to_csv(csv_path, index=False)
        
        # Profile dataset
        profile = validate_and_profile_dataset(df)
        
        # Sync to DB
        db.query(DatasetMetadata).delete()
        meta = DatasetMetadata(
            dataset_name="Microsoft OJ Sales Simulated (Canonical)",
            row_count=profile["row_count"],
            store_count=profile["store_count"],
            brand_count=profile["brand_count"],
            min_date=pd.to_datetime(profile["min_date"]),
            max_date=pd.to_datetime(profile["max_date"]),
            weeks_count=profile["weeks_count"],
            missing_values_count=profile["missing_values_count"],
            duplicate_rows_count=profile["duplicate_rows_count"],
            suspicious_values_count=profile["suspicious_values_count"],
            quality_score=profile["quality_score"],
            is_active=True,
            source_type="Microsoft Azure ML OJ Simulated"
        )
        db.add(meta)
        
        # Audit event
        audit = AuditEventRecord(
            action_type="DATASET_INITIALIZED",
            module_name="Data Quality & Ingestion",
            details=f"Initialized {profile['row_count']} rows across {profile['store_count']} stores and {profile['weeks_count']} weeks.",
            status="SUCCESS"
        )
        db.add(audit)
        db.commit()
        return df
    else:
        df = pd.read_csv(csv_path)
        df["WeekStarting"] = pd.to_datetime(df["WeekStarting"])
        return df

def ingest_custom_csv(file_bytes: bytes, filename: str, db: Session) -> dict:
    """
    Ingests a user-uploaded CSV file, validates schema, updates active dataset.
    """
    import io
    df = pd.read_csv(io.BytesIO(file_bytes))
    profile = validate_and_profile_dataset(df)
    
    if not profile["is_valid"]:
        raise ValueError(f"Dataset validation failed. Quality Score: {profile['quality_score']}. Errors: {profile['issues']}")

    # Save to storage
    dest_path = Path(settings.STORAGE_PATH) / f"custom_{int(datetime.now().timestamp())}_{filename}"
    df.to_csv(dest_path, index=False)
    
    # Save as default active
    df.to_csv(settings.DEFAULT_DATASET_CSV, index=False)
    
    # Update DB metadata
    db.query(DatasetMetadata).update({"is_active": False})
    meta = DatasetMetadata(
        dataset_name=f"Custom Upload: {filename}",
        row_count=profile["row_count"],
        store_count=profile["store_count"],
        brand_count=profile["brand_count"],
        min_date=pd.to_datetime(profile["min_date"]),
        max_date=pd.to_datetime(profile["max_date"]),
        weeks_count=profile["weeks_count"],
        missing_values_count=profile["missing_values_count"],
        duplicate_rows_count=profile["duplicate_rows_count"],
        suspicious_values_count=profile["suspicious_values_count"],
        quality_score=profile["quality_score"],
        is_active=True,
        source_type="Local CSV Ingestion"
    )
    db.add(meta)
    
    audit = AuditEventRecord(
        action_type="CSV_INGESTION",
        module_name="Data Governance",
        details=f"Uploaded {filename}: {profile['row_count']} records, Quality Score {profile['quality_score']}%",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    
    return profile
