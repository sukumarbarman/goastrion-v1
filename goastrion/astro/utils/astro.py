from __future__ import annotations
from typing import Dict, Tuple, Optional
from datetime import datetime
from ..ephem.swiss import compute_all_planets, deg_to_sign_index, get_sign_name
from django.core.cache import cache

def geocode_place(place: str) -> Tuple[Optional[str], Optional[float], Optional[float]]:
    if not _HAS_GEOPY:
        return None, None, None

    key = f"geocode:{place.lower()}"
    cached = cache.get(key)
    if cached:
        return cached

    try:
        geolocator = Nominatim(user_agent="GoAstrion/1.0 (contact@goastrion.com)")
        loc = geolocator.geocode(place, addressdetails=False, timeout=10)
        if not loc:
            return None, None, None
        result = (loc.address, loc.latitude, loc.longitude)
        cache.set(key, result, 60 * 60)  # cache 1 hour
        return result
    except Exception:
        return None, None, None


NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"]

def get_nakshatra_name(moon_lon: float) -> str:
    seg = 360.0 / 27.0
    return NAKSHATRAS[int(moon_lon // seg) % 27]

def assign_planets_to_houses(lagna_deg: float, planet_positions: Dict[str, float]) -> Dict[int, list]:
    lagna_sign_index = deg_to_sign_index(lagna_deg)
    bins = {h: [] for h in range(1, 13)}
    for planet, lon in planet_positions.items():
        sign_index = deg_to_sign_index(lon)
        house_num = ((sign_index - lagna_sign_index) % 12) + 1
        bins[house_num].append(planet)
    return bins

# Optional geocoding
try:
    from geopy.geocoders import Nominatim
    _HAS_GEOPY = True
except Exception:
    _HAS_GEOPY = False

def geocode_place(place: str) -> Tuple[Optional[str], Optional[float], Optional[float]]:
    if not _HAS_GEOPY:
        return None, None, None
    try:
        geolocator = Nominatim(user_agent="GoAstrion/1.0 (contact@goastrion.com)")
        loc = geolocator.geocode(place)
        if not loc: return None, None, None
        return loc.address, loc.latitude, loc.longitude
    except Exception:
        return None, None, None

def build_summary(dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float=0.0) -> Dict[str, str]:
    lagna, positions = compute_all_planets(dt_utc, lat, lon, tz_offset_hours)
    sun_lon = positions["Sun"]; moon_lon = positions["Moon"]
    return {
        "lagna_sign": get_sign_name(lagna),
        "sun_sign": get_sign_name(sun_lon),
        "moon_sign": get_sign_name(moon_lon),
        "moon_nakshatra": get_nakshatra_name(moon_lon),
        "lagna_deg": f"{lagna:.2f}°",
        "sun_deg": f"{sun_lon:.2f}°",
        "moon_deg": f"{moon_lon:.2f}°",
    }
