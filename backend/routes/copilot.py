from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from services.copilot_service import query_copilot
from services.evidence_service import get_evidence_details

router = APIRouter(prefix="/copilot", tags=["War Room Copilot"])

@router.post("/query")
def post_copilot_query_endpoint(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    q = payload.get("query", "")
    return query_copilot(db, q)

@router.get("/evidence/{evidence_id}")
def get_evidence_endpoint(evidence_id: str):
    return get_evidence_details(evidence_id)
