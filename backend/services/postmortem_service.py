"""
Future-Sight AI — Postmortem & Retrospective Service
"""
from typing import Dict, Any
from app.engines.war_room_service import generate_postmortem_analysis

def get_postmortem(db) -> Dict[str, Any]:
    return generate_postmortem_analysis(db)
