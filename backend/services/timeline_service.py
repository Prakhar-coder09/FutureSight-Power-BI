"""
Future-Sight AI — Timeline & Event Service
"""
from typing import Dict, Any, List
from app.db.models import WarRoomEventRecord

def get_timeline_events(db, war_room_id: str = "WR-2026-OJ-089") -> List[Dict[str, Any]]:
    events = db.query(WarRoomEventRecord).filter(WarRoomEventRecord.war_room_id == war_room_id).order_by(WarRoomEventRecord.id.desc()).all()
    return [
        {
            "event_id": e.event_id,
            "timestamp": e.timestamp.strftime("%b %d, %H:%M") if e.timestamp else "Recently",
            "actor": e.actor,
            "event_type": e.event_type,
            "summary": e.summary,
            "details": e.details
        }
        for e in events
    ]
