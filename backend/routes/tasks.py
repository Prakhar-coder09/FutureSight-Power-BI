from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from app.db.models import WarRoomTaskRecord
from app.engines.war_room_service import add_war_room_task

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/list")
def get_tasks_endpoint(db: Session = Depends(get_db)):
    tasks = db.query(WarRoomTaskRecord).order_by(WarRoomTaskRecord.id.desc()).all()
    return [
        {
            "task_id": t.task_id,
            "title": t.title,
            "department": t.department,
            "owner": t.owner,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date,
            "expected_impact": t.expected_impact,
            "notes": t.notes
        }
        for t in tasks
    ]

@router.post("/create")
def post_create_task_endpoint(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    task = add_war_room_task(payload, db)
    return {
        "status": "SUCCESS",
        "task_id": task.task_id,
        "title": task.title,
        "department": task.department,
        "owner": task.owner
    }
