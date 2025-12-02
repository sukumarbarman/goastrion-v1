#goastrion-backend/astro/ephem/swiss.py
from __future__ import annotations
from datetime import datetime
from typing import Dict, Tuple, Optional

from typing import Any, Dict, List, Optional, Tuple



try:
    import swisseph as swe
    _HAS_SWE = True
except Exception:
    _HAS_SWE = False

ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]

def deg_to_sign_index(deg: float) -> int: return int(deg // 30) % 12
def get_sign_name(deg: float) -> str: return ZODIAC_SIGNS[deg_to_sign_index(deg)]

# Map simple names → SwissEphem modes
_SIDM = {}
if _HAS_SWE:
    _SIDM = {
        "lahiri": getattr(swe, "SIDM_LAHIRI", None),
        "fagan": getattr(swe, "SIDM_FAGAN_BRADLEY", None),
        "fb": getattr(swe, "SIDM_FAGAN_BRADLEY", None),
        "raman": getattr(swe, "SIDM_RAMAN", None),
        "deval": getattr(swe, "SIDM_DELUCE", None),  # example
    }

def _maybe_set_sid_mode(name: Optional[str]) -> None:
    """Set sidereal mode if name is provided; otherwise leave library default as-is (legacy)."""
    if not (_HAS_SWE and name):
        return
    mode = _SIDM.get(name.lower())
    if mode is not None:
        try:
            # zero t0 & ayan_t0 to use Swiss internal constants for that mode
            swe.set_sid_mode(mode, 0, 0)
        except Exception:
            pass  # ignore if environment lacks this mode

def compute_all_planets(
    dt_utc: datetime, lat: float, lon: float,
    tz_offset_hours: float = 0.0,
    ayanamsa: Optional[str] = None,   # NEW: e.g., "lahiri" or None to keep legacy default
) -> Tuple[float, Dict[str,float]]:
    """
    Returns sidereal longitudes (relative to whichever ayanamsa Swiss is set to).
    If ayanamsa is provided, we set it before computing (affects global Swiss state).
    IMPORTANT:
      - If dt_utc is true UTC, pass tz_offset_hours=0.0
      - If dt_utc is local civil time, pass its offset in tz_offset_hours
    """
    if not _HAS_SWE:
        base = (dt_utc.toordinal() % 360)
        asc = (base + 123.45) % 360
        planets = {
            "Sun": (base + 10) % 360, "Moon": (base + 42) % 360, "Mars": (base + 80) % 360,
            "Mercury": (base + 25) % 360, "Jupiter": (base + 300) % 360, "Venus": (base + 210) % 360,
            "Saturn": (base + 150) % 360, "Rahu": (base + 5) % 360, "Ketu": (base + 185) % 360
        }
        return asc, planets

    # Optionally set sidereal mode (keeps previous behavior if None)
    _maybe_set_sid_mode(ayanamsa)

    PLANET = {
        "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN,
        "Rahu": swe.TRUE_NODE, "Ketu": swe.TRUE_NODE
    }

    ut_hour = dt_utc.hour + dt_utc.minute/60 + dt_utc.second/3600 - tz_offset_hours
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, ut_hour, swe.GREG_CAL)
    ayan = swe.get_ayanamsa_ut(jd)

    houses, ascmc = swe.houses_ex(jd, lat, lon, b"A")
    asc = (ascmc[0] - ayan) % 360

    positions: Dict[str,float] = {}
    for name, code in PLANET.items():
        if name == "Ketu": continue
        val = swe.calc_ut(jd, code)[0]
        if isinstance(val, tuple): val = val[0]
        positions[name] = (val - ayan) % 360
    positions["Ketu"] = (positions["Rahu"] + 180) % 360

    return asc, positions

# astro/domain/transits.py


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

def compute_angles(
    dt_utc: datetime, lat: float, lon: float,
    tz_offset_hours: float = 0.0,
    ayanamsa: Optional[str] = None,
) -> Dict[str, float]:
    """
    Returns sidereal angles for Asc and MC (if SwissEphem available).
    Fallback: only Asc from existing logic, MC omitted.
    """
    if not _HAS_SWE:
        # Fallback: reuse compute_all_planets' asc and leave MC out
        asc, _ = compute_all_planets(dt_utc, lat, lon, tz_offset_hours, ayanamsa=ayanamsa)
        return {"Asc": asc}

    _maybe_set_sid_mode(ayanamsa)
    ut_hour = dt_utc.hour + dt_utc.minute/60 + dt_utc.second/3600 - tz_offset_hours
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, ut_hour, swe.GREG_CAL)
    ayan = swe.get_ayanamsa_ut(jd)
    houses, ascmc = swe.houses_ex(jd, lat, lon, b"A")
    asc = (ascmc[0] - ayan) % 360
    mc  = (ascmc[1] - ayan) % 360
    return {"Asc": asc, "MC": mc}



