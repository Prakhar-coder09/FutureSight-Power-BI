-- Future-Sight AI Enterprise Decision Cockpit & War Room Schema
-- Database: SQLite 3 / PostgreSQL Compatible DDL

-- 1. Historical & Simulated Sales Records (Canonical Microsoft OJ Schema)
CREATE TABLE IF NOT EXISTS sales_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_starting TIMESTAMP NOT NULL,
    store INTEGER NOT NULL,
    brand VARCHAR(64) NOT NULL,
    quantity REAL NOT NULL,
    advert INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL,
    revenue REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_store_brand_week ON sales_records (store, brand, week_starting);

-- 2. Dataset Metadata & Profiling
CREATE TABLE IF NOT EXISTS dataset_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_name VARCHAR(128) DEFAULT 'Microsoft OJ Sales Simulated',
    row_count INTEGER,
    store_count INTEGER,
    brand_count INTEGER,
    min_date TIMESTAMP,
    max_date TIMESTAMP,
    weeks_count INTEGER,
    missing_values_count INTEGER DEFAULT 0,
    duplicate_rows_count INTEGER DEFAULT 0,
    suspicious_values_count INTEGER DEFAULT 0,
    quality_score REAL DEFAULT 100.0,
    is_active BOOLEAN DEFAULT 1,
    source_type VARCHAR(128) DEFAULT 'Microsoft OJ Dataset / Simulated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Model Registry & Evaluation Metrics
CREATE TABLE IF NOT EXISTS model_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(128) NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    version VARCHAR(32) NOT NULL,
    target VARCHAR(32) DEFAULT 'Quantity',
    features_list TEXT,
    validation_period VARCHAR(64),
    test_period VARCHAR(64),
    mae REAL,
    rmse REAL,
    mape REAL,
    wmape REAL,
    r2 REAL,
    status VARCHAR(32) DEFAULT 'DEPLOYED',
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enterprise Audit Log Ledger
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(128) DEFAULT 'enterprise_analyst',
    organization VARCHAR(128) DEFAULT 'Org A (Retailer)',
    action_type VARCHAR(64) NOT NULL,
    module_name VARCHAR(64) NOT NULL,
    details TEXT,
    permission_checked VARCHAR(64) DEFAULT 'ANALYST_READ_WRITE',
    status VARCHAR(32) DEFAULT 'SUCCESS'
);

-- 5. Data Clean Room Collaboration Queries
CREATE TABLE IF NOT EXISTS collaboration_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id VARCHAR(64) UNIQUE NOT NULL,
    requester_org VARCHAR(128) NOT NULL,
    target_org VARCHAR(128) NOT NULL,
    query_template VARCHAR(128) NOT NULL,
    aggregation_threshold INTEGER DEFAULT 10,
    matched_entity_count INTEGER,
    status VARCHAR(32) DEFAULT 'APPROVED',
    result_summary TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. External Context Market Signals
CREATE TABLE IF NOT EXISTS market_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    current_value REAL,
    unit VARCHAR(32),
    change_pct_30d REAL,
    correlation_with_demand REAL,
    status VARCHAR(32) DEFAULT 'SIMULATED',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- -----------------------------------------------------------------------------
-- 7. AI BUSINESS WAR ROOM MODULE EXTENSIONS
-- -----------------------------------------------------------------------------

-- War Room Command Instances
CREATE TABLE IF NOT EXISTS war_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    war_room_id VARCHAR(64) UNIQUE NOT NULL DEFAULT 'WR-2026-OJ-089',
    title VARCHAR(256) NOT NULL DEFAULT 'Next Month Revenue Shortfall Risk',
    situation TEXT NOT NULL,
    severity VARCHAR(32) DEFAULT 'HIGH',
    status VARCHAR(64) DEFAULT 'Triggered',
    forecasted_revenue REAL DEFAULT 102450.0,
    target_revenue REAL DEFAULT 120000.0,
    gap_amount REAL DEFAULT 17550.0,
    gap_pct REAL DEFAULT -14.6,
    days_remaining INTEGER DEFAULT 23,
    owner VARCHAR(128) DEFAULT 'VP Commercial Ops & Supply Chain',
    deadline VARCHAR(128) DEFAULT 'End of Month (23 Days)',
    affected_areas VARCHAR(256) DEFAULT 'Sales, Inventory, Marketing, Procurement, Finance',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- War Room Timeline & Lifecycle Events
CREATE TABLE IF NOT EXISTS war_room_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(128) DEFAULT 'System',
    event_type VARCHAR(64) DEFAULT 'INFO',
    summary VARCHAR(256) NOT NULL,
    details TEXT,
    FOREIGN KEY (war_room_id) REFERENCES war_rooms (war_room_id)
);

-- Cross-Functional Action Tasks
CREATE TABLE IF NOT EXISTS war_room_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL DEFAULT 'WR-2026-OJ-089',
    title VARCHAR(256) NOT NULL,
    department VARCHAR(64) NOT NULL,
    owner VARCHAR(128) NOT NULL,
    priority VARCHAR(32) DEFAULT 'HIGH',
    status VARCHAR(32) DEFAULT 'In Progress',
    due_date VARCHAR(64) DEFAULT 'In 5 Days',
    expected_impact VARCHAR(256),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (war_room_id) REFERENCES war_rooms (war_room_id)
);

-- Permanent Executive Decision Ledger
CREATE TABLE IF NOT EXISTS war_room_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL DEFAULT 'WR-2026-OJ-089',
    title VARCHAR(256) NOT NULL,
    decision_text TEXT NOT NULL,
    decided_by VARCHAR(128) DEFAULT 'Chief Commercial Officer',
    approved_by VARCHAR(128) DEFAULT 'CFO & Executive Committee',
    justification TEXT,
    expected_outcome TEXT,
    revenue_impact REAL DEFAULT 0.0,
    margin_impact REAL DEFAULT 0.0,
    risk_level VARCHAR(32) DEFAULT 'LOW',
    status VARCHAR(32) DEFAULT 'Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (war_room_id) REFERENCES war_rooms (war_room_id)
);

-- Option E Scenarios Evaluated
CREATE TABLE IF NOT EXISTS war_room_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL,
    scenario_name VARCHAR(128) NOT NULL,
    price_delta_pct REAL DEFAULT 0.0,
    advert_multiplier REAL DEFAULT 1.0,
    supply_constraint_pct REAL DEFAULT 0.0,
    target_brand VARCHAR(64) DEFAULT 'ALL',
    revenue_delta REAL DEFAULT 0.0,
    margin_delta REAL DEFAULT 0.0,
    coordinator_verdict TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Copilot Chat Messages & Inquiries
CREATE TABLE IF NOT EXISTS war_room_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'user', 'assistant'
    query TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Algorithmic Evidence Citations
CREATE TABLE IF NOT EXISTS war_room_evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id VARCHAR(64) UNIQUE NOT NULL,
    war_room_id VARCHAR(64) NOT NULL,
    metric_name VARCHAR(128) NOT NULL,
    calculation TEXT NOT NULL,
    citation_data TEXT,
    confidence_score INTEGER DEFAULT 90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurable Target Layer
CREATE TABLE IF NOT EXISTS war_room_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_name VARCHAR(64) DEFAULT 'Next Month',
    target_revenue REAL DEFAULT 120000.0,
    currency VARCHAR(16) DEFAULT 'USD',
    target_inr_crores REAL DEFAULT 12.0,
    forecast_inr_crores REAL DEFAULT 10.2,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
