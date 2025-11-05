from __future__ import annotations
from datetime import datetime, date, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

from ..ephem.swiss import compute_all_planets, deg_to_sign_index

# =========================
# Core ephemeris wrappers
# =========================

def _saturn_lon(dt_naive_utc: datetime, lat: float, lon: float, ayanamsa: str = "lahiri") -> float:
    _, pos = compute_all_planets(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa=ayanamsa)
    return float(pos["Saturn"])

def _moon_lon(dt_naive_utc: datetime, lat: float, lon: float, ayanamsa: str = "lahiri") -> float:
    _, pos = compute_all_planets(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa=ayanamsa)
    return float(pos["Moon"])

def _sign_idx_from_lon(lon_deg: float) -> int:
    return deg_to_sign_index(lon_deg)

def _angle_diff(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

def _forward_delta(a: float, b: float) -> float:
    """Signed shortest delta a->b in (-180, 180]."""
    return (b - a + 540.0) % 360.0 - 180.0

def _midpoint(a: datetime, b: datetime) -> datetime:
    return a + (b - a) / 2

def _to_local_date_iso(dt_utc: datetime, user_tz_str: str) -> str:
    """UTC naive -> local date ISO (YYYY-MM-DD) in user tz."""
    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=timezone.utc)
    local = dt_utc.astimezone(ZoneInfo(user_tz_str))
    return local.date().isoformat()

# =========================
# Event finders (fast)
# =========================

def _bsearch_sign_edge(t0: datetime, t1: datetime, target_sign: int, lat: float, lon: float, ayanamsa: str, tol_seconds: int = 60) -> datetime:
    """Binary search for time when Saturn enters target_sign in [t0, t1]."""
    while (t1 - t0).total_seconds() > tol_seconds:
        mid = _midpoint(t0, t1)
        s = _sign_idx_from_lon(_saturn_lon(mid, lat, lon, ayanamsa))
        if s >= target_sign:
            t1 = mid
        else:
            t0 = mid
    return t1

def _saturn_speed_deg_per_day(t: datetime, lat: float, lon: float, ayanamsa: str) -> float:
    lon0 = _saturn_lon(t, lat, lon, ayanamsa)
    lon1 = _saturn_lon(t + timedelta(days=1), lat, lon, ayanamsa)
    return _forward_delta(lon0, lon1)

def _bsearch_station(t0: datetime, t1: datetime, lat: float, lon: float, ayanamsa: str, tol_seconds: int = 60) -> datetime:
    """Binary search for speed==0 crossing (station) in [t0, t1]."""
    v0 = _saturn_speed_deg_per_day(t0, lat, lon, ayanamsa)
    v1 = _saturn_speed_deg_per_day(t1, lat, lon, ayanamsa)
    if v0 == 0:
        return t0
    if v1 == 0:
        return t1
    while (t1 - t0).total_seconds() > tol_seconds:
        mid = _midpoint(t0, t1)
        vm = _saturn_speed_deg_per_day(mid, lat, lon, ayanamsa)
        if (v0 <= 0 and vm <= 0) or (v0 >= 0 and vm >= 0):
            t0, v0 = mid, vm
        else:
            t1, v1 = mid, vm
    return t1

def _saturn_ingresses(start_utc: datetime, end_utc: datetime, lat: float, lon: float, ayanamsa: str) -> List[Tuple[datetime, int]]:
    """
    Returns [(ingress_time_utc, new_sign_idx)] for Saturn between start and end.
    Finer scan (20d) + bisection at boundaries for better accuracy.
    """
    out: List[Tuple[datetime, int]] = []
    step = timedelta(days=20)  # 🔧 was 40
    t = start_utc
    curr_sign = _sign_idx_from_lon(_saturn_lon(t, lat, lon, ayanamsa))
    while t < end_utc:
        t_next = min(t + step, end_utc)
        next_sign = _sign_idx_from_lon(_saturn_lon(t_next, lat, lon, ayanamsa))
        if next_sign != curr_sign:
            ingress = _bsearch_sign_edge(t, t_next, next_sign, lat, lon, ayanamsa)
            out.append((ingress, next_sign))
            curr_sign = next_sign
        t = t_next
    return out

def _saturn_retro_intervals(start_utc: datetime, end_utc: datetime, lat: float, lon: float, ayanamsa: str) -> Tuple[List[Dict], List[datetime]]:
    """Returns (retrograde_intervals, stations)."""
    step = timedelta(days=5)
    t = start_utc
    v_prev = _saturn_speed_deg_per_day(t, lat, lon, ayanamsa)
    retro = False
    retro_start: Optional[datetime] = None
    intervals: List[Dict] = []
    stations: List[datetime] = []

    while t < end_utc:
        t_next = min(t + step, end_utc)
        v_next = _saturn_speed_deg_per_day(t_next, lat, lon, ayanamsa)
        if (v_prev > 0 and v_next < 0) or (v_prev < 0 and v_next > 0) or (v_prev == 0) or (v_next == 0):
            t_station = _bsearch_station(t, t_next, lat, lon, ayanamsa)
            stations.append(t_station)
            v_mid = _saturn_speed_deg_per_day(t_station, lat, lon, ayanamsa)
            if v_mid < 0 and not retro:
                retro = True
                retro_start = t_station
            elif v_mid > 0 and retro:
                intervals.append({"start": retro_start or t, "end": t_station})
                retro = False
                retro_start = None
        t, v_prev = t_next, v_next

    if retro and retro_start is not None:
        intervals.append({"start": retro_start, "end": end_utc})
    return intervals, stations

# =========================
# Window builders
# =========================

def _timeline_from_ingresses(start_utc: datetime, end_utc: datetime, ingresses: List[Tuple[datetime, int]], lat: float, lon: float, ayanamsa: str) -> List[Tuple[datetime, datetime, int]]:
    """Build [(start, end, sign_idx)] timeline for Saturn sign occupancy."""
    tl: List[Tuple[datetime, datetime, int]] = []
    sign0 = _sign_idx_from_lon(_saturn_lon(start_utc, lat, lon, ayanamsa))
    t0 = start_utc
    s0 = sign0
    for t_in, s_in in ingresses:
        if t_in <= start_utc:
            s0 = s_in
            continue
        tl.append((t0, t_in, s0))
        t0, s0 = t_in, s_in
    if t0 < end_utc:
        tl.append((t0, end_utc, s0))
    return tl

def _merge_adjacent(windows: List[Tuple[datetime, datetime]]) -> List[Tuple[datetime, datetime]]:
    if not windows:
        return []
    windows = sorted(windows, key=lambda x: x[0])
    out = [windows[0]]
    for a, b in windows[1:]:
        pa, pb = out[-1]
        if a <= pb:
            out[-1] = (pa, max(pb, b))
        else:
            out.append((a, b))
    return out

def _merge_small_gaps(windows: List[Tuple[datetime, datetime]], gap_days: int = 30) -> List[Tuple[datetime, datetime]]:
    """Merge consecutive Saturn windows if gap between them < gap_days."""
    if not windows:
        return []
    windows = sorted(windows, key=lambda x: x[0])
    merged = [windows[0]]
    for a, b in windows[1:]:
        prev_start, prev_end = merged[-1]
        if (a - prev_end).days <= gap_days:
            merged[-1] = (prev_start, max(prev_end, b))
        else:
            merged.append((a, b))
    return merged

def _intersect(a0: datetime, a1: datetime, b0: datetime, b1: datetime) -> Optional[Tuple[datetime, datetime]]:
    lo = max(a0, b0)
    hi = min(a1, b1)
    if lo < hi:
        return (lo, hi)
    return None

def _pick_even_samples_from_date_segments(segments: List[Tuple[date, date]], k: int = 3) -> List[str]:
    if not segments:
        return []
    total = sum((b - a).days + 1 for a, b in segments)
    if total <= 0:
        return []
    checkpoints = [0, total // 2, total - 1][:k]
    out: List[str] = []
    for cp in checkpoints:
        remaining = cp
        for a, b in segments:
            seg_len = (b - a).days + 1
            if remaining < seg_len:
                out.append((a + timedelta(days=remaining)).isoformat())
                break
            remaining -= seg_len
    uniq = []
    for x in out:
        if x not in uniq:
            uniq.append(x)
    return uniq

# =========================
# Public API
# =========================

def saturn_overview(
    *, today_local: date, horizon_days: int, moon_natal_deg: float,
    asc_natal_deg: float, mc_natal_deg: Optional[float],
    lat: float, lon: float, user_tz_str: str, ayanamsa: str = "lahiri",
) -> Dict:
    SIGN_NAMES = [
        "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
        "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
    ]

    start_utc = datetime(today_local.year, today_local.month, today_local.day, 12, 0, 0, tzinfo=timezone.utc).replace(tzinfo=None)
    end_utc = start_utc + timedelta(days=horizon_days)

    moon_sign_idx = _sign_idx_from_lon(moon_natal_deg)

    ingresses = _saturn_ingresses(start_utc, end_utc, lat, lon, ayanamsa)
    timeline = _timeline_from_ingresses(start_utc, end_utc, ingresses, lat, lon, ayanamsa)

    retro_intervals_dt, stations_dt = _saturn_retro_intervals(start_utc, end_utc, lat, lon, ayanamsa)

    retrograde = [{"start": _to_local_date_iso(r["start"], user_tz_str), "end": _to_local_date_iso(r["end"], user_tz_str)} for r in retro_intervals_dt]
    stations = [{"date": _to_local_date_iso(s, user_tz_str), "type": "station"} for s in sorted(stations_dt)]

    wrap = lambda i: i % 12
    target_start, target_peak, target_end = wrap(moon_sign_idx - 1), wrap(moon_sign_idx), wrap(moon_sign_idx + 1)
    target_asht, target_k4, target_k7, target_k10 = wrap(moon_sign_idx + 8), wrap(moon_sign_idx + 4), wrap(moon_sign_idx + 7), wrap(moon_sign_idx + 10)

    ss_start_pieces, ss_peak_pieces, ss_end_pieces = [], [], []
    ashtama_pieces, k4_pieces, k7_pieces, k10_pieces = [], [], [], []

    for a, b, s in timeline:
        if s == target_start: ss_start_pieces.append((a, b))
        if s == target_peak:  ss_peak_pieces.append((a, b))
        if s == target_end:   ss_end_pieces.append((a, b))
        if s == target_asht:  ashtama_pieces.append((a, b))
        if s == target_k4:    k4_pieces.append((a, b))
        if s == target_k7:    k7_pieces.append((a, b))
        if s == target_k10:   k10_pieces.append((a, b))

    ss_start = _merge_small_gaps(_merge_adjacent(ss_start_pieces))
    ss_peak  = _merge_small_gaps(_merge_adjacent(ss_peak_pieces))
    ss_end   = _merge_small_gaps(_merge_adjacent(ss_end_pieces))
    ashtama  = _merge_adjacent(ashtama_pieces)
    k4, k7, k10 = map(_merge_adjacent, [k4_pieces, k7_pieces, k10_pieces])

    def annotate_window(a: datetime, b: datetime, phase: str) -> Dict:
        # ±7-day traditional buffer
        a -= timedelta(days=7)
        b += timedelta(days=7)
        a_iso = _to_local_date_iso(a, user_tz_str)
        b_iso = _to_local_date_iso(b, user_tz_str)
        a_d, b_d = date.fromisoformat(a_iso), date.fromisoformat(b_iso)

        w_st = sorted({s["date"] for s in stations if a_iso <= s["date"] <= b_iso})

        w_ro_dt: List[Tuple[datetime, datetime]] = []
        for r in retro_intervals_dt:
            iv = _intersect(a, b, r["start"], r["end"])
            if iv:
                w_ro_dt.append(iv)

        w_ro_local_dates: List[Tuple[date, date]] = []
        w_ro_out: List[Dict[str, str]] = []
        for x0, x1 in w_ro_dt:
            s_local = date.fromisoformat(_to_local_date_iso(x0, user_tz_str))
            e_local = date.fromisoformat(_to_local_date_iso(x1, user_tz_str))
            w_ro_local_dates.append((s_local, e_local))
            w_ro_out.append({"start": s_local.isoformat(), "end": e_local.isoformat()})

        total_days = (b_d - a_d).days + 1
        retro_days = sum((e - s).days + 1 for (s, e) in w_ro_local_dates)

        bad_spans: List[Tuple[date, date]] = sorted(
            w_ro_local_dates + [(date.fromisoformat(d), date.fromisoformat(d)) for d in w_st],
            key=lambda x: x[0]
        )
        segs: List[Tuple[date, date]] = []
        cursor = a_d
        for bs, be in bad_spans:
            if be < cursor:
                continue
            if bs > cursor:
                segs.append((cursor, min(b_d, bs - timedelta(days=1))))
            cursor = max(cursor, be + timedelta(days=1))
            if cursor > b_d:
                break
        if cursor <= b_d:
            segs.append((cursor, b_d))

        good_days = sum((b2 - a2).days + 1 for a2, b2 in segs)
        good_ratio = round(max(0.0, min(1.0, (good_days / max(1, total_days)))), 3)
        good_sample_dates = _pick_even_samples_from_date_segments(segs, k=3)

        retro_frac = retro_days / max(1, total_days)
        if w_st:
            severity, badge, chip, note = ("red", "caution", "Caution day(s)", "Station day(s): go slow; avoid new contracts.")
        elif retro_frac >= 0.40:
            severity, badge, chip, note = ("red", "review", "Review/Revise (heavy)", "Heavy retro overlap: great for rework.")
        elif retro_frac > 0:
            severity, badge, chip, note = ("amber", "review", "Review/Revise", "Mild retro overlap: review ongoing plans.")
        else:
            severity, badge, chip, note = ("green", "clear", "Clear flow", "Smooth window.")

        def _phase_saturn_sign(ph: str) -> str:
            idx = (moon_sign_idx - 1 if ph == "start" else moon_sign_idx + 1 if ph == "end" else moon_sign_idx) % 12
            return SIGN_NAMES[idx]

        return {
            "start": a_iso, "end": b_iso, "phase": phase, "duration_days": total_days,
            "stations": w_st, "retro_overlaps": w_ro_out,
            "moon_sign": SIGN_NAMES[moon_sign_idx], "saturn_sign": _phase_saturn_sign(phase),
            "good_day_ratio": good_ratio, "good_sample_dates": good_sample_dates,
            "badge": badge, "severity": severity, "chip": chip, "note": note,
            "bad_days_station": w_st, "bad_spans_retro": w_ro_out, "caution_days": w_st,
        }

    ss_windows = [annotate_window(a, b, "start") for a, b in ss_start] + \
                 [annotate_window(a, b, "peak") for a, b in ss_peak] + \
                 [annotate_window(a, b, "end") for a, b in ss_end]
    ss_windows.sort(key=lambda w: w["start"])

    top_phase = "none"
    if any(w["phase"] == "peak" for w in ss_windows): top_phase = "peak"
    elif any(w["phase"] == "start" for w in ss_windows): top_phase = "start"
    elif any(w["phase"] == "end" for w in ss_windows): top_phase = "end"

    def _to_local(a: datetime, b: datetime) -> Tuple[str, str]:
        return _to_local_date_iso(a, user_tz_str), _to_local_date_iso(b, user_tz_str)

    ashtama_out = [{"start": s, "end": e} for a, b in ashtama for s, e in [_to_local(a, b)]]
    kantaka_out = []
    for a, b in k4:  s, e = _to_local(a, b); kantaka_out.append({"start": s, "end": e, "house": 4})
    for a, b in k7:  s, e = _to_local(a, b); kantaka_out.append({"start": s, "end": e, "house": 7})
    for a, b in k10: s, e = _to_local(a, b); kantaka_out.append({"start": s, "end": e, "house": 10})
    kantaka_out.sort(key=lambda x: x["start"])

    # ---------------------------
    # Aspects (support vs stress)
    # ---------------------------
    ASPECT_SAMPLE_DAYS = 5
    _ASPECTS = [("Trine", 120.0, 3.0), ("Sextile", 60.0, 2.5), ("Square", 90.0, 2.5), ("Opposition", 180.0, 3.0)]
    support_hits, stress_hits = [], []
    natal_targets: Dict[str, float] = {"Asc": float(asc_natal_deg)}
    if mc_natal_deg is not None:
        natal_targets["MC"] = float(mc_natal_deg)

    t = start_utc
    while t <= end_utc:
        sat = _saturn_lon(t, lat, lon, ayanamsa)
        for name, angle, orb in _ASPECTS:
            for tgt, tdeg in natal_targets.items():
                delta = _angle_diff((sat - tdeg) % 360.0, angle)
                if delta <= orb:
                    hit = {"date": _to_local_date_iso(t, user_tz_str), "aspect": name, "target": tgt}
                    (support_hits if name in ("Trine", "Sextile") else stress_hits).append(hit)
        t += timedelta(days=ASPECT_SAMPLE_DAYS)

    ss_caution_days = sorted({d for w in ss_windows for d in w["stations"]})

    return {
        "sade_sati": {"phase": top_phase, "windows": ss_windows, "caution_days": ss_caution_days},
        "ashtama": ashtama_out,
        "kantaka": kantaka_out,
        "retrograde": retrograde,
        "stations": stations,
        "support_hits": support_hits,
        "stress_hits": stress_hits,
    }


def saturn_multiplier(goal: str, day_iso: str, ctx: Dict) -> float:
    """Simple weight based on Saturn context for a given day."""
    m = 1.0
    for w in ctx.get("sade_sati", {}).get("windows", []):
        if w.get("phase") == "peak" and w["start"] <= day_iso <= w["end"]:
            m *= 0.90 if goal not in ("marriage", "new_relationship") else 0.85
            break
    for w in ctx.get("ashtama", []):
        if w["start"] <= day_iso <= w["end"]:
            m *= 0.92
            break
    for w in ctx.get("kantaka", []):
        if w["start"] <= day_iso <= w["end"]:
            m *= 0.92 if goal in ("promotion","job_change","business_expand","business_start","property") else 0.88
            break
    if any(s.get("date") == day_iso for s in ctx.get("stations", [])):
        if goal in ("property","business_start","business_expand","startup"):
            m *= 0.93
    return max(0.75, min(1.20, m))
