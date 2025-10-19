#goastrion-backend/astro/dasha/vimshottari.py
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Tuple, Optional

# Reuse your existing helpers
from ..ephem.swiss import compute_all_planets
from ..utils.astro import NAKSHATRAS


# --- Constants ---------------------------------------------------------------

# Vimshottari order & years (total = 120 years)
DASHA_ORDER: List[str] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS: Dict[str, int] = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}

# 27 Nakshatras → Lords (exactly aligned to your NAKSHATRAS order)
NAKSHATRA_LORDS: List[str] = [
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
]

# Sidereal year length (commonly used for Vimshottari timing)
VIMSOTTARI_YEAR_DAYS: float = 365.258756

# --- Data models -------------------------------------------------------------

@dataclass
class Period:
    lord: str
    start: datetime
    end: datetime
    years: float  # duration in years (float)

@dataclass
class DashaTimeline:
    mahadashas: List[Period]
    antardashas: Dict[str, List[Period]]  # key = "<MD_lord>@<start_iso>"

# --- Core helpers ------------------------------------------------------------

def _nakshatra_index_and_fraction(moon_lon: float) -> Tuple[int, float]:
    """
    Returns (nakshatra_index, fraction_elapsed_in_that_nakshatra 0..1)
    """
    seg = 360.0 / 27.0
    idx = int(moon_lon // seg) % 27
    within = moon_lon - (idx * seg)             # degrees within current nakshatra
    frac = within / seg                          # 0..1 elapsed
    return idx, frac

def _rotate_to_start(order: List[str], start_lord: str) -> List[str]:
    i = order.index(start_lord)
    return order[i:] + order[:i]

def _add_years(dt: datetime, years: float) -> datetime:
    # Use sidereal-year-based timedelta
    days = years * VIMSOTTARI_YEAR_DAYS
    return dt + timedelta(days=days)

def _fmt_key(period: Period) -> str:
    return f"{period.lord}@{period.start.replace(tzinfo=timezone.utc).isoformat()}"

# --- Public API --------------------------------------------------------------

def compute_vimshottari_mahadasha(
    dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float = 0.0,
    horizon_years: float = 120.0
) -> List[Period]:
    """
    Compute Mahadasha chain from birth instant, including balance of first MD.
    IMPORTANT: dt_utc must truly be UTC if tz_offset_hours=0.0.
    Returns list of Periods (lord, start, end, years) in UTC.
    """
    # 1) Get sidereal Moon longitude at birth.
    #    We pass tz_offset_hours straight through. If dt_utc is truly UTC,
    #    set tz_offset_hours=0.0 to avoid double-adjustment.
    _, positions = compute_all_planets(dt_utc, lat, lon, tz_offset_hours, ayanamsa="lahiri")
    moon_lon = positions["Moon"]

    # 2) Nakshatra & starting MD lord
    nak_idx, frac_elapsed = _nakshatra_index_and_fraction(moon_lon)
    start_lord = NAKSHATRA_LORDS[nak_idx]

    # 3) Balance of starting MD
    md_total_years = DASHA_YEARS[start_lord]
    balance_years = md_total_years * (1.0 - frac_elapsed)

    # 4) Build full MD sequence (start with balance, then rotate through order)
    seq: List[Period] = []
    t0 = dt_utc
    t1 = _add_years(t0, balance_years)
    seq.append(Period(lord=start_lord, start=t0, end=t1, years=balance_years))

    rotated = _rotate_to_start(DASHA_ORDER, start_lord)[1:]  # exclude first (already added as balance)
    # Keep adding full MD cycles until we cross the horizon
    total_years = balance_years
    current_start = t1
    while total_years < horizon_years - 1e-6:
        for lord in rotated:
            yrs = float(DASHA_YEARS[lord])
            next_end = _add_years(current_start, yrs)
            seq.append(Period(lord=lord, start=current_start, end=next_end, years=yrs))
            current_start = next_end
            total_years += yrs
            if total_years >= horizon_years - 1e-6:
                break

    return seq

def compute_antardashas_for_mahadasha(md: Period) -> List[Period]:
    """
    Compute Antardasha (Bhukti) list within a given Mahadasha period.
    Rule: AD duration = MD_duration * (AD_lord_years / 120).
    Order starts from the MD lord itself, then follows Vimshottari order.
    """
    md_years = md.years
    ad_order = _rotate_to_start(DASHA_ORDER, md.lord)
    ads: List[Period] = []
    cursor = md.start
    for lord in ad_order:
        portion = DASHA_YEARS[lord] / 120.0
        yrs = md_years * portion
        end = _add_years(cursor, yrs)
        # Clamp to MD end (avoid cumulative rounding drift)
        if end > md.end:
            end = md.end
            yrs = (end - cursor).days / VIMSOTTARI_YEAR_DAYS
        ads.append(Period(lord=lord, start=cursor, end=end, years=yrs))
        cursor = end
        if cursor >= md.end:
            break
    return ads

def compute_vimshottari_full(
    dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float = 0.0,
    horizon_years: float = 120.0
) -> DashaTimeline:
    """
    Convenience: Mahadashas + Antardashas for each MD within horizon.
    IMPORTANT: If dt_utc is true UTC, pass tz_offset_hours=0.0.
    """
    mds = compute_vimshottari_mahadasha(dt_utc, lat, lon, tz_offset_hours, horizon_years)
    ad_map: Dict[str, List[Period]] = {}
    for md in mds:
        key = _fmt_key(md)
        ad_map[key] = compute_antardashas_for_mahadasha(md)
    return DashaTimeline(mahadashas=mds, antardashas=ad_map)

# --- Pretty printing (terminal) ---------------------------------------------

def print_vimshottari(
    timeline: DashaTimeline, *, show_antardashas: bool = True, limit_md: Optional[int] = None
) -> None:
    def fmt(p: Period) -> str:
        return f"{p.lord:8s} | {p.start.strftime('%Y-%m-%d')} → {p.end.strftime('%Y-%m-%d')} | {p.years:6.3f}y"

    print("===== Vimshottari Mahadasha =====")
    for i, md in enumerate(timeline.mahadashas):
        if limit_md is not None and i >= limit_md:
            break
        print("MD ", fmt(md))
        if show_antardashas:
            key = _fmt_key(md)
            for ad in timeline.antardashas.get(key, []):
                print("   └─ AD", fmt(ad))

# --- Debug helpers -----------------------------------------------------------

def debug_birth_moon(dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float = 0.0) -> None:
    """
    Print Moon longitude, nakshatra, fraction elapsed, start lord, and starting MD balance.
    Helpful to sanity-check timezone handling.
    """
    _, positions = compute_all_planets(dt_utc, lat, lon, tz_offset_hours, ayanamsa="lahiri")
    moon_lon = positions["Moon"]

    seg = 360.0 / 27.0
    nak_idx, frac_elapsed = _nakshatra_index_and_fraction(moon_lon)
    start_lord = NAKSHATRA_LORDS[nak_idx]
    md_total_years = DASHA_YEARS[start_lord]
    balance_years = md_total_years * (1.0 - frac_elapsed)

    print("---- DEBUG: Birth Moon ----")
    print(f"UTC datetime     : {dt_utc.isoformat()}  (tz_offset_hours used: {tz_offset_hours})")
    print(f"Moon longitude   : {moon_lon:.5f}°")
    print(f"Nakshatra        : {NAKSHATRAS[nak_idx]} (index {nak_idx})")
    print(f"Fraction elapsed : {frac_elapsed*100:.3f}%")
    print(f"Start MD lord    : {start_lord}")
    print(f"Start MD balance : {balance_years:.5f} years (~{balance_years*12:.2f} months)")
    print("----------------------------")

def build_debug_context(dt_utc: datetime, lat: float, lon: float, tz_offset_hours: float = 0.0) -> Dict[str, str]:
    """
    Returns a dict with UTC time, Moon longitude, Nakshatra, fraction elapsed,
    start MD lord, and starting MD balance (years & months).
    """
    _, positions = compute_all_planets(dt_utc, lat, lon, tz_offset_hours)
    moon_lon = positions["Moon"]

    seg = 360.0 / 27.0
    idx = int(moon_lon // seg) % 27
    within = moon_lon - (idx * seg)
    frac = within / seg  # 0..1 elapsed

    start_lord = NAKSHATRA_LORDS[idx]
    md_total_years = DASHA_YEARS[start_lord]
    balance_years = md_total_years * (1.0 - frac)

    return {
        "utc": dt_utc.replace(tzinfo=timezone.utc).isoformat(),
        "tz_used": f"{tz_offset_hours}",
        "moon_lon": f"{moon_lon:.5f}°",
        "nakshatra": f"{NAKSHATRAS[idx]} (index {idx})",
        "frac_elapsed_pct": f"{frac*100:.3f}%",
        "start_lord": start_lord,
        "start_balance_years": f"{balance_years:.5f} years",
        "start_balance_months": f"~{balance_years*12:.2f} months",
    }



def print_mahadashas_only(
    timeline: DashaTimeline,
    limit_md: Optional[int] = None,
    debug_header: Optional[Dict[str, str]] = None,
) -> None:
    """Quick look: print only Mahadashas (no Antardashas)."""
    if debug_header:
        print("---- DEBUG (Birth Context) ----")
        print(f"UTC datetime     : {debug_header['utc']}  (tz_offset_hours used: {debug_header['tz_used']})")
        print(f"Moon longitude   : {debug_header['moon_lon']}")
        print(f"Nakshatra        : {debug_header['nakshatra']}")
        print(f"Fraction elapsed : {debug_header['frac_elapsed_pct']}")
        print(f"Start MD lord    : {debug_header['start_lord']}")
        print(f"Start MD balance : {debug_header['start_balance_years']} ({debug_header['start_balance_months']})")
        print("-------------------------------")

    def fmt(p: Period) -> str:
        return f"{p.lord:8s} | {p.start.strftime('%Y-%m-%d')} → {p.end.strftime('%Y-%m-%d')} | {p.years:6.3f}y"

    print("===== Vimshottari Mahadasha (Quick View) =====")
    for i, md in enumerate(timeline.mahadashas):
        if limit_md is not None and i >= limit_md:
            break
        print(fmt(md))



def print_mahadasha_with_antardasha(timeline: DashaTimeline, limit_md: Optional[int] = None) -> None:
    """Detailed: print Mahadashas and their Antardashas."""
    def fmt(p: Period) -> str:
        return f"{p.lord:8s} | {p.start.strftime('%Y-%m-%d')} → {p.end.strftime('%Y-%m-%d')} | {p.years:6.3f}y"

    print("===== Vimshottari Mahadasha + Antardasha =====")
    for i, md in enumerate(timeline.mahadashas):
        if limit_md is not None and i >= limit_md:
            break
        print("MD ", fmt(md))
        key = _fmt_key(md)
        for ad in timeline.antardashas.get(key, []):
            print("   └─ AD", fmt(ad))

if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Compute Vimshottari Mahadasha & Antardasha")
    ap.add_argument("--date", required=True, help="Birth date in YYYY-MM-DD (local civil time)")
    ap.add_argument("--time", required=True, help="Birth time in HH:MM[:SS] (24h, local civil time)")
    ap.add_argument("--lat", type=float, required=True)
    ap.add_argument("--lon", type=float, required=True)
    ap.add_argument("--tz", type=float, default=0.0, help="Timezone offset hours (e.g., +5.5 for IST)")
    ap.add_argument("--years", type=float, default=120.0, help="Horizon years to compute")
    ap.add_argument("--limit-md", type=int, default=None, help="Limit number of Mahadashas to print")
    ap.add_argument("--md-only", action="store_true", help="Print only Mahadashas (no Antardashas)")
    ap.add_argument("--debug", action="store_true", help="Print Moon/nakshatra/start-lord/balance sanity")

    args = ap.parse_args()

    from datetime import datetime, timedelta

    # Local → UTC once
    date_parts = [int(x) for x in args.date.split("-")]
    tparts = [int(x) for x in args.time.split(":")] + [0, 0]
    tparts = tparts[:3]
    local_dt = datetime(date_parts[0], date_parts[1], date_parts[2], tparts[0], tparts[1], tparts[2])
    dt_utc = local_dt - timedelta(hours=args.tz)

    # Build timeline
    tl = compute_vimshottari_full(dt_utc, args.lat, args.lon, tz_offset_hours=0.0, horizon_years=args.years)

    # Build debug header for the quick-view (uses the same corrected TZ handling)
    dbg = build_debug_context(dt_utc, args.lat, args.lon, tz_offset_hours=0.0)

    # Print according to choice
    if args.md_only:
        print_mahadashas_only(tl, limit_md=args.limit_md, debug_header=dbg)
    else:
        # If you also want the header in detailed view, you can print it here too:
        print_mahadashas_only(tl, limit_md=args.limit_md, debug_header=dbg)
        print()  # blank line
        print_mahadasha_with_antardasha(tl, limit_md=args.limit_md)

