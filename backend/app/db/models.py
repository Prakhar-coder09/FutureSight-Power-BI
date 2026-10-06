from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Index
from datetime import datetime, timezone
from app.db.database import Base

class SalesRecord(Base):
    __tablename__ = "sales_records"

    id = Column(Integer, primary_key=True, index=True)
    week_starting = Column(DateTime, nullable=False, index=True)
    store = Column(Integer, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    advert = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    revenue = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_store_brand_week", "store", "brand", "week_starting"),
    )

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String, default="Microsoft OJ Sales Simulated")
    row_count = Column(Integer)
    store_count = Column(Integer)
    brand_count = Column(Integer)
    min_date = Column(DateTime)
    max_date = Column(DateTime)
    weeks_count = Column(Integer)
    missing_values_count = Column(Integer, default=0)
    duplicate_rows_count = Column(Integer, default=0)
    suspicious_values_count = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    source_type = Column(String, default="Microsoft OJ Dataset / Simulated")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ModelRegistryRecord(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # 'HistGradientBoosting', 'Baseline Naive', 'XGBoost'
    version = Column(String, nullable=False)
    target = Column(String, default="Quantity")
    features_list = Column(Text)
    validation_period = Column(String)
    test_period = Column(String)
    mae = Column(Float)
    rmse = Column(Float)
    mape = Column(Float)
    wmape = Column(Float)
    r2 = Column(Float)
    status = Column(String, default="DEPLOYED")  # DEPLOYED, CANDIDATE, ARCHIVED
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditEventRecord(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    username = Column(String, default="enterprise_analyst")
    organization = Column(String, default="Org A (Retailer)")
    action_type = Column(String, nullable=False)
    module_name = Column(String, nullable=False)
    details = Column(Text)
    permission_checked = Column(String, default="ANALYST_READ_WRITE")
    status = Column(String, default="SUCCESS")

class CollaborationQueryRecord(Base):
    __tablename__ = "collaboration_queries"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(String, unique=True, index=True)
    requester_org = Column(String, nullable=False)
    target_org = Column(String, nullable=False)
    query_template = Column(String, nullable=False)
    aggregation_threshold = Column(Integer, default=10)
    matched_entity_count = Column(Integer)
    status = Column(String)  # 'APPROVED', 'BLOCKED', 'EXECUTED'
    result_summary = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MarketSignalRecord(Base):
    __tablename__ = "market_signals"

    id = Column(Integer, primary_key=True, index=True)
    signal_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    current_value = Column(Float)
    unit = Column(String)
    change_pct_30d = Column(Float)
    correlation_with_demand = Column(Float)
    status = Column(String, default="SIMULATED")  # LIVE, STALE, SIMULATED
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text)

class WarRoomRecord(Base):
    __tablename__ = "war_room_records"

    id = Column(Integer, primary_key=True, index=True)
    war_room_id = Column(String, unique=True, index=True, default="WR-2026-OJ-089")
    title = Column(String, nullable=False, default="Next Month Revenue Shortfall Risk")
    situation = Column(Text, nullable=False)
    severity = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="Triggered")  # Triggered, Investigating, Decision Pending, Approved, Executing, Monitoring, Resolved, Closed
    forecasted_revenue = Column(Float, default=102450.0)
    target_revenue = Column(Float, default=120000.0)
    gap_amount = Column(Float, default=17550.0)
    gap_pct = Column(Float, default=-14.6)
    days_remaining = Column(Integer, default=23)
    owner = Column(String, default="VP Commercial Ops & Supply Chain")
    deadline = Column(String, default="End of Month (23 Days)")
    affected_areas = Column(String, default="Sales, Inventory, Marketing, Procurement, Finance")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WarRoomTaskRecord(Base):
    __tablename__ = "war_room_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True)
    war_room_id = Column(String, index=True, default="WR-2026-OJ-089")
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)  # Operations, Sales, Marketing, Procurement, Finance
    owner = Column(String, nullable=False)
    priority = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String, default="In Progress")  # Pending, In Progress, Completed
    due_date = Column(String, default="In 5 Days")
    expected_impact = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WarRoomDecisionRecord(Base):
    __tablename__ = "war_room_decisions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(String, unique=True, index=True)
    war_room_id = Column(String, index=True, default="WR-2026-OJ-089")
    title = Column(String, nullable=False)
    decision_text = Column(Text, nullable=False)
    decided_by = Column(String, default="Chief Commercial Officer")
    approved_by = Column(String, default="CFO & Executive Committee")
    justification = Column(Text)
    expected_outcome = Column(Text)
    revenue_impact = Column(Float, default=0.0)
    margin_impact = Column(Float, default=0.0)
    risk_level = Column(String, default="MEDIUM")
    status = Column(String, default="Approved")  # Proposed, Approved, Executing, Closed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WarRoomEventRecord(Base):
    __tablename__ = "war_room_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    war_room_id = Column(String, index=True, default="WR-2026-OJ-089")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    actor = Column(String, default="System")
    event_type = Column(String, default="INFO")  # STATUS_CHANGE, TASK_ASSIGNED, DECISION_APPROVED, SIMULATION_RUN, COPILOT_QUERY
    summary = Column(String, nullable=False)
    details = Column(Text)

class WarRoomTargetConfig(Base):
    __tablename__ = "war_room_targets"

    id = Column(Integer, primary_key=True, index=True)
    period_name = Column(String, default="Next Month")
    target_revenue = Column(Float, default=120000.0)
    currency = Column(String, default="USD")
    target_inr_crores = Column(Float, default=12.0)
    forecast_inr_crores = Column(Float, default=10.2)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
