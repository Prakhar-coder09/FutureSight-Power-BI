import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import AuditEventRecord

def log_action(
    db: Session,
    action_type: str,
    module_name: str,
    details: str,
    username: str = "executive_analyst",
    organization: str = "Enterprise HQ",
    permission_checked: str = "ANALYST_ROLE_VERIFIED",
    status: str = "SUCCESS"
) -> AuditEventRecord:
    """
    Appends an immutable audit event to the enterprise audit log.
    """
    event = AuditEventRecord(
        timestamp=datetime.now(timezone.utc),
        username=username,
        organization=organization,
        action_type=action_type,
        module_name=module_name,
        details=details,
        permission_checked=permission_checked,
        status=status
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def get_audit_trail(db: Session, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Fetches the latest audit events.
    """
    events = db.query(AuditEventRecord).order_by(AuditEventRecord.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "username": e.username,
            "organization": e.organization,
            "action_type": e.action_type,
            "module_name": e.module_name,
            "details": e.details,
            "permission_checked": e.permission_checked,
            "status": e.status
        }
        for e in events
    ]
