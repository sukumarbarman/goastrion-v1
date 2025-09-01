from __future__ import annotations
from datetime import datetime
from typing import Dict, Tuple

try:
    import swisseph as swe
    _HAS_SWE = True
except Exception:
    _HAS_SWE = False

ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]

def deg_to_sign_index(deg: float) -> int: return int(deg // 30) % 12
def get_sign_name(deg: float) -> str: return ZODIAC_SIGNS[deg_to_sign_index(deg)]

def compute_all_planets(dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float=0.0) -> Tuple[float, Dict[str,float]]:
    if not _HAS_SWE:
        base = (dt_utc.toordinal() % 360)
        asc = (base + 123.45) % 360
        planets = {
            "Sun": (base + 10) % 360, "Moon": (base + 42) % 360, "Mars": (base + 80) % 360,
            "Mercury": (base + 25) % 360, "Jupiter": (base + 300) % 360, "Venus": (base + 210) % 360,
            "Saturn": (base + 150) % 360, "Rahu": (base + 5) % 360, "Ketu": (base + 185) % 360
        }
        return asc, planets

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
