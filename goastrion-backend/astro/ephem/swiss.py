from __future__ import annotations
from datetime import datetime
from typing import Dict, Tuple, Optional

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
