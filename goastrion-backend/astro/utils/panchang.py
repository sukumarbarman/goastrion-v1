# goastrion-backend/astro/utils/panchang.py
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Dict, Tuple, Union, Optional
from zoneinfo import ZoneInfo

# Optional accurate sun times (recommended)
try:
    from astral import LocationInfo
    from astral.sun import sun as astral_sun
    _ASTRAL_OK = True
except Exception:
    _ASTRAL_OK = False


def _tzobj(tz: Union[str, ZoneInfo]) -> ZoneInfo:
    if isinstance(tz, ZoneInfo):
        return tz
    try:
        return ZoneInfo((tz or "Asia/Kolkata").strip())
    except Exception:
        return ZoneInfo("Asia/Kolkata")


def _sun_times(day: date, lat: float, lon: float, tz: ZoneInfo) -> Tuple[datetime, datetime, datetime]:
    """
    Returns (sunrise, solar_noon, sunset) in tz.
    Falls back to 06:00/12:00/18:00 local if astral isn't available.
    """
    if _ASTRAL_OK:
        try:
            loc = LocationInfo(
                name="loc", region="", timezone=getattr(tz, "key", str(tz)),
                latitude=float(lat), longitude=float(lon)
            )
            s = astral_sun(loc.observer, date=day, tzinfo=tz)
            return s["sunrise"], s["noon"], s["sunset"]
        except Exception:
            pass

    # Fallback (coarse but robust)
    sr = datetime(day.year, day.month, day.day, 6, 0, 0, tzinfo=tz)
    noon = datetime(day.year, day.month, day.day, 12, 0, 0, tzinfo=tz)
    ss = datetime(day.year, day.month, day.day, 18, 0, 0, tzinfo=tz)
    return sr, noon, ss


def _block(sr: datetime, seg: timedelta, idx_1based: int) -> Tuple[datetime, datetime]:
    start = sr + (idx_1based - 1) * seg
    end = sr + idx_1based * seg
    return start, end


def dayparts_rahu_yama_gulika(
    day: date, lat: float, lon: float, tz: Union[str, ZoneInfo]
) -> Dict[str, Tuple[datetime, datetime]]:
    """
    Compute daytime panchang parts for the given day & place.

    Returns a dict with keys:
      - 'rahu':   (start_dt, end_dt)
      - 'yama':   (start_dt, end_dt)
      - 'gulika': (start_dt, end_dt)
      - 'abhijit':(start_dt, end_dt)  # 1/15 of daytime centered at solar noon

    Notes:
      * Daytime is [sunrise..sunset] split into 8 equal parts.
    """
    tz = _tzobj(tz)
    sunrise, solar_noon, sunset = _sun_times(day, lat, lon, tz)

    if not (sunrise and sunset and sunrise < sunset):
        return {}

    daytime = (sunset - sunrise)
    seg = daytime / 8.0

    # Python weekday: Monday=0 .. Sunday=6
    RAHU   = [2, 7, 5, 6, 4, 3, 8]
    YAMA   = [4, 3, 2, 1, 7, 6, 5]
    GULIKA = [6, 5, 4, 3, 2, 1, 7]

    wd = day.weekday()
    rs, re = _block(sunrise, seg, RAHU[wd])
    ys, ye = _block(sunrise, seg, YAMA[wd])
    gs, ge = _block(sunrise, seg, GULIKA[wd])

    # Abhijit = 1/15 of daytime centered at solar noon
    half = daytime / 30.0
    as_, ae = (solar_noon - half, solar_noon + half)

    return {"rahu": (rs, re), "yama": (ys, ye), "gulika": (gs, ge), "abhijit": (as_, ae)}
