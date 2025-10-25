
from __future__ import annotations
from dataclasses import dataclass
from datetime import date
import zoneinfo
from ..models import TradingAsset

IST = zoneinfo.ZoneInfo("Asia/Kolkata")

@dataclass
class SessionInfo:
    start: str
    end: str

def get_session_for(asset: TradingAsset, d: date) -> SessionInfo:
    sr = asset.session_rules
    if asset.kind == "crypto":
        return SessionInfo("00:00","23:59")
    return SessionInfo(sr.open_1, sr.close_1)
