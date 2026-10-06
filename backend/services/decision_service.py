"""
Future-Sight AI — Decision Service
"""
from typing import Dict, Any, List
from app.db.models import WarRoomDecisionRecord
from app.engines.war_room_service import add_war_room_decision

def record_decision(db, decision_payload: Dict[str, Any]) -> Dict[str, Any]:
    dec = add_war_room_decision(decision_payload, db)
    return {
        "status": "SUCCESS",
        "decision_id": dec.decision_id,
        "title": dec.title,
        "revenue_impact": dec.revenue_impact,
        "margin_impact": dec.margin_impact,
        "status_code": dec.status
    }

def get_decisions(db) -> List[Dict[str, Any]]:
    records = db.query(WarRoomDecisionRecord).order_by(WarRoomDecisionRecord.id.desc()).all()
    return [
        {
            "decision_id": d.decision_id,
            "title": d.title,
            "decision_text": d.decision_text,
            "decided_by": d.decided_by,
            "approved_by": d.approved_by,
            "justification": d.justification,
            "expected_outcome": d.expected_outcome,
            "revenue_impact": d.revenue_impact,
            "margin_impact": d.margin_impact,
            "status": d.status,
            "created_at": d.created_at.strftime("%Y-%m-%d") if d.created_at else "2026-10-06"
        }
        for d in records
    ]
