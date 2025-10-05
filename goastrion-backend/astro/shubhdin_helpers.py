# astro/shubhdin_helpers.py
from __future__ import annotations
from datetime import date, timedelta
from typing import List, Dict, Tuple, Optional

_MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

def mon3(m: int) -> str:
    return _MON3[m-1]

def duration_days(a_iso: str, b_iso: str) -> int:
    a, b = date.fromisoformat(a_iso), date.fromisoformat(b_iso)
    return (b - a).days + 1

def fmt_start_end_duration(a_iso: str, b_iso: str) -> str:
    a, b = date.fromisoformat(a_iso), date.fromisoformat(b_iso)
    d = duration_days(a_iso, b_iso)
    return f"{a.day:02d} {mon3(a.month)} {a.year} - {b.day:02d} {mon3(b.month)} {b.year} ({d}d)"

def percentiles(sorted_vals: List[float], ps: List[float]) -> List[float]:
    out: List[float] = []
    n = len(sorted_vals)
    for p in ps:
        if n == 0:
            out.append(0.0); continue
        if n == 1:
            out.append(sorted_vals[0]); continue
        idx = p * (n - 1)
        lo = int(idx); hi = min(lo + 1, n - 1)
        frac = idx - lo
        out.append(sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac)
    return out

def normalize_scores(daylist: List[Dict], raw_key: str = "raw", out_key: str = "score") -> None:
    """
    Robust per-horizon normalization:
      p50 -> ~60, p95 -> ~95; clamp to [5, 98]
    """
    raws = [float(d.get(raw_key, 0.0)) for d in daylist]
    sv = sorted(raws)
    p50, p95 = percentiles(sv, [0.50, 0.95])
    rng = max(1e-6, p95 - p50)
    for d in daylist:
        z = (float(d.get(raw_key, 0.0)) - p50) / rng
        s = 60 + 35 * max(-1.5, min(1.5, z))
        d[out_key] = round(max(5.0, min(98.0, s)), 2)

def best_window(days: List[Dict], span: int, score_key: str = "score") -> Dict | None:
    """Find best contiguous span using (normalized) score."""
    if len(days) < span:
        return None
    best: Tuple[float, int, int] = (-1.0, -1, -1)
    for i in range(0, len(days) - (span - 1)):
        s = sum(d[score_key] for d in days[i:i+span])
        if s > best[0]:
            best = (s, i, i + span - 1)
    if best[1] < 0: return None
    a = days[best[1]]["date"]; b = days[best[2]]["date"]
    return {"start": a, "end": b, "duration_days": span, "sum": round(best[0], 2), "si": best[1], "ei": best[2]}

def grow_window(days: List[Dict], si: int, ei: int, * ,
                score_key: str = "score", cutoff: float = 55.0, patience: int = 5) -> Tuple[int, int]:
    """
    Expand [si,ei] outward while scores stay >= cutoff,
    allowing up to `patience` consecutive below-threshold days before stopping.
    (Won't cross index 0, so ranges are future-only if input starts at today.)
    """
    n = len(days)
    # left
    below = 0
    i = si - 1
    while i >= 0:
        if days[i][score_key] >= cutoff:
            si = i; below = 0
        else:
            below += 1
            if below >= patience: break
        i -= 1
    # right
    below = 0
    j = ei + 1
    while j < n:
        if days[j][score_key] >= cutoff:
            ei = j; below = 0
        else:
            below += 1
            if below >= patience: break
        j += 1
    return si, ei

def non_overlapping_top_windows(days: List[Dict], span: int, k: int = 3, score_key: str = "score") -> List[Dict]:
    """Pick up to k non-overlapping best spans (no growth applied here)."""
    picked: List[Dict] = []
    used = [False] * len(days)
    for _ in range(k):
        rem = []
        idx_map = []
        for idx, d in enumerate(days):
            if not used[idx]:
                rem.append(d); idx_map.append(idx)
        w = best_window(rem, span, score_key=score_key)
        if not w: break
        si = idx_map[w["si"]]; ei = idx_map[w["ei"]]
        for t in range(si, ei + 1): used[t] = True
        w2 = dict(w); w2["si_orig"] = si; w2["ei_orig"] = ei
        picked.append(w2)
    return picked

def dedupe_windows(wins: list[dict], limit: int | None = None) -> list[dict]:
    """
    Remove duplicate ranges by (start,end). Keeps original order.
    Optionally cap the result length with `limit`.
    Each item is expected to have keys: start, end, duration_days.
    """
    seen = set()
    out = []
    for w in wins:
        key = (w.get("start"), w.get("end"))
        if key in seen:
            continue
        seen.add(key)
        out.append(w)
        if limit is not None and len(out) >= limit:
            break
    return out

# --- caution helpers ---------------------------------------------------------

def angle_diff(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

def dates_in_range(days: list[dict], start_iso: str, end_iso: str) -> list[dict]:
    """Filter entries from a swept day list within [start_iso, end_iso]."""
    return [d for d in days if start_iso <= d["date"] <= end_iso]

def fmt_date(d_iso: str) -> str:
    d = date.fromisoformat(d_iso)
    return f"{d.day:02d} {_MON3[d.month-1]} {d.year}"

def format_dates_list(dates: list[str], max_items: int = 8) -> str:
    """Human string like '18 Nov 2025, 19 Nov 2025, …' (caps long lists)."""
    if not dates: return ""
    items = [fmt_date(x) for x in dates[:max_items]]
    if len(dates) > max_items:
        items.append("…")
    return ", ".join(items)

def format_dates_list_ascii(dates: list[str], max_items: int = 8) -> str:
    """'18 Nov 2025, 19 Nov 2025, ...' using ASCII '...' to avoid mojibake."""
    if not dates:
        return ""
    items = [fmt_date(x) for x in dates[:max_items]]
    if len(dates) > max_items:
        items.append("...")
    return ", ".join(items)

def make_caution_line(dates: list[str]) -> str:
    """Clear sentence for 1 vs many dates."""
    if not dates:
        return ""
    if len(dates) == 1:
        return f"Please don’t finalize deals or make large transactions on {fmt_date(dates[0])}; use another recommended day."
    return f"Please don’t finalize deals or make large transactions on: {format_dates_list_ascii(dates)}. Use another recommended day."

def best_day_within(days: List[Dict], start_iso: str, end_iso: str) -> Optional[Dict]:
    """Return the max-scoring day object within [start_iso, end_iso], else None."""
    slice_days = [d for d in days if start_iso <= d["date"] <= end_iso]
    if not slice_days:
        return None
    bd = max(slice_days, key=lambda x: x["score"])
    md = bd.get("meta", {}).get("dasha", {}).get("md")
    ad = bd.get("meta", {}).get("dasha", {}).get("ad")
    tags = bd.get("meta", {}).get("tags", [])
    return {
        "date": bd["date"],
        "score": bd["score"],
        "tags": tags + ([f"MD:{md}"] if md else []) + ([f"AD:{ad}"] if ad else [])
    }
