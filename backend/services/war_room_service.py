"""
Future-Sight AI — War Room Service
"""
import pandas as pd
from typing import Dict, Any
from app.data.ingestion import load_or_initialize_dataset
from app.engines.war_room_service import (
    get_war_room_state as get_state_internal,
    get_impact_dependency_graph as get_graph_internal,
    update_war_room_status as update_status_internal
)

def get_current_war_room(db) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    return get_state_internal(db, df)

def get_impact_map(db) -> Dict[str, Any]:
    df = load_or_initialize_dataset(db)
    state = get_state_internal(db, df)
    return get_graph_internal(df, state)

def update_status(db, new_status: str, user: str = "Chief Commercial Officer") -> Dict[str, Any]:
    return update_status_internal(new_status, db, user=user)
