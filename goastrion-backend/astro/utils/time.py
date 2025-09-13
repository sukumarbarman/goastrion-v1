from __future__ import annotations
from datetime import datetime, timezone

def parse_client_iso_to_aware_utc(dt_str: str) -> datetime:
    """
    Frontend sends an ISO instant like: '1990-11-20T17:30:00Z' or with +hh:mm.
    Return an aware UTC datetime.
    """
    dt_aw = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    return dt_aw.astimezone(timezone.utc)

def aware_utc_to_naive(dt_aw: datetime) -> datetime:
    """
    Legacy chart code expects naive UTC (your existing functions).
    """
    if dt_aw.tzinfo is None:
        return dt_aw
    return dt_aw.astimezone(timezone.utc).replace(tzinfo=None)
