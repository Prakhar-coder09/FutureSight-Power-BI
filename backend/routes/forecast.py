from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from services.forecast_service import get_forecast_kpis, get_backtest_metrics, get_leakage_audit

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/kpis")
def get_kpis_endpoint(db: Session = Depends(get_db)):
    return get_forecast_kpis(db)

@router.get("/backtest")
def get_backtest_endpoint(db: Session = Depends(get_db)):
    return get_backtest_metrics(db)

@router.get("/leakage-check")
def get_leakage_endpoint(db: Session = Depends(get_db)):
    return get_leakage_audit(db)
