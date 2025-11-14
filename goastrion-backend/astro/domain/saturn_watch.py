# domain/saturn_watch.py  — optimized saturn_overview (drop-in replacement)
from __future__ import annotations
from datetime import datetime, date, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any
from zoneinfo import ZoneInfo

# IMPORTANT: keep same ephemeris wrappers as before
from ..ephem.swiss import compute_all_planets, deg_to_sign_index

# -------------------------
# Global caches (process lifetime)
# -------------------------
# Keyed by (date_iso, ayanamsa) -> float longitude degrees
_SAT_LON_CACHE: Dict[Tuple[str, str], float] = {}
# Keyed by (date_iso, ayanamsa) -> float speed deg/day (approx)
_SAT_SPD_CACHE: Dict[Tuple[str, str], float] = {}

# -------------------------
# Lightweight helpers
# -------------------------
def _mid(dt0: datetime, dt1: datetime) -> datetime:
    return dt0 + (dt1 - dt0) / 2

def _to_local_date_iso(dt_utc: datetime, user_tz_str: str) -> str:
    if dt_utc.tzinfo is None:
        dt_utc = dt_utc.replace(tzinfo=timezone.utc)
    local = dt_utc.astimezone(ZoneInfo(user_tz_str))
    return local.date().isoformat()

def _angle_diff(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

def _forward_delta(a: float, b: float) -> float:
    return (b - a + 540.0) % 360.0 - 180.0

def _sign_idx_from_lon(lon_deg: float) -> int:
    return deg_to_sign_index(lon_deg)

# -------------------------
# Cached ephemeris accessors (daily noon target)
# -------------------------
def _saturn_lon_at_midday(dt_utc_naive: datetime, ayanamsa: str = "lahiri") -> float:
    """
    Compute/return geocentric Saturn longitude at midday UTC of the date of dt_utc_naive.
    Cache by date_iso + ayanamsa.
    """
    d = dt_utc_naive.date()
    key = (d.isoformat(), ayanamsa)
    if key in _SAT_LON_CACHE:
        return _SAT_LON_CACHE[key]
    # use 12:00 UTC midday to be robust
    midday = datetime(d.year, d.month, d.day, 12, 0, 0)
    # compute_all_planets returns (lagna, positions)
    _, pos = compute_all_planets(midday, 0.0, 0.0, tz_offset_hours=0.0, ayanamsa=ayanamsa)
    lon = float(pos["Saturn"])
    _SAT_LON_CACHE[key] = lon
    return lon

def _saturn_speed_approx_for_date(dt_utc_naive: datetime, ayanamsa: str = "lahiri") -> float:
    """
    Approx speed deg/day using cached midday longitudes for date and next date.
    """
    d = dt_utc_naive.date()
    key = (d.isoformat(), ayanamsa)
    if key in _SAT_SPD_CACHE:
        return _SAT_SPD_CACHE[key]
    lon0 = _saturn_lon_at_midday(datetime(d.year, d.month, d.day, 12, 0, 0), ayanamsa)
    d1 = d + timedelta(days=1)
    lon1 = _saturn_lon_at_midday(datetime(d1.year, d1.month, d1.day, 12, 0, 0), ayanamsa)
    spd = _forward_delta(lon0, lon1)
    _SAT_SPD_CACHE[key] = spd
    return spd

# -------------------------
# Binary search helpers (refine events)
# -------------------------
def _bsearch_ingress(t0: datetime, t1: datetime, target_sign: int, ayanamsa: str, tol_seconds: int = 60) -> datetime:
    """
    Binary search time when Saturn crosses into target_sign within [t0, t1].
    Uses cached daily lon when possible; falls back to compute_all_planets.
    """
    # Ensure naive UTC inputs
    while (t1 - t0).total_seconds() > tol_seconds:
        mid = _mid(t0, t1)
        # use compute_all_planets at mid for better accuracy
        _, pos = compute_all_planets(mid, 0.0, 0.0, tz_offset_hours=0.0, ayanamsa=ayanamsa)
        s = _sign_idx_from_lon(float(pos["Saturn"]))
        if s >= target_sign:
            t1 = mid
        else:
            t0 = mid
    return t1

def _bsearch_station(t0: datetime, t1: datetime, ayanamsa: str, tol_seconds: int = 60) -> datetime:
    """
    Binary search for approx transit speed zero (station) inside [t0, t1].
    Uses cached daily speeds as seed but uses compute_all_planets for midpoints.
    """
    # compute sign of speed at endpoints
    def speed_at(dt: datetime) -> float:
        # use 0:00 & 24:00 approach if necessary
        _, p0 = compute_all_planets(dt, 0.0, 0.0, tz_offset_hours=0.0, ayanamsa=ayanamsa)
        _, p1 = compute_all_planets(dt + timedelta(days=1), 0.0, 0.0, tz_offset_hours=0.0, ayanamsa=ayanamsa)
        return _forward_delta(float(p0["Saturn"]), float(p1["Saturn"]))

    v0 = speed_at(t0)
    v1 = speed_at(t1)
    # if either endpoint already zero-ish, return it
    if abs(v0) < 1e-6:
        return t0
    if abs(v1) < 1e-6:
        return t1

    while (t1 - t0).total_seconds() > tol_seconds:
        mid = _mid(t0, t1)
        vm = speed_at(mid)
        if (v0 <= 0 and vm <= 0) or (v0 >= 0 and vm >= 0):
            t0, v0 = mid, vm
        else:
            t1, v1 = mid, vm
    return t1

# -------------------------
# Event detectors (sampling + refine)
# -------------------------
def _saturn_ingresses(start_utc: datetime, end_utc: datetime, ayanamsa: str) -> List[Tuple[datetime, int]]:
    """
    Detect sign ingresses using adaptive sampling + refine around transitions.
    Returns list of (ingress_time_utc, new_sign_idx)
    """
    out: List[Tuple[datetime, int]] = []
    horizon_days = max(1, (end_utc.date() - start_utc.date()).days)
    # choose coarse step adaptively: larger horizon -> larger step
    if horizon_days <= 365:
        step_days = 1
    elif horizon_days <= 365 * 5:
        step_days = 2
    elif horizon_days <= 365 * 20:
        step_days = 4
    else:
        # for very large horizons sample every ~10-14 days (Saturn moves ~1 deg / 12-14 days)
        step_days = 14

    t = start_utc
    curr_sign = _sign_idx_from_lon(_saturn_lon_at_midday(t, ayanamsa))
    while t < end_utc:
        t_next = min(t + timedelta(days=step_days), end_utc)
        s_next = _sign_idx_from_lon(_saturn_lon_at_midday(t_next, ayanamsa))
        if s_next != curr_sign:
            # refine ingress between t and t_next
            ingress = _bsearch_ingress(t, t_next + timedelta(days=1), s_next, ayanamsa)
            out.append((ingress, s_next))
            curr_sign = s_next
            # jump slightly forward to avoid re-detecting same crossing
            t = ingress + timedelta(hours=1)
        else:
            t = t_next
    return out

def _saturn_retro_intervals(start_utc: datetime, end_utc: datetime, ayanamsa: str) -> Tuple[List[Dict[str, datetime]], List[datetime]]:
    """
    Detect retrograde intervals & station times.
    Uses coarse sampling for speed sign changes and binary search to refine stations.
    """
    intervals: List[Dict[str, datetime]] = []
    stations: List[datetime] = []

    horizon_days = max(1, (end_utc.date() - start_utc.date()).days)
    # pick step for speed sampling — Saturn speed changes slowly, sample coarsely for long horizons
    if horizon_days <= 365:
        step_days = 1
    elif horizon_days <= 365 * 5:
        step_days = 2
    elif horizon_days <= 365 * 20:
        step_days = 4
    else:
        step_days = 10

    t = start_utc
    # compute initial speed sign using approximate cached daily speeds
    v_prev = _saturn_speed_approx_for_date(t, ayanamsa)
    retro = False
    retro_start: Optional[datetime] = None

    while t < end_utc:
        t_next = min(t + timedelta(days=step_days), end_utc)
        v_next = _saturn_speed_approx_for_date(t_next, ayanamsa)
        # detect sign change or zero
        if (v_prev > 0 and v_next < 0) or (v_prev < 0 and v_next > 0) or abs(v_prev) < 1e-9 or abs(v_next) < 1e-9:
            # find station precisely
            t_station = _bsearch_station(max(start_utc, t - timedelta(days=1)), min(end_utc, t_next + timedelta(days=1)), ayanamsa)
            stations.append(t_station)
            v_mid = _saturn_speed_approx_for_date(t_station, ayanamsa)
            # re-evaluate using precise speed_at (binary search used compute_all_planets)
            # But we can classify based on sign of v_mid (approx)
            if v_mid < 0 and not retro:
                retro = True
                retro_start = t_station
            elif v_mid > 0 and retro:
                intervals.append({"start": retro_start or t, "end": t_station})
                retro = False
                retro_start = None
            # advance after station
            t = t_station + timedelta(days=1)
            v_prev = _saturn_speed_approx_for_date(t, ayanamsa)
            continue
        # advance
        t, v_prev = t_next, v_next

    if retro and retro_start is not None:
        intervals.append({"start": retro_start, "end": end_utc})
    # sort stations
    stations_sorted = sorted(stations)
    return intervals, stations_sorted

# -------------------------
# window helpers (mostly unchanged)
# -------------------------
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

# -------------------------
# Public API (optimized)
# -------------------------
def saturn_overview(
    *, today_local: date, horizon_days: int, moon_natal_deg: float,
    asc_natal_deg: float, mc_natal_deg: Optional[float],
    lat: float, lon: float, user_tz_str: str, ayanamsa: str = "lahiri",
) -> Dict[str, Any]:
    """
    Optimized saturn_overview: uses cached daily longitudes + adaptive sampling.
    Signature preserved.
    """
    SIGN_NAMES = [
        "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
        "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
    ]

    # Build start & end UTC naive datetimes (midday as base)
    start_utc = datetime(today_local.year, today_local.month, today_local.day, 12, 0, 0, tzinfo=timezone.utc).replace(tzinfo=None)
    end_utc = start_utc + timedelta(days=horizon_days)

    # ---------- detect ingresses and timeline ----------
    ingresses = _saturn_ingresses(start_utc, end_utc, ayanamsa)
    timeline: List[Tuple[datetime, datetime, int]] = []
    # build timeline from ingresses
    sign0 = _sign_idx_from_lon(_saturn_lon_at_midday(start_utc, ayanamsa))
    t0 = start_utc
    s0 = sign0
    for t_in, s_in in ingresses:
        if t_in <= start_utc:
            s0 = s_in
            continue
        timeline.append((t0, t_in, s0))
        t0, s0 = t_in, s_in
    if t0 < end_utc:
        timeline.append((t0, end_utc, s0))

    # ---------- retrograde intervals & stations ----------
    retro_intervals_dt, stations_dt = _saturn_retro_intervals(start_utc, end_utc, ayanamsa)

    retrograde = [{"start": _to_local_date_iso(r["start"], user_tz_str), "end": _to_local_date_iso(r["end"], user_tz_str)} for r in retro_intervals_dt]
    stations = [{"date": _to_local_date_iso(s, user_tz_str), "type": "station"} for s in sorted(stations_dt)]

    # ---------- classify windows relative to natal moon ----------
    wrap = lambda i: i % 12
    moon_sign_idx = _sign_idx_from_lon(moon_natal_deg)
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

    # ---------- annotate windows ----------
    def annotate_window(a: datetime, b: datetime, phase: str) -> Dict[str, Any]:
        # ±7-day traditional buffer
        a_buf = a - timedelta(days=7)
        b_buf = b + timedelta(days=7)
        a_iso = _to_local_date_iso(a_buf, user_tz_str)
        b_iso = _to_local_date_iso(b_buf, user_tz_str)
        a_d, b_d = date.fromisoformat(a_iso), date.fromisoformat(b_iso)

        # stations within window
        w_st = sorted({s["date"] for s in stations if a_iso <= s["date"] <= b_iso})

        # retro overlaps within window
        w_ro_dt: List[Tuple[datetime, datetime]] = []
        for r in retro_intervals_dt:
            iv = _intersect(a_buf, b_buf, r["start"], r["end"])
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
    # Aspects (support vs stress) — sampled sparsely (few samples)
    # ---------------------------
    ASPECT_SAMPLE_DAYS = 7 if horizon_days > 3650 else 5  # sample sparser for very long horizons
    _ASPECTS = [("Trine", 120.0, 3.0), ("Sextile", 60.0, 2.5), ("Square", 90.0, 2.5), ("Opposition", 180.0, 3.0)]
    support_hits, stress_hits = [], []
    natal_targets: Dict[str, float] = {"Asc": float(asc_natal_deg)}
    if mc_natal_deg is not None:
        natal_targets["MC"] = float(mc_natal_deg)

    t = start_utc
    while t <= end_utc:
        # use compute_all_planets at sample instants (midday)
        _, pos = compute_all_planets(t, 0.0, 0.0, tz_offset_hours=0.0, ayanamsa=ayanamsa)
        sat = float(pos["Saturn"])
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
