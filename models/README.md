# Models Layer — Model Registry & Machine Learning Artifacts

This directory stores trained model binaries, version registries, and serialization metadata.

## Deployed Models
- **Primary Deployed**: `HistGradientBoostingRegressor` (`v1.4.2`)
  - Target: `Quantity`
  - Features: Causal lags, rolling aggregates, seasonal harmonics, price-advert interactions
  - Residual standard deviation: $\sigma \approx 14.8$ units
  - Confidence intervals: Calibrated 80% ($Z = 1.282$) and 95% ($Z = 1.96$) prediction interval bands
- **Reference Baseline**: `Seasonal-Naive-Baseline` (`v1.0.0`)
  - 4-week lag repeat
- **Artifact Path**: `models/forecaster_hgb.joblib`
