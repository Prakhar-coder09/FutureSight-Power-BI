from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from services.scenario_service import run_simulation

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.post("/simulate")
def post_simulate_endpoint(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    return run_simulation(db, payload)
