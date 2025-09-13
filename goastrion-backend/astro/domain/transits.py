# astro/domain/transits.py
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple

from ..ephem.swiss import compute_all_planets, get_sign_name
from ..ephem.swiss import _HAS_SWE  # best-effort feature flag

def compute_transit_hits_now(
    *,
    dt_naive_utc,                     # naive UTC datetime
    lat: float, lon: float,
    natal_points: Dict[str, float],   # e.g., {"Asc":deg,"MC":deg, "Sun":.., ...}
    aspect_cfg: Dict[str, Any],
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns a dict with 2 lists:
      - "aspect": [{planet, target, aspect, exact, delta, score}]
      - "house":  [{planet, house, score}]
    We keep it minimal: it evaluates transiting *planets* against natal key points
    using the same aspect rules (orb, baseWeight) in AspectConfig.json.
    """
    # 1) Get transiting positions (sidereal, Lahiri if your default is Lahiri elsewhere)
    tz0 = 0.0
    _, tpos = compute_all_planets(dt_naive_utc, lat, lon, tz0, ayanamsa="lahiri")

    # 2) Build aspect rule list (like domain/aspects.py does)
    rules = []
    for a in aspect_cfg.get("aspects", []):
        rules.append({
            "name": a["name"],
            "angle": float(a["angle"]),
            "orb": float(a["orb"]),
            "weight": float(a.get("baseWeight", a.get("weight", 1.0))),
        })

    def angle_diff(a: float, b: float) -> float:
        d = abs((a - b) % 360.0)
        return min(d, 360.0 - d)

    hits_aspect: List[Dict[str, Any]] = []
    for p, pdeg in tpos.items():
        for tgt, tdeg in natal_points.items():
            actual = angle_diff(pdeg, tdeg)
            for r in rules:
                delta = angle_diff(actual, r["angle"])
                if delta <= r["orb"]:
                    score = r["weight"] * max(0.0, 1.0 - (delta / max(1e-6, r["orb"])))
                    hits_aspect.append({
                        "type": "aspect",
                        "planet": p,
                        "target": tgt,
                        "aspect": r["name"],
                        "exact": actual,
                        "delta": delta,
                        "score": score,
                    })

    # 3) House occupancy (very simple): which natal houses would the transiting planet fall into?
    #    We DON’T recompute houses for transit; we use natal lagna-based houses as a frame.
    #    If you want true transit houses, compute another houses_ex for now-time; phase 2.
    hits_house: List[Dict[str, Any]] = []

    return {"aspect": hits_aspect, "house": hits_house}
