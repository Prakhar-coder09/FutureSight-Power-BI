# BusinessSight AI
> **"See Next Month. Simulate What-If. Act Before Impact."**

BusinessSight AI is a predictive business intelligence and decision-support platform designed to help retail and commercial enterprises proactively forecast sales, identify operational demand risks, simulate what-if commercial scenarios with full ripple-effect impact modeling, optimize EBITDA proxies, collaborate securely via differential privacy clean rooms, and govern ML pipelines with data leakage protection and drift monitoring.

Built on Microsoft's canonical **OJ Sales Simulated** dataset (121 weeks, Store × Brand level, Tropicana, Minute Maid, Dominicks).

---

## 🌟 Platform Capabilities & Architecture

### 1. Executive Control Room
- **Forward Horizon Forecasts**: Seamless transition from historical actuals to forward forecasts with calibrated 80% and 95% residual prediction intervals.
- **Top Enterprise KPIs**: Current Revenue, Forecast Revenue, Expected Growth %, Forecast Accuracy, High-Risk Stores Count, Revenue-at-Risk, and Weekly Opportunity.
- **Accuracy Card with Honest Accuracy Note**: MAE, RMSE, MAPE, WMAPE, and R² evaluated strictly on unseen historical periods.

### 2. Forecast Studio
- **Granular Store × Brand × Week Time Series**: Multi-brand, store-level forecasts.
- **Dynamic 1–12 Week Horizon**: Compares HistGradientBoosting ML with Seasonal Naive (4-week lag) and Naive baselines.
- **Causal Feature Engineering**: Lag features ($T-1 \dots T-12$), rolling statistics (strictly past-only shifted by 1 to eliminate leakage).

### 3. Demand & Revenue Risk Radar
- **Operational Risk Modeling**: Explains why store/brand demand risk is modeled instead of customer churn (as OJ data lacks individual customer labels).
- **6 Risk Dimensions**: Sales decline trajectory, demand volatility ($CV$), revenue-at-risk, forecast deviation, price sensitivity, and promo dependency.
- **Risk Tiers & Explainable Reasons**: Low (0–30), Medium (31–60), High (61–80), Critical (81–100) with diagnostic tags.

### 4. What-If Scenario Lab & Business Chaos Simulator
- **Interactive Levers**: Price (-15% to +20%), Circular Advert (0x to 1.5x), Macro Demand Shock (-30% to +30%), Supply/DC Constraint (-30% to 0%).
- **Base Case vs Scenario Delta**: Instant re-calculation of revenue, unit volume, affected stores, upside/downside, confidence.
- **Connected Ripple Effect Flow Map**:
  $$\text{Input Decision} \longrightarrow \text{Demand Shock} \longrightarrow \text{Store Distribution} \longrightarrow \text{Revenue Outcome} \longrightarrow \text{EBITDA Proxy}$$

### 5. AI Business War Room Command Center
- **Mission**: Transition from passive BI forecasting to structured operational execution:
  $$\text{Forecast} \longrightarrow \text{Detect Target Gap} \longrightarrow \text{Open War Room} \longrightarrow \text{Impact Map} \longrightarrow \text{AI Copilot} \longrightarrow \text{Simulate Decisions} \longrightarrow \text{Assign Tasks} \longrightarrow \text{Postmortem}$$
- **War Room Entry Alert**: High-priority alert banner in the Executive Control Room triggered when forward forecast falls below monthly target (e.g. Expected Gap: -$17.5k / -14.6%, 23 days remaining).
- **Situation Board**: Target vs forecast comparison, countdown timer, affected departments (Sales, Operations, Marketing, Procurement, Finance), and automated causal telemetry explanation grounded on actual OJ data.
- **Interactive Situation & Impact Map**: Interactive node dependency graph connecting:
  $$\text{Target} \longrightarrow \text{Revenue Gap} \longrightarrow \text{Brand Drops (Dominicks/Minute Maid)} \longrightarrow \text{Store Clusters} \longrightarrow \text{Supply Constraints} \longrightarrow \text{Action Teams}$$
- **Evidence-Grounded AI Copilot**: Context-aware Copilot strictly grounded on store/brand numbers with clickable **"SHOW EVIDENCE"** drawers displaying mathematical formula calculations and confidence scores.
- **Option E Multi-Agent Decision Simulator**: Three-column workflow directly matching executive specifications:
  - **Inputs**: Price slider, circular advert toggle, supply shock, brand filters.
  - **Four Domain AI Agents**: CFO Agent (EBITDA), Operations Agent (Logistics & Buffer), Sales Agent (Brand Velocity), Risk Agent (Downside VaR) surrounding the AI Coordinator.
  - **Consolidated Recommendation**: Current Plan vs Simulated Plan comparison with instant Keep/Discard and log sign-off.
- **Cross-Functional Team Command Board**: Task assignment across Operations, Marketing, Sales, Procurement, and Finance with live status tracking.
- **Permanent Decision Log**: Immutable ledger of executive decisions, justifications, and expected outcomes.
- **Postmortem & Retrospective Review**: Compares predicted impact vs actuals, extracting key operational learnings and executive sign-offs.

### 6. EBITDA Value Creation Cockpit
- **Configurable Assumptions**: Gross margin %, SG&A operating cost %, ad circular spend, freight cost/unit, cold-chain spoilage/wastage %.
- **Enterprise KPIs**: Revenue, Estimated Gross Profit, Operating Cost, EBITDA Proxy, EBITDA Margin %, Revenue-at-Risk, Potential Opportunity.
- **Clear Governance Disclosure**: Labeled as user-configured proxy, not reported GAAP/IFRS financial statements.

### 7. Store & Brand Intelligence Drilldown
- Interactive selection of Store and Brand with empirical elasticity estimation ($\eta$), price vs volume response curves, and promotional sensitivity.

### 8. Secure Data Collaboration Vault
- **Data Clean Room Prototype**: Org A (Retailer Private Data) & Org B (Supplier Private Data).
- **$k$-Anonymity Rule ($k = 10$)**: Blocks queries matching fewer than 10 entities with cryptographic query audit hashing.

### 9. External Market Signals Adapter
- Ingests and simulates context signals: Orange Juice Futures (FCOJ), CPI Food Inflation, Consumer Sentiment Index, Florida Citrus Belt Weather Disruption, Consumer Staples ETF.
- Status badges: LIVE, STALE, SIMULATED.

### 10. Model Performance, Backtesting & Data Leakage Protection
- **Walk-Forward Chronological Split**: Train (Weeks 1–80), Validation (Weeks 81–100), Test (Weeks 101–121).
- **Automated Data Leakage Checks**: Future target, rolling causality, chronological split, and aggregate check.
- **Model Registry & Retrain**: Version management and automated retraining endpoint.

### 11. Data Quality Profiler & Drift Monitoring
- **Data Quality Score (0–100%)**: Profiler checking row count, store count, brand count, date continuity (7-day cadence), duplicates, and suspicious records.
- **Distribution Drift**: Population Stability Index (PSI) and Wasserstein distance on Price, Advert, and Quantity.
- **CSV Ingestion**: Upload custom datasets with real-time schema validation.

### 12. Enterprise Audit Log
- Immutable compliance ledger logging every scenario, forecast, clean room query, and model execution.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Launch Backend (FastAPI)
```bash
cd backend
python run.py
```
*Backend runs on `http://localhost:8000`. Interactive Swagger API documentation at `http://localhost:8000/docs`.*

### 2. Launch Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000` or `http://localhost:5173`.*

### 3. Run Backend Automated Test Suite
```bash
cd backend
python -m unittest discover -s tests -p test_*.py
```

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend**: FastAPI, Uvicorn, SQLite (WAL mode), SQLAlchemy, Pydantic v2
- **Machine Learning**: pandas, numpy, scikit-learn (HistGradientBoostingRegressor), scipy
