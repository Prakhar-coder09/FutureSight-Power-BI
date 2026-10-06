from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from services.decision_service import record_decision, get_decisions

router = APIRouter(prefix="/decisions", tags=["Decisions"])

@router.get("/list")
def get_decisions_endpoint(db: Session = Depends(get_db)):
    return get_decisions(db)

@router.post("/record")
def post_decision_endpoint(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    return record_decision(db, payload)
