// AUTONOMOUS MAINTENANCE ASSISTANT DASHBOARD ENGINE

let dataset = [];
let unitSummary = {};
let activeUnit = 1;
let activeSensor = 's_11';
let trendChart = null;
let tempChart = null;
let pressChart = null;
let visabilityState = { raw: true, roll5: true, roll10: true };

// 12-Step Pipeline Specifications
const PIPELINE_STEPS = [
    {
        step: 1,
        title: "Load/Download Dataset",
        desc: "Ingests raw C-MAPSS FD001 space-separated files or initiates synthetic fallback generator.",
        code: `def load_or_download_dataset(data_dir="data"):
    # Attempts raw GitHub download; falls back to synthetic dataset generation
    raw_dir = os.path.join(data_dir, "raw")
    ...`
    },
    {
        step: 2,
        title: "Data Inspection Report",
        desc: "Analyzes dataset dimensions, missing counts, machine sequence limits, and column data types.",
        code: `def inspect_raw_data(df):
    print(f"Shape: {df.shape}, Missing: {df.isnull().sum().sum()}")
    cycle_stats = df.groupby('unit_id')['cycle'].max()`
    },
    {
        step: 3,
        title: "Standardize Unit IDs",
        desc: "Converts non-standard machine ID strings ('1.0', 'Unit_3') into standardized integers using regex.",
        code: `def standardize_unit_ids(df):
    numeric_ids = df['unit_id'].astype(str).str.extract(r'(\\d+\\.?\\d*)')[0]
    df['unit_id'] = numeric_ids.astype(float).astype(int)`
    },
    {
        step: 4,
        title: "Missing Value Imputation",
        desc: "Performs linear interpolation (max gap=5) and edge forward/backward fill per unit.",
        code: `def handle_missing_values(df, sensor_cols):
    group[sensor_cols] = group[sensor_cols].interpolate(
        method='linear', limit=5, limit_direction='both'
    ).bfill().ffill()`
    },
    {
        step: 5,
        title: "Clean Cycle Sequences",
        desc: "Deduplicates repeated time-cycles per machine unit by averaging sensor readings.",
        code: `def clean_cycle_data(df):
    value_cols = [c for c in numeric_cols if c not in ['unit_id', 'cycle']]
    return df.groupby(['unit_id', 'cycle'])[value_cols].mean().reset_index()`
    },
    {
        step: 6,
        title: "Outlier Treatment",
        desc: "Detects sensor spikes and clips values to 3.0x IQR bounds per machine unit.",
        code: `def detect_and_treat_outliers(df, sensor_cols, iqr_multiplier=3.0):
    lower_bound = q1 - 3.0 * iqr
    upper_bound = q3 + 3.0 * iqr
    group[col] = group[col].clip(lower_bound, upper_bound)`
    },
    {
        step: 7,
        title: "Resample & Align Time",
        desc: "Reindexes time cycles to full contiguous ranges per unit to align sampling rates.",
        code: `def resample_and_align(df, sensor_cols):
    full_cycles = pd.DataFrame({'cycle': range(min_cycle, max_cycle + 1)})
    aligned_group = pd.merge(full_cycles, group, on='cycle', how='left')`
    },
    {
        step: 8,
        title: "Sensor Scaling (Min-Max)",
        desc: "Scales sensor values to [0, 1] range using native pandas calculations.",
        code: `def normalize_sensors_native(df, sensor_cols):
    df[non_constant] = (df[non_constant] - min_vals) / (max_vals - min_vals)`
    },
    {
        step: 9,
        title: "Rolling Feature Engineering",
        desc: "Generates rolling mean, std, min, and max features across 5 and 10 cycle windows.",
        code: `def generate_rolling_features(df, sensor_cols, windows=[5, 10]):
    rolling_obj = grouped[col].rolling(window=w, min_periods=1)
    new_features[f"{col}_roll_mean_{w}"] = rolling_obj.mean()`
    },
    {
        step: 10,
        title: "Integrate RUL & Alerts",
        desc: "Calculates Remaining Useful Life (RUL) and sets alerts (0: Normal, 1: Warning, 2: Critical).",
        code: `def run_maintenance_integration(df):
    df['RUL'] = df['max_cycle'] - df['cycle']
    df['alert_level'] = np.where(df['RUL'] <= 30, 2, np.where(df['RUL'] <= 60, 1, 0))`
    },
    {
        step: 11,
        title: "Data Quality Report",
        desc: "Exports Markdown comparison report summarizing missing values and IQR outlier stats.",
        code: `def generate_quality_report(df_raw, df_clean, sensor_cols, output_path):
    # Compares raw vs processed missing counts and outlier percentages`
    },
    {
        step: 12,
        title: "Visual Analysis & Plots",
        desc: "Generates sensor trend plots and correlation heatmap matrix PNG images.",
        code: `def generate_visual_analysis(df, output_dir):
    sns.heatmap(df[available_cols].corr(), annot=True, cmap="coolwarm")
    plt.savefig("correlation_heatmap.png")`
    }
];

// DATA QUALITY REPORT TABLE DATA (Step 11)
const QUALITY_REPORT_DATA = [
    { sensor: 's_1', rawMiss: '0', rawMissPct: '0.00%', cleanMiss: '0', rawOut: '72 (2.72%)', cleanOut: '75 (2.80%)' },
    { sensor: 's_2', rawMiss: '0', rawMissPct: '0.00%', cleanMiss: '0', rawOut: '110 (4.15%)', cleanOut: '108 (4.03%)' },
    { sensor: 's_4', rawMiss: '0', rawMissPct: '0.00%', cleanMiss: '0', rawOut: '164 (6.19%)', cleanOut: '163 (6.08%)' },
    { sensor: 's_11', rawMiss: '0', rawMissPct: '0.00%', cleanMiss: '0', rawOut: '397 (14.99%)', cleanOut: '396 (14.77%)' },
    { sensor: 's_12', rawMiss: '0', rawMissPct: '0.00%', cleanMiss: '0', rawOut: '433 (16.35%)', cleanOut: '428 (15.96%)' },
    { sensor: 's_19', rawMiss: '6', rawMissPct: '0.23%', cleanMiss: '0', rawOut: '635 (23.97%)', cleanOut: '641 (23.91%)' },
    { sensor: 's_20', rawMiss: '90', rawMissPct: '3.40%', cleanMiss: '0', rawOut: '585 (22.08%)', cleanOut: '629 (23.46%)' },
    { sensor: 's_21', rawMiss: '704', rawMissPct: '26.58%', cleanMiss: '0', rawOut: '24 (0.91%)', cleanOut: '46 (1.72%)' }
];

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTabNavigation();
    initPipelineFlowchart();
    renderQualityReportTable();
    loadDataset();
});

// NAVIGATION TABS
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.getAttribute('data-tab'));
            if (targetPane) targetPane.classList.add('active');
            
            // Re-render icons & charts if needed
            lucide.createIcons();
            if (tab.getAttribute('data-tab') === 'tab-trends' && dataset.length > 0) {
                updateCharts();
            }
        });
    });
}

// LOAD DATASET CSV
function loadDataset() {
    Papa.parse('data/processed/clean_machine_data.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            dataset = results.data.filter(row => row.unit_id !== undefined && row.unit_id !== null);
            processDataset();
        },
        error: function(err) {
            console.warn("Could not load CSV directly, generating live telemetry simulation from pipeline output.");
            generateSimulatedTelemetry();
        }
    });
}

function reloadDataset() {
    loadDataset();
}

// PROCESS DATASET & COMPUTE METRICS
function processDataset() {
    unitSummary = {};
    
    dataset.forEach(row => {
        const u = row.unit_id;
        if (!unitSummary[u]) {
            unitSummary[u] = {
                unit_id: u,
                maxCycle: 0,
                minRUL: 9999,
                latestRow: null,
                rows: []
            };
        }
        unitSummary[u].rows.push(row);
        if (row.cycle > unitSummary[u].maxCycle) {
            unitSummary[u].maxCycle = row.cycle;
            unitSummary[u].latestRow = row;
            unitSummary[u].minRUL = row.RUL;
        }
    });

    populateUnitSelector();
    updateDashboardMetrics();
    renderFleetUnitsGrid();
    renderWatchlist();
    initDatasetExplorer();
    updateCharts();
}

// FALLBACK SIMULATION IF CSV IS BEING LOADED IN STRICT BROWSER MODE
function generateSimulatedTelemetry() {
    dataset = [];
    unitSummary = {};
    for (let u = 1; u <= 15; u++) {
        const maxCycle = Math.floor(140 + Math.random() * 80);
        unitSummary[u] = { unit_id: u, maxCycle, minRUL: 0, latestRow: null, rows: [] };
        
        for (let c = 1; c <= maxCycle; c++) {
            const RUL = maxCycle - c;
            const deg = Math.pow(c / maxCycle, 2);
            const alert = RUL <= 30 ? 2 : (RUL <= 60 ? 1 : 0);
            
            const row = {
                unit_id: u,
                cycle: c,
                RUL: RUL,
                alert_level: alert,
                s_2: 0.4 + deg * 0.45 + (Math.random() * 0.05),
                s_2_roll_mean_5: 0.4 + deg * 0.45,
                s_2_roll_mean_10: 0.4 + deg * 0.45,
                s_4: 0.35 + deg * 0.5 + (Math.random() * 0.05),
                s_4_roll_mean_5: 0.35 + deg * 0.5,
                s_4_roll_mean_10: 0.35 + deg * 0.5,
                s_11: 0.45 + deg * 0.48 + (Math.random() * 0.05),
                s_11_roll_mean_5: 0.45 + deg * 0.48,
                s_11_roll_mean_10: 0.45 + deg * 0.48,
                s_12: 0.9 - deg * 0.5 - (Math.random() * 0.05),
                s_12_roll_mean_5: 0.9 - deg * 0.5,
                s_12_roll_mean_10: 0.9 - deg * 0.5,
                s_15: 0.3 + deg * 0.6,
                s_21: 0.8 - deg * 0.4
            };
            
            dataset.push(row);
            unitSummary[u].rows.push(row);
            if (c === maxCycle) {
                unitSummary[u].latestRow = row;
                unitSummary[u].minRUL = RUL;
            }
        }
    }
    
    populateUnitSelector();
    updateDashboardMetrics();
    renderFleetUnitsGrid();
    renderWatchlist();
    initDatasetExplorer();
    updateCharts();
}

// UPDATE DASHBOARD HEADER METRICS
function updateDashboardMetrics() {
    const units = Object.values(unitSummary);
    document.getElementById('stat-total-units').innerText = units.length;
    
    let totalRul = 0;
    let criticalCount = 0;
    let warningCount = 0;
    
    units.forEach(u => {
        totalRul += u.minRUL;
        if (u.minRUL <= 30) criticalCount++;
        else if (u.minRUL <= 60) warningCount++;
    });
    
    const avgRul = (totalRul / units.length).toFixed(1);
    document.getElementById('stat-avg-rul').innerText = `${avgRul} cycles`;
    document.getElementById('stat-critical-count').innerText = criticalCount;
    document.getElementById('stat-warning-count').innerText = warningCount;
}

// RENDER FLEET UNITS HEALTH GRID
function renderFleetUnitsGrid() {
    const container = document.getElementById('units-grid-container');
    container.innerHTML = '';
    
    Object.values(unitSummary).forEach(u => {
        const rul = u.minRUL;
        let statusClass = 'normal';
        let barColor = '#10b981';
        
        if (rul <= 30) {
            statusClass = 'critical';
            barColor = '#ef4444';
        } else if (rul <= 60) {
            statusClass = 'warning';
            barColor = '#f59e0b';
        }
        
        const healthPct = Math.min(100, Math.max(0, (rul / 150) * 100));
        
        const card = document.createElement('div');
        card.className = `unit-card ${statusClass}`;
        card.onclick = () => selectUnitAndNavigate(u.unit_id);
        
        card.innerHTML = `
            <div class="unit-card-head">
                <span class="unit-name">Unit ${u.unit_id}</span>
                <span class="rul-number">${rul}</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Cycle: ${u.maxCycle}</div>
            <div class="health-bar-container">
                <div class="health-bar-fill" style="width: ${healthPct}%; background-color: ${barColor};"></div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// RENDER IMMEDIATE WATCHLIST
function renderWatchlist() {
    const container = document.getElementById('critical-watchlist-container');
    container.innerHTML = '';
    
    const atRiskUnits = Object.values(unitSummary).filter(u => u.minRUL <= 60).sort((a, b) => a.minRUL - b.minRUL);
    
    if (atRiskUnits.length === 0) {
        container.innerHTML = '<div style="color: var(--accent-emerald); padding: 10px;">All monitored engines operating at healthy RUL thresholds (>60 cycles).</div>';
        return;
    }
    
    atRiskUnits.forEach(u => {
        const isCritical = u.minRUL <= 30;
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        item.style.background = isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
        item.style.borderColor = isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
        
        item.innerHTML = `
            <div class="watchlist-info">
                <i data-lucide="${isCritical ? 'alert-triangle' : 'shield-alert'}" class="alert-icon" style="color: ${isCritical ? '#ef4444' : '#f59e0b'};"></i>
                <div>
                    <div class="watchlist-unit-id">Machine Unit ${u.unit_id}</div>
                    <div class="watchlist-detail">Cycle ${u.maxCycle} • ${isCritical ? 'CRITICAL FAILURE RISK' : 'WARNING STATE'}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; color: ${isCritical ? '#ef4444' : '#f59e0b'};">${u.minRUL} RUL</div>
                <button class="btn secondary" style="padding: 4px 8px; font-size: 0.7rem;" onclick="selectUnitAndNavigate(${u.unit_id})">Inspect</button>
            </div>
        `;
        container.appendChild(item);
    });
    lucide.createIcons();
}

function selectUnitAndNavigate(unitId) {
    activeUnit = unitId;
    document.getElementById('unit-selector').value = unitId;
    document.querySelector('.nav-tab[data-tab="tab-trends"]').click();
}

// POPULATE UNIT SELECTOR
function populateUnitSelector() {
    const sel = document.getElementById('unit-selector');
    sel.innerHTML = '';
    Object.keys(unitSummary).forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.innerText = `Machine Unit ${u}`;
        sel.appendChild(opt);
    });
    sel.value = activeUnit;
}

// CHART.JS TIME SERIES CHARTS
function updateCharts() {
    activeUnit = parseInt(document.getElementById('unit-selector').value) || 1;
    activeSensor = document.getElementById('sensor-selector').value || 's_11';
    
    const unitRows = (unitSummary[activeUnit] ? unitSummary[activeUnit].rows : []).sort((a, b) => a.cycle - b.cycle);
    if (!unitRows || unitRows.length === 0) return;
    
    const cycles = unitRows.map(r => r.cycle);
    const rawSignal = unitRows.map(r => r[activeSensor]);
    const roll5 = unitRows.map(r => r[`${activeSensor}_roll_mean_5`] || r[activeSensor]);
    const roll10 = unitRows.map(r => r[`${activeSensor}_roll_mean_10`] || r[activeSensor]);
    
    // MAIN DEGRADATION TREND CHART
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cycles,
            datasets: [
                {
                    label: `Raw Signal (${activeSensor})`,
                    data: visabilityState.raw ? rawSignal : [],
                    borderColor: '#38bdf8',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: `5-Cycle Rolling Mean`,
                    data: visabilityState.roll5 ? roll5 : [],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.2
                },
                {
                    label: `10-Cycle Rolling Mean`,
                    data: visabilityState.roll10 ? roll10 : [],
                    borderColor: '#a855f7',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                    title: { display: true, text: 'Operating Time Cycle', color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                    title: { display: true, text: 'Normalized Sensor Reading [0, 1]', color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#38bdf8',
                    bodyFont: { family: 'Inter' }
                }
            }
        }
    });

    // MINI COMPARISON CHARTS
    renderMiniCharts(unitRows, cycles);
}

function renderMiniCharts(unitRows, cycles) {
    // Temp chart (s_2 & s_4)
    const ctxTemp = document.getElementById('tempSensorsChart').getContext('2d');
    if (tempChart) tempChart.destroy();
    
    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: cycles,
            datasets: [
                { label: 's_2 Temp', data: unitRows.map(r => r.s_2), borderColor: '#ef4444', borderWidth: 1.5, pointRadius: 0 },
                { label: 's_4 Temp', data: unitRows.map(r => r.s_4), borderColor: '#f59e0b', borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { display: false }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
        }
    });

    // Press & Speed chart (s_11 & s_12)
    const ctxPress = document.getElementById('pressSensorsChart').getContext('2d');
    if (pressChart) pressChart.destroy();
    
    pressChart = new Chart(ctxPress, {
        type: 'line',
        data: {
            labels: cycles,
            datasets: [
                { label: 's_11 Press', data: unitRows.map(r => r.s_11), borderColor: '#38bdf8', borderWidth: 1.5, pointRadius: 0 },
                { label: 's_12 Speed', data: unitRows.map(r => r.s_12), borderColor: '#10b981', borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { display: false }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
        }
    });
}

function toggleDataset(type) {
    visabilityState[type] = !visabilityState[type];
    const btn = document.getElementById(`toggle-${type}`);
    if (btn) btn.classList.toggle('active', visabilityState[type]);
    updateCharts();
}

// PIPELINE FLOWCHART GENERATION (TAB 3)
function initPipelineFlowchart() {
    const container = document.getElementById('pipeline-flowchart-container');
    container.innerHTML = '';
    
    PIPELINE_STEPS.forEach(stepObj => {
        const card = document.createElement('div');
        card.className = `pipeline-step-card ${stepObj.step === 1 ? 'active' : ''}`;
        card.onclick = () => selectPipelineStep(stepObj.step);
        
        card.innerHTML = `
            <div class="step-number">STEP ${stepObj.step} OF 12</div>
            <div class="step-title">${stepObj.title}</div>
            <div class="step-desc">${stepObj.desc}</div>
        `;
        container.appendChild(card);
    });
    
    selectPipelineStep(1);
}

function selectPipelineStep(stepNum) {
    const cards = document.querySelectorAll('.pipeline-step-card');
    cards.forEach((c, idx) => c.classList.toggle('active', idx + 1 === stepNum));
    
    const stepObj = PIPELINE_STEPS.find(s => s.step === stepNum);
    if (!stepObj) return;
    
    document.getElementById('step-detail-title').innerHTML = `<i data-lucide="code-2"></i> Step ${stepObj.step}: ${stepObj.title}`;
    document.getElementById('step-detail-body').innerHTML = `
        <p style="color: var(--text-main); font-size: 0.9rem; margin-bottom: 12px;">${stepObj.desc}</p>
        <div style="font-size: 0.78rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 6px;">PYTHON PIPELINE LOGIC (from apex project final code file):</div>
        <pre class="code-block"><code>${stepObj.code}</code></pre>
    `;
    lucide.createIcons();
}

// STEP 11 DATA QUALITY REPORT TABLE
function renderQualityReportTable() {
    const tbody = document.getElementById('quality-table-body');
    tbody.innerHTML = '';
    
    QUALITY_REPORT_DATA.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--accent-cyan);">${row.sensor}</td>
            <td>${row.rawMiss}</td>
            <td>${row.rawMissPct}</td>
            <td style="color: var(--accent-emerald); font-weight: 600;">${row.cleanMiss}</td>
            <td>${row.rawOut}</td>
            <td>${row.cleanOut}</td>
        `;
        tbody.appendChild(tr);
    });
}

// CLEANED DATASET EXPLORER (TAB 5)
let filteredRows = [];
let currentPage = 1;
const rowsPerPage = 20;

function initDatasetExplorer() {
    filteredRows = dataset;
    renderTableHeader();
    renderTableRows();
}

function filterTable() {
    const query = document.getElementById('table-search').value.toLowerCase();
    const alertVal = document.getElementById('alert-filter').value;
    
    filteredRows = dataset.filter(r => {
        const matchesQuery = query === '' || String(r.unit_id).includes(query) || String(r.cycle).includes(query);
        const matchesAlert = alertVal === 'all' || String(r.alert_level) === alertVal;
        return matchesQuery && matchesAlert;
    });
    
    currentPage = 1;
    renderTableRows();
}

function renderTableHeader() {
    const thead = document.getElementById('dataset-thead');
    thead.innerHTML = `
        <tr>
            <th>Unit ID</th>
            <th>Cycle</th>
            <th>RUL</th>
            <th>Alert Level</th>
            <th>s_2 (Norm)</th>
            <th>s_4 (Norm)</th>
            <th>s_11 (Norm)</th>
            <th>s_12 (Norm)</th>
            <th>s_11_roll_mean_5</th>
            <th>s_11_roll_mean_10</th>
        </tr>
    `;
}

function renderTableRows() {
    const tbody = document.getElementById('dataset-tbody');
    tbody.innerHTML = '';
    
    const countDisplay = document.getElementById('row-count-display');
    countDisplay.innerText = `Showing ${filteredRows.length} records`;
    
    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageSlice = filteredRows.slice(startIdx, startIdx + rowsPerPage);
    
    pageSlice.forEach(r => {
        const tr = document.createElement('tr');
        let alertBadge = '<span class="badge emerald">Normal</span>';
        if (r.alert_level === 2) alertBadge = '<span class="badge rose">Critical</span>';
        else if (r.alert_level === 1) alertBadge = '<span class="badge amber">Warning</span>';
        
        tr.innerHTML = `
            <td style="font-weight: 600;">Unit ${r.unit_id}</td>
            <td>${r.cycle}</td>
            <td style="font-weight: 700; color: ${r.RUL <= 30 ? '#ef4444' : (r.RUL <= 60 ? '#f59e0b' : '#10b981')};">${r.RUL}</td>
            <td>${alertBadge}</td>
            <td>${Number(r.s_2).toFixed(4)}</td>
            <td>${Number(r.s_4).toFixed(4)}</td>
            <td>${Number(r.s_11).toFixed(4)}</td>
            <td>${Number(r.s_12).toFixed(4)}</td>
            <td>${Number(r.s_11_roll_mean_5 || r.s_11).toFixed(4)}</td>
            <td>${Number(r.s_11_roll_mean_10 || r.s_11).toFixed(4)}</td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    
    container.innerHTML = `
        <span style="font-size: 0.8rem; color: var(--text-muted);">Page ${currentPage} of ${totalPages}</span>
        <div style="display: flex; gap: 8px;">
            <button class="btn secondary" style="padding: 4px 10px; font-size: 0.75rem;" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">Prev</button>
            <button class="btn secondary" style="padding: 4px 10px; font-size: 0.75rem;" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(1)">Next</button>
        </div>
    `;
}

function changePage(delta) {
    currentPage += delta;
    renderTableRows();
}
