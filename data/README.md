# Data Layer — Microsoft OJ Sales Simulated Dataset

This directory contains data artifacts and ingestion specifications for the canonical Microsoft OJ Sales Simulated econometric dataset.

## Dataset Schema

| Field | Type | Description |
| :--- | :--- | :--- |
| `WeekStarting` | `TIMESTAMP` | Monday date of the weekly retail sales cycle (121 total continuous weeks). |
| `Store` | `INTEGER` | Unique retail store identifier (e.g., 1001, 1002, 1014). |
| `Brand` | `VARCHAR` | Category brand: `tropicana`, `minute maid`, `dominicks`. |
| `Quantity` | `FLOAT` | Total unit sales volume for the week. |
| `Advert` | `INTEGER` | Binary indicator (0 = No feature ad, 1 = Feature circular advertised). |
| `Price` | `FLOAT` | Retail unit shelf price in USD. |
| `Revenue` | `FLOAT` | Total gross revenue ($Quantity \times Price$). |

## Econometric Dynamics
- **Price Elasticity**: Calibrated with empirical log-log demand equations ($\eta \in [-1.8, -2.5]$).
- **Promotional Lifts**: Circular advert events drive an average $+22.5\%$ unit lift.
- **Store Tiers**: Tier-1 (high density urban) vs. Tier-2 (suburban price-sensitive clusters).
