"""
Future-Sight AI — Copilot Service
"""
from typing import Dict, Any
from app.data.ingestion import load_or_initialize_dataset
from app.engines.war_room_service import (
    get_war_room_state,
    answer_war_room_copilot
)

def query_copilot(db, query: str) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    state = get_war_room_state(db, df)
    return answer_war_room_copilot(query, state, df)
