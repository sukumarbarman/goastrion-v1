
from __future__ import annotations
from typing import List, Dict, Any

BIAS_SIGN = {"up": 1, "down": -1, "choppy": 0, "neutral": 0}

def _band_score(b: Dict[str, Any]) -> int:
    base = int(b.get("confidence", 0))
    vol = b.get("volatility", "low")
    vol_bonus = {"low": 0, "med": 6, "high": 12}.get(vol, 0)
    reason_bonus = 0
    for r in b.get("reasons", [])[:2]:
        if r in ("ABHIJIT_MUHURAT", "STATION_DIRECT", "STATION_RETRO", "ECLIPSE_WINDOW"):
            reason_bonus += 8
        elif r.startswith("MOON_"):
            reason_bonus += 4
    if b.get("caution", False):
        vol_bonus += 6
    return base + vol_bonus + reason_bonus

def _merge_adjacent(bands: List[Dict[str, Any]], max_gap_min: int = 10) -> List[Dict[str, Any]]:
    def to_min(hm: str) -> int:
        h, m = hm.split(":"); return int(h)*60 + int(m)
    out: List[Dict[str, Any]] = []
    cur = None
    for b in sorted(bands, key=lambda x: x["start"]):
        if cur is None:
            cur = dict(b)
            continue
        gap = to_min(b["start"]) - to_min(cur["end"])
        if gap <= max_gap_min:
            cur["end"] = max(cur["end"], b["end"])  # HH:MM compare ok
            cur["peak_score"] = max(cur.get("peak_score", _band_score(cur)), _band_score(b))
        else:
            out.append(cur); cur = dict(b)
    if cur: out.append(cur)
    return out

def pick_big_move_windows(bands: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not bands: return []
    scored = []
    for b in bands:
        s = _band_score(b)
        bb = dict(b); bb["peak_score"] = s
        scored.append(bb)
    top = sorted(scored, key=lambda x: (x["peak_score"], x["start"]), reverse=True)[:3]
    merged = _merge_adjacent(top, max_gap_min=10)
    out: List[Dict[str, Any]] = []
    for w in merged:
        # inside pick_big_move_windows(...)
        bias = (w.get("bias") or "choppy").lower()
        if bias == "up":
            label = "Big Move Up"
        elif bias == "down":
            label = "Big Move Down"
        else:
            # use ASCII to avoid mojibake in some shells/renderers
            label = "Big Move - Direction Uncertain"

        out.append({
            "start": w["start"], "end": w["end"], "label": label,
            "confidence": int(w.get("confidence", 0)),
            "volatility": w.get("volatility", "high"),
            "reasons": w.get("reasons", [])[:2],
            "caution": bool(w.get("caution", False)),
            "peak_score": int(w.get("peak_score", 0)),
        })
    return out[:2]

def extract_directional_windows(bands: List[Dict[str, Any]], direction: str, limit: int = 3) -> List[Dict[str, Any]]:
    dir_norm = direction.lower()
    filtered = [b for b in bands if (b.get("bias") or "").lower() == dir_norm]
    scored = []
    for b in filtered:
        s = _band_score(b)
        bb = dict(b); bb["peak_score"] = s
        scored.append(bb)
    ret = []
    label = "Big Move Up" if dir_norm == "up" else "Big Move Down"
    for b in sorted(scored, key=lambda x: (x["peak_score"], x["start"]), reverse=True)[:limit]:
        ret.append({
            "start": b["start"], "end": b["end"], "label": label,
            "confidence": int(b.get("confidence", 0)),
            "volatility": b.get("volatility", "high"),
            "reasons": b.get("reasons", [])[:2],
            "caution": bool(b.get("caution", False)),
            "peak_score": int(b.get("peak_score", 0)),
        })
    return ret
