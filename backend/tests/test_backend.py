import unittest
import pandas as pd
from app.data.oj_generator import generate_canonical_oj_dataset
from app.data.validation import validate_and_profile_dataset
from app.ml.features import engineer_forecasting_features
from app.ml.leakage_detector import run_data_leakage_audit
from app.ml.forecaster import forecaster
from app.engines.scenario_engine import simulate_scenario
from app.engines.value_cockpit import calculate_ebitda_cockpit
from app.engines.risk_radar import compute_risk_radar

class TestBusinessSightCore(unittest.TestCase):
    def setUp(self):
        # Quick sample for fast testing
        self.df = generate_canonical_oj_dataset(num_stores=5, total_weeks=20, seed=42)

    def test_dataset_generation_and_profiling(self):
        self.assertEqual(len(self.df), 5 * 3 * 20)
        profile = validate_and_profile_dataset(self.df)
        self.assertTrue(profile["is_valid"])
        self.assertGreaterEqual(profile["quality_score"], 90.0)

    def test_feature_engineering_and_leakage_check(self):
        feat_df = engineer_forecasting_features(self.df)
        self.assertIn("rolling_mean_4", feat_df.columns)
        self.assertIn("qty_lag_1", feat_df.columns)
        audit = run_data_leakage_audit(feat_df, train_cutoff_week=12)
        self.assertEqual(audit["overall_status"], "PASS")

    def test_forecasting_and_intervals(self):
        feat_df = engineer_forecasting_features(self.df)
        preds = forecaster.predict(feat_df)
        self.assertIn("forecast_revenue", preds.columns)
        self.assertIn("revenue_lower_80", preds.columns)
        self.assertIn("revenue_upper_80", preds.columns)
        # Verify interval ordering
        sample = preds.dropna().iloc[0]
        self.assertLessEqual(sample["revenue_lower_80"], sample["revenue_upper_80"])

    def test_scenario_simulation(self):
        res = simulate_scenario(self.df, price_delta_pct=0.05, advert_multiplier=1.2)
        self.assertIn("scenario", res)
        self.assertIn("ripple_chain", res)
        self.assertEqual(len(res["ripple_chain"]), 5)

    def test_ebitda_cockpit(self):
        cockpit = calculate_ebitda_cockpit(self.df)
        self.assertIn("kpis", cockpit)
        self.assertGreater(cockpit["kpis"]["total_revenue"], 0)

    def test_risk_radar(self):
        radar = compute_risk_radar(self.df)
        self.assertIn("items", radar)
        self.assertGreater(len(radar["items"]), 0)

    def test_war_room_service_and_copilot(self):
        from app.db.database import SessionLocal, Base, engine
        from app.engines.war_room_service import (
            get_war_room_state,
            get_impact_dependency_graph,
            answer_war_room_copilot
        )
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            state = get_war_room_state(db, self.df)
            self.assertEqual(state["war_room_id"], "WR-2026-OJ-089")
            self.assertGreater(state["metrics"]["target_revenue"], 0)
            self.assertGreater(len(state["tasks"]), 0)
            self.assertGreater(len(state["decisions"]), 0)

            # Test impact graph
            graph = get_impact_dependency_graph(self.df, state)
            self.assertGreaterEqual(len(graph["nodes"]), 8)
            self.assertGreaterEqual(len(graph["edges"]), 8)

            # Test copilot evidence extraction
            copilot_res = answer_war_room_copilot("Why are we missing next month revenue target?", state, self.df)
            self.assertIn("evidence", copilot_res)
            self.assertGreaterEqual(copilot_res["evidence"]["confidence_score"], 80)
            self.assertIn("Dominicks", copilot_res["answer"])
        finally:
            db.close()

if __name__ == "__main__":
    unittest.main()
