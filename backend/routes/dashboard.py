from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.router import get_executive_kpis, get_historical_vs_forecast, get_executive_one_page_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_kpis_endpoint(db: Session = Depends(get_db)):
    return get_executive_kpis(db)

@router.get("/timeline")
def get_timeline_endpoint(db: Session = Depends(get_db)):
    return get_historical_vs_forecast(db)

@router.get("/summary")
def get_summary_endpoint(db: Session = Depends(get_db)):
    return get_executive_one_page_summary(db)
