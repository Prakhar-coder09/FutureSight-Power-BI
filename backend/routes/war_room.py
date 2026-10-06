from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from services.war_room_service import get_current_war_room, get_impact_map, update_status
from services.postmortem_service import get_postmortem

router = APIRouter(prefix="/war-room", tags=["War Room"])

@router.get("/current")
def get_current_war_room_endpoint(db: Session = Depends(get_db)):
    return get_current_war_room(db)

@router.get("/impact-map")
def get_impact_map_endpoint(db: Session = Depends(get_db)):
    return get_impact_map(db)

@router.post("/status")
def post_status_endpoint(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    new_status = payload.get("status", "Investigating")
    user = payload.get("user", "Chief Commercial Officer")
    return update_status(db, new_status, user)

@router.get("/postmortem")
def get_postmortem_endpoint(db: Session = Depends(get_db)):
    return get_postmortem(db)
