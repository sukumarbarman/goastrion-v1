# goastrion-backend/astro/services/daily_core.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone, date
from typing import Any, Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo
import re

# --- project deps ---
from ..utils.time import parse_client_iso_to_aware_utc
from ..utils.config import load_config
from ..ephem.swiss import compute_all_planets, compute_angles
from ..dasha.vimshottari import compute_vimshottari_full, DashaTimeline
from ..domain.transits import compute_transit_hits_now

# --- optional Panchang (if your util exists) ---
try:
    # expected signature -> dict like {"rahu": (start_dt, end_dt), "yama": (...), "gulika": (...)}
    from ..utils.panchang import dayparts_rahu_yama_gulika  # type: ignore
except Exception:  # pragma: no cover
    dayparts_rahu_yama_gulika = None  # fallback later


# ---------------------- small error type ---------------------- #

class DailyError(Exception):
    """Raised for bad inputs or assembly-time failures."""


# ---------------------- constants & small maps ---------------------- #

BENEFIC = {"Jupiter", "Venus", "Moon", "Mercury"}
MALEFIC = {"Saturn", "Mars", "Rahu", "Ketu"}

COLOR = {
    "Sun": "saffron/gold", "Moon": "white/silver", "Mars": "red/rust", "Mercury": "green",
    "Jupiter": "yellow", "Venus": "white/pastel", "Saturn": "navy/indigo", "Rahu": "grey", "Ketu": "earthy orange"
}
MANTRA = {
    "Sun":     "Om Suryaya Namah",
    "Moon":    "Om Chandraya Namah",
    "Mars":    "Om Mangalaya Namah",
    "Mercury": "Om Budhaya Namah",
    "Jupiter": "Om Gurave Namah",
    "Venus":   "Om Shukraya Namah",
    "Saturn":  "Om Shanaye Namah",
    "Rahu":    "Om Rahave Namah",
    "Ketu":    "Om Ketave Namah",
}
OPTIONAL = {
    "Sun": "ghee diya; share guidance/mentor someone",
    "Moon": "offer water/rice; check on family wellbeing",
    "Mars": "mustard-oil diya; finish one tough pending task",
    "Mercury": "moong/tulsi; send one clear, honest email",
    "Jupiter": "ghee diya; donate books/teach",
    "Venus": "sweets/flowers; tidy workspace/wardrobe",
    "Saturn": "sesame-oil diya at dusk; help a daily-wage worker",
    "Rahu": "10-min digital detox; support road-safety/blanket charity",
    "Ketu": "10-min declutter/journaling; feed birds/dogs"
}

# Assets for trading lines
VALID_ASSETS = {"gold", "silver", "stocks", "crypto", "crude"}


# ---------------------- helpers ---------------------- #

def _tz(tz_str: str) -> ZoneInfo:
    """Safe ZoneInfo with fallback."""
    try:
        return ZoneInfo((tz_str or "Asia/Kolkata").strip())
    except Exception:
        return ZoneInfo("Asia/Kolkata")


# we keep last birth context so split modules can fetch MD/AD without re-threading args
_LAST_BIRTH_CONTEXT: Dict[str, Any] = {}

def parse_birth_or_legacy(data: Dict[str, Any]) -> Tuple[datetime, float, float]:
    """
    Accepts legacy {datetime,lat,lon} OR birth{date,time,lat,lon}.
    Returns aware UTC datetime + lat/lon.
    Side-effect: stores values in _LAST_BIRTH_CONTEXT for other helpers.
    """
    if "datetime" in data and "lat" in data and "lon" in data:
        dt_aw = parse_client_iso_to_aware_utc(str(data.get("datetime")).strip())
        lat = float(data.get("lat")); lon = float(data.get("lon"))
        _LAST_BIRTH_CONTEXT.update({"dt_aw": dt_aw, "lat": lat, "lon": lon})
        return dt_aw, lat, lon
    b = data.get("birth") or {}
    if not all(k in b for k in ("date", "time", "lat", "lon")):
        raise DailyError("Missing birth fields (need date, time, lat, lon) or legacy datetime/lat/lon.")
    dt_aw = parse_client_iso_to_aware_utc(f"{b['date']}T{b['time']}:00Z")
    lat = float(b["lat"]); lon = float(b["lon"])
    _LAST_BIRTH_CONTEXT.update({"dt_aw": dt_aw, "lat": lat, "lon": lon})
    return dt_aw, lat, lon


def natal_points(dt_naive_utc: datetime, lat: float, lon: float) -> Dict[str, float]:
    angles = compute_angles(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")
    _, natal = compute_all_planets(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")
    pts: Dict[str, float] = {}
    if angles.get("Asc") is not None: pts["Asc"] = float(angles["Asc"])
    if angles.get("MC")  is not None: pts["MC"]  = float(angles["MC"])
    for k, v in natal.items(): pts[k] = float(v)
    return pts


def current_md_ad(tl: Optional[DashaTimeline], day: date) -> Tuple[Optional[str], Optional[str]]:
    """
    Return (MD, AD) for given day.
    If timeline is None, we rebuild from the last seen birth context.
    """
    if tl is None:
        ctx = _LAST_BIRTH_CONTEXT
        dt_aw = ctx.get("dt_aw"); lat = ctx.get("lat"); lon = ctx.get("lon")
        if dt_aw is None or lat is None or lon is None:
            return None, None
        tl = compute_vimshottari_full(dt_aw, float(lat), float(lon), 0.0, horizon_years=120.0)

    md = ad = None
    for mdp in tl.mahadashas:
        if mdp.start.date() <= day <= mdp.end.date():
            md = mdp.lord
            key = f"{mdp.lord}@{mdp.start.replace(tzinfo=timezone.utc).isoformat()}"
            for adp in tl.antardashas.get(key, []):
                if adp.start.date() <= day <= adp.end.date():
                    ad = adp.lord
                    break
            break
    return md, ad


# ---------------------- ASCII and romanize ---------------------- #

def _asciiify(s: str) -> str:
    if not isinstance(s, str):
        return s
    return (s.replace("–", "-")
             .replace("—", "-")
             .replace("→", "->")
             .replace("×", "x")
             .replace("’", "'")
             .replace("‘", "'")
             .replace("“", '"').replace("”", '"'))

_ROMAN_MAP = {
    "ā": "aa", "ī": "ii", "ū": "uu", "ṅ": "ng", "ñ": "ny", "ṃ": "m",
    "ś": "sh", "ṣ": "sh", "ṅg": "ng", "ṭ": "t", "ḍ": "d", "ṇ": "n",
    "ṛ": "ri", "ṝ": "rri", "ḷ": "l", "ḹ": "l",
    "Ā": "Aa", "Ī": "Ii", "Ū": "Uu", "Ś": "Sh", "Ṣ": "Sh", "Ṇ": "N",
    "Ṭ": "T", "Ḍ": "D", "Ṛ": "Ri", "Ṝ": "Rr", "Ḷ": "L", "Ḹ": "L",
    "ṅ": "ng", "ḻ": "l", "é": "e", "á": "a", "í": "i", "ó": "o", "ú": "u"
}
def _romanize(s: str) -> str:
    out = []
    for ch in s:
        out.append(_ROMAN_MAP.get(ch, ch))
    return "".join(out)


# ---------------------- support / stress scoring ---------------------- #

def _get_aspect_cfg(aspect_cfg: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if aspect_cfg is not None:
        return aspect_cfg
    cfg, _ = load_config()
    return cfg

def support_stress_scores(
    aspect_cfg: Optional[Dict[str, Any]],
    natal_pts: Dict[str, float],
    sample_dt: datetime,
    lat: float, lon: float,
    md: Optional[str], ad: Optional[str],
) -> Tuple[Dict[str, float], Dict[str, float], Dict[str, Any]]:
    """
    Returns per-planet Support & Stress (0..100), plus 'why' tags.
    """
    aspect_cfg = _get_aspect_cfg(aspect_cfg)
    hits = compute_transit_hits_now(
        dt_naive_utc=sample_dt, lat=lat, lon=lon, natal_points=natal_pts, aspect_cfg=aspect_cfg
    )
    support: Dict[str, float] = {p: 0.0 for p in COLOR.keys()}
    stress:  Dict[str, float] = {p: 0.0 for p in COLOR.keys()}
    tags_support: List[str] = []
    tags_stress: List[str] = []

    aspect_map = {a["name"]: float(a.get("baseWeight", a.get("weight", 1.0)))
                  for a in aspect_cfg.get("aspects", [])}

    for h in hits.get("aspect", []):
        p = h["planet"]; a = h["aspect"]; s = float(h["score"])
        w = aspect_map.get(a, 1.0)
        if p in BENEFIC and a in {"Trine", "Sextile", "Conjunction"}:
            support[p] += s * w
            tags_support.append(f"{p} {a} -> {h['target']}")
        if p in MALEFIC and a in {"Square", "Opposition", "Conjunction"}:
            stress[p] += s * w
            tags_stress.append(f"{p} {a} -> {h['target']}")

    # dasha sensitivity/bias
    for p in support.keys():
        if p == md: support[p] *= 1.20; stress[p] *= 1.05
        if p == ad: support[p] *= 1.10; stress[p] *= 1.03

    def _norm(d: Dict[str, float]) -> Dict[str, float]:
        mx = max(d.values()) if d else 0.0
        if mx <= 0:
            return {k: 0.0 for k in d.keys()}
        return {k: round(100.0 * v / mx, 2) for k, v in d.items()}

    return _norm(support), _norm(stress), {
        "tags_support": list(dict.fromkeys(tags_support))[:4],
        "tags_stress":  list(dict.fromkeys(tags_stress))[:4],
    }


# ---------------------- window logic (practical) ---------------------- #

def _hhmm(dt: datetime) -> str:
    return dt.strftime("%H:%M")

def _merge_ranges(ranges: List[Tuple[datetime, datetime]], min_len_min=25, max_merge_gap_min=5) -> List[Tuple[datetime, datetime]]:
    """Merge overlapping/contiguous ranges and drop very short ones."""
    if not ranges:
        return []
    ranges = sorted(ranges, key=lambda x: x[0])
    out = [ranges[0]]
    for s, e in ranges[1:]:
        ps, pe = out[-1]
        if s <= pe + timedelta(minutes=max_merge_gap_min):
            out[-1] = (ps, max(pe, e))
        else:
            out.append((s, e))
    return [(s, e) for (s, e) in out if (e - s).total_seconds() >= min_len_min * 60]


# ---- small perf cache for transit hits during sampling ----
_HITS_CACHE: Dict[str, Dict[str, Any]] = {}

def _hits_cached(dt_utc_naive: datetime, lat: float, lon: float, natal_pts: Dict[str, float], aspect_cfg: Dict[str, Any]) -> Dict[str, Any]:
    key = f"{dt_utc_naive.isoformat()}@{round(lat,4)}:{round(lon,4)}"
    if key not in _HITS_CACHE:
        _HITS_CACHE[key] = compute_transit_hits_now(
            dt_naive_utc=dt_utc_naive, lat=lat, lon=lon, natal_points=natal_pts, aspect_cfg=aspect_cfg
        )
    return _HITS_CACHE[key]


def sample_day_windows(
    tz: ZoneInfo, lat: float, lon: float, natal_pts: Dict[str, float],
    aspect_cfg: Optional[Dict[str, Any]] = None, day: Optional[date] = None
) -> Tuple[Dict[str, str], List[Dict[str, str]], List[Dict[str, str]], str]:
    """
    Practical day scan:
      • Samples 06:00–21:00 local every 30m for the given day
      • score = benefic - 0.9*malefic
      • Merges greens/cautions; picks longest future green for "best"
    """
    aspect_cfg = _get_aspect_cfg(aspect_cfg)

    now_l = datetime.now(tz)
    if day is None:
        day = now_l.date()
    start_l = datetime(day.year, day.month, day.day, 6, 0, 0, tzinfo=tz)
    end_l   = datetime(day.year, day.month, day.day, 21, 0, 0, tzinfo=tz)

    cursor = start_l
    samples: List[Tuple[datetime, float]] = []
    while cursor <= end_l:
        dt_utc = cursor.astimezone(timezone.utc).replace(tzinfo=None)
        hits = _hits_cached(dt_utc, lat, lon, natal_pts, aspect_cfg)
        bene = sum(h["score"] for h in hits.get("aspect", [])
                   if h["planet"] in BENEFIC and h["aspect"] in {"Trine", "Sextile", "Conjunction"})
        male = sum(h["score"] for h in hits.get("aspect", [])
                   if h["planet"] in MALEFIC and h["aspect"] in {"Square", "Opposition", "Conjunction"})
        score = bene - 0.9 * male
        samples.append((cursor, score))
        cursor += timedelta(minutes=30)

    if not samples:
        return {}, [], [], "supportive timing"

    # Thresholds: top 25% = green, bottom 15% = caution
    values = [s for _, s in samples]
    v_sorted = sorted(values)
    def pct(p: float) -> float:
        idx = max(0, min(len(v_sorted) - 1, int(round((len(v_sorted) - 1) * p))))
        return v_sorted[idx]

    green_cut = pct(0.75)
    caution_cut = pct(0.15)

    greens_slots = [(t - timedelta(minutes=15), t + timedelta(minutes=15)) for (t, s) in samples if s >= green_cut]
    caut_slots   = [(t - timedelta(minutes=20), t + timedelta(minutes=20)) for (t, s) in samples if s <= caution_cut]

    greens = _merge_ranges(greens_slots, min_len_min=25, max_merge_gap_min=5)
    cauts  = _merge_ranges(caut_slots,   min_len_min=25, max_merge_gap_min=5)

    # Future-aware: prefer windows starting >= now
    greens_future = [r for r in greens if r[1] >= now_l]
    choose_pool = greens_future or greens
    best_block = max(choose_pool, key=lambda r: (r[1] - r[0]).total_seconds()) if choose_pool else None

    def fmt_block(b: Tuple[datetime, datetime]) -> Dict[str, str]:
        return {"start": _hhmm(b[0]), "end": _hhmm(b[1])}

    best = fmt_block(best_block) if best_block else {}

    # reason: choose the strongest benefic hit at the mid of best
    reason = "supportive timing"
    if best_block:
        mid = best_block[0] + (best_block[1] - best_block[0]) / 2
        dt_utc_mid = mid.astimezone(timezone.utc).replace(tzinfo=None)
        hmid = _hits_cached(dt_utc_mid, lat, lon, natal_pts, aspect_cfg)
        bene_hits = [h for h in hmid.get("aspect", [])
                     if h["planet"] in BENEFIC and h["aspect"] in {"Trine", "Sextile", "Conjunction"}]
        if bene_hits:
            h0 = max(bene_hits, key=lambda x: x["score"])
            reason = f"{h0['planet']} {h0['aspect']} {h0['target']}"

    greens_ui = [fmt_block(b) for b in greens_future[:2]] if greens_future else ([best] if best else [])
    cautions_ui = [fmt_block(b) for b in cauts[:2]]

    return best, greens_ui, cautions_ui, reason


# ---------------------- energy ---------------------- #

def _best_block_minutes(best_win: Optional[Dict[str, str]]) -> int:
    if not best_win or "start" not in best_win or "end" not in best_win:
        return 0
    try:
        h1, m1 = map(int, best_win["start"].split(":"))
        h2, m2 = map(int, best_win["end"].split(":"))
        return max(0, (h2*60 + m2) - (h1*60 + m1))
    except Exception:
        return 0

def _energy_score(support: Dict[str, float], stress: Dict[str, float],
                  md: Optional[str], ad: Optional[str],
                  reason: str, best_win: Optional[Dict[str, str]]) -> int:
    """
    Energy uses contrast of support vs stress, with contextual bonuses:
      + strong benefic reason (Trine) and long green block
      + benefic MD/AD; malefic MD/AD small headwinds
    Typical range: 55–88 (rarely hits the edges).
    """
    s_max = max(support.values()) if support else 50.0
    t_max = max(stress.values()) if stress else 0.0

    # Base contrast
    base = 50.0 + 0.35 * s_max - 0.22 * t_max

    # Dasha nudges
    def push(p: Optional[str], pos: float, neg: float) -> float:
        if not p:
            return 0.0
        return (pos if p in BENEFIC else (-neg if p in MALEFIC else 0.0))
    base += push(md, 2.0, 2.0)
    base += push(ad, 1.5, 1.5)

    # Contextual positivity
    if "Trine" in reason and any(k in reason for k in ("Venus", "Jupiter", "Moon")):
        base += 3.0
    length_min = _best_block_minutes(best_win)
    if length_min >= 90:
        base += 2.5
    elif length_min >= 60:
        base += 1.5

    energy = int(round(max(55.0, min(88.0, base))))
    return energy


# ---------------------- intent bundle (simple heuristics) ---------------------- #

def _intent_score_bundle(
    support: Dict[str, float], stress: Dict[str, float],
    md: Optional[str], ad: Optional[str],
) -> Dict[str, float]:
    s = support; t = stress

    def v(d: Dict[str, float], k: str) -> float:
        return float(d.get(k, 0.0))

    # Baselines
    deep_work    = 0.6*v(s, "Mercury") + 0.3*v(s, "Saturn") + 0.2*v(s, "Sun") - 0.2*v(t, "Mars")
    creative     = 0.6*v(s, "Venus") + 0.3*v(s, "Mercury") + 0.2*v(s, "Moon") - 0.2*v(t, "Saturn")
    repair_rel   = 0.7*v(s, "Venus") + 0.2*v(s, "Moon") - 0.25*v(t, "Mars") - 0.15*v(t, "Saturn")
    shopping     = 0.7*v(s, "Venus") + 0.3*v(s, "Jupiter") - 0.2*v(t, "Saturn")
    big_purchase = 0.55*v(s, "Jupiter") + 0.35*v(s, "Venus") - 0.25*v(t, "Saturn")
    legal        = 0.55*v(s, "Jupiter") + 0.35*v(s, "Mercury") + 0.2*v(s, "Saturn")
    contracts    = 0.5*v(s, "Mercury") + 0.5*v(s, "Saturn")
    outreach     = 0.6*v(s, "Mercury") + 0.25*v(s, "Venus") - 0.2*v(t, "Saturn")
    health_pace  = 0.6*v(s, "Moon") + 0.2*v(s, "Venus") - 0.2*v(t, "Saturn") - 0.2*v(t, "Mars")
    trading      = 0.65*v(s, "Mercury") + 0.3*v(s, "Jupiter") - 0.25*v(t, "Rahu") - 0.2*v(t, "Ketu")
    driving_cau  = 0.6*v(t, "Mars") + 0.3*v(t, "Saturn")
    spam_cau     = 0.6*v(t, "Rahu") + 0.3*v(t, "Mercury")
    family_kids  = 0.55*v(s, "Moon") + 0.25*v(s, "Venus") - 0.2*v(t, "Saturn")

    # Dasha nudges (gentle)
    def bump(x: float, lord: Optional[str]) -> float:
        if not lord: return x
        if lord in BENEFIC: return x * 1.05
        if lord in MALEFIC: return x * 0.98
        return x

    bundle = {
        "deep_work": bump(deep_work, md),
        "creative": bump(creative, md),
        "repair_relationship": bump(repair_rel, md),
        "shopping": bump(shopping, md),
        "big_purchase": bump(big_purchase, md),
        "legal": bump(legal, md),
        "contracts": bump(contracts, md),
        "outreach": bump(outreach, md),
        "health_pace": bump(health_pace, md),
        "trading": bump(trading, md),
        "driving_caution": bump(driving_cau, ad),
        "spam_caution": bump(spam_cau, ad),
        "family_kids": bump(family_kids, md),
    }
    return bundle


# ---------------------- daily focus (comm / travel / trading) ---------------------- #

def _fmt_block_hhmm_pair(s: datetime, e: datetime) -> Dict[str, str]:
    return {"start": _hhmm(s), "end": _hhmm(e)}

def _derive_daily_focus(
    tz: ZoneInfo,
    lat: float, lon: float,
    day: date,
    support: Dict[str, float],
    stress: Dict[str, float],
    best: Optional[Dict[str, str]],
    greens: List[Dict[str, str]],
    cautions: List[Dict[str, str]],
) -> Dict[str, Any]:
    """
    Produces user-facing daily_focus with very simple language:
      - communication.best/avoid
      - travel.avoid
      - trading.avoid/best (market hours: NSE 09:15–15:30 IST)
    """
    # Communication best if Merc/Jup supportive
    comm_best: List[Dict[str, str]] = []
    if (support.get("Mercury", 0.0) + support.get("Jupiter", 0.0)) >= 120.0:
        if best and best.get("start") and best.get("end"):
            comm_best.append({"start": best["start"], "end": best["end"]})
        elif greens:
            comm_best.append(greens[0])

    comm_avoid: List[Dict[str, str]] = []
    travel_avoid: List[Dict[str, str]] = []
    trading_avoid: List[Dict[str, str]] = []
    trading_best: List[Dict[str, str]] = []

    # Panchang overlay (if available)
    if dayparts_rahu_yama_gulika is not None:
        try:
            p = dayparts_rahu_yama_gulika(day, lat, lon, tz)  # {"rahu": (s,e), "yama": (s,e), "gulika": (s,e)}
            if p.get("rahu"):
                rs, re = p["rahu"]; comm_avoid.append(_fmt_block_hhmm_pair(rs, re)); travel_avoid.append(_fmt_block_hhmm_pair(rs, re))
            if p.get("yama"):
                ys, ye = p["yama"]; travel_avoid.append(_fmt_block_hhmm_pair(ys, ye))
            if p.get("gulika"):
                gs, ge = p["gulika"]; travel_avoid.append(_fmt_block_hhmm_pair(gs, ge))
        except Exception:
            pass

    # Fallbacks
    if not comm_avoid and cautions:
        comm_avoid.append(cautions[0])
    if not travel_avoid and cautions:
        travel_avoid.append(cautions[0])

    # Trading: NSE hours
    market_s = datetime(day.year, day.month, day.day, 9, 15, tzinfo=tz)
    market_e = datetime(day.year, day.month, day.day, 15, 30, tzinfo=tz)

    def _intersect(hhmm_block: Dict[str, str]) -> Optional[Dict[str, str]]:
        try:
            sh, sm = map(int, hhmm_block["start"].split(":"))
            eh, em = map(int, hhmm_block["end"].split(":"))
            s = datetime(day.year, day.month, day.day, sh, sm, tzinfo=tz)
            e = datetime(day.year, day.month, day.day, eh, em, tzinfo=tz)
            start = max(s, market_s); end = min(e, market_e)
            if start < end:
                return _fmt_block_hhmm_pair(start, end)
        except Exception:
            return None
        return None

    for blk in (comm_avoid + cautions):
        x = _intersect(blk)
        if x:
            trading_avoid.append(x)

    def _inside_market(blk: Dict[str, str]) -> bool:
        try:
            sh, sm = map(int, blk["start"].split(":"))
            eh, em = map(int, blk["end"].split(":"))
            s = datetime(day.year, day.month, day.day, sh, sm, tzinfo=tz)
            e = datetime(day.year, day.month, day.day, eh, em, tzinfo=tz)
            return s >= market_s and e <= market_e
        except Exception:
            return False

    if (support.get("Mercury", 0.0) + support.get("Jupiter", 0.0)) >= 120.0:
        if best and _inside_market(best):
            trading_best.append(best)
        else:
            for g in greens:
                if _inside_market(g):
                    trading_best.append(g)
                    break

    return {
        "communication": {
            "best": comm_best[:1],
            "avoid": comm_avoid[:1],
            "note": "Use the best window for official and personal talks.",
        },
        "travel": {
            "avoid": travel_avoid[:2],
            "note": "Delay non-essential travel in the avoid windows.",
        },
        "trading": {
            "market_hours": {"start": "09:15", "end": "15:30"},
            "best": trading_best[:1],
            "avoid": trading_avoid[:2],
            "note": "Stay disciplined; avoid trades in the marked windows.",
        },
    }


# ---------------------- Do / Don’t composer (simple phrasing) ---------------------- #

def _mk_action(kind: str, text: str, score: float,
               window: Optional[Dict[str, str]] = None,
               category: str = "", reason: Optional[str] = None,
               key: Optional[str] = None, args: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "kind": kind,                 # "do" or "dont"
        "text": text,                 # human line (fallback EN)
        "score": round(float(score), 2),
        "window": window or {},       # {start,end}
        "category": category,         # e.g., "deep_work","comm","travel","trading"
        "reason": reason or "",       # optional short cause
        "key": key or "",             # i18n key hint, e.g., "DO_TALK_MEET_WINDOW"
        "args": args or {},           # formatting args for i18n
    }

_WS = re.compile(r"\s+")
def _canon_text(s: str) -> str:
    s = (s or "").replace("–", "-").replace("—", "-").replace("→", "->")
    return _WS.sub(" ", s.strip().lower())

def _dedupe_actions(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set = set()
    out: List[Dict[str, Any]] = []
    for it in items:
        key = _canon_text(it.get("text", "")) or f"{it.get('category','')}|{it.get('kind','')}"
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    return out


def _compose_dos_donts(
    bundle: Dict[str, float],
    focus: Dict[str, Any],
    best_win: Optional[Dict[str, str]],
    caution_wins: List[Dict[str, str]],
    energy: int,
    cap_do: int = 3,
    cap_dont: int = 2,
) -> Dict[str, List[Dict[str, Any]]]:
    do_items: List[Dict[str, Any]] = []
    dont_items: List[Dict[str, Any]] = []

    cb = (focus.get("communication", {}) or {}).get("best") or []
    ca = (focus.get("communication", {}) or {}).get("avoid") or []
    trb = (focus.get("trading", {}) or {}).get("best") or []
    tra = (focus.get("trading", {}) or {}).get("avoid") or []
    trv = (focus.get("travel", {}) or {}).get("avoid") or []

    # Priority windows (very simple language)
    if cb:
        w = cb[0]
        do_items.append(_mk_action(
            "do", f"Talk or meet {w['start']}-{w['end']}.",
            1000, window=w, category="comm",
            key="DO_TALK_MEET_WINDOW", args={"start": w["start"], "end": w["end"]}
        ))
        # Small nudge to send an update within the comm best
        do_items.append(_mk_action(
            "do", f"Send a short follow-up by {w['end']}.",
            bundle.get("outreach", 0) + 5, window=w, category="networking",
            key="DO_FOLLOWUP_SHORT", args={"time": w["end"]}
        ))

    if trb:
        w = trb[0]
        do_items.append(_mk_action(
            "do", f"If trading, prefer {w['start']}-{w['end']} with strict stops.",
            996, window=w, category="trading",
            key="DO_TRADING_PREFER_WINDOW", args={"start": w["start"], "end": w["end"]}
        ))

    if ca:
        w = ca[0]
        dont_items.append(_mk_action(
            "dont", f"Avoid sensitive conversations {w['start']}-{w['end']}.",
            999, window=w, category="comm",
            key="DONT_AVOID_SENSITIVE_CONVOS_WINDOW", args={"start": w["start"], "end": w["end"]}
        ))
    if trv:
        w = trv[0]
        dont_items.append(_mk_action(
            "dont", f"Avoid travel {w['start']}-{w['end']}.",
            998, window=w, category="travel",
            key="DONT_AVOID_TRAVEL_WINDOW", args={"start": w["start"], "end": w["end"]}
        ))
    if tra:
        w = tra[0]
        dont_items.append(_mk_action(
            "dont", f"Avoid trading {w['start']}-{w['end']}.",
            997, window=w, category="trading",
            key="DONT_AVOID_TRADING_WINDOW", args={"start": w["start"], "end": w["end"]}
        ))

    # Core day actions from intents — simple phrasing
    if best_win and best_win.get("start") and best_win.get("end"):
        bw = f"{best_win['start']}-{best_win['end']}"
        do_items.append(_mk_action(
            "do", f"Use {bw} for creative work. Make a first draft.",
            bundle.get("creative", 0), best_win, "creative",
            key="DO_CREATIVE_WINDOW", args={"start": best_win["start"], "end": best_win["end"]}
        ))
        do_items.append(_mk_action(
            "do", f"Family time {bw}. Take a short walk or share a snack.",
            bundle.get("family_kids", 0), best_win, "family_kids",
            key="DO_FAMILY_TIME_WINDOW", args={"start": best_win["start"], "end": best_win["end"]}
        ))

        # Legal vs Contracts: pick phrasing based on which score is higher
        legal_s = bundle.get("legal", 0.0); contr_s = bundle.get("contracts", 0.0)
        if legal_s >= contr_s:
            do_items.append(_mk_action(
                "do", f"Paperwork {bw}. Check names, dates, and amounts.",
                max(legal_s, contr_s), best_win, "legal",
                key="DO_PAPERWORK_WINDOW", args={"start": best_win["start"], "end": best_win["end"]}
            ))
        else:
            do_items.append(_mk_action(
                "do", f"Do contracts {bw}. Read once more before signing.",
                max(legal_s, contr_s), best_win, "legal",
                key="DO_CONTRACTS_WINDOW", args={"start": best_win["start"], "end": best_win["end"]}
            ))
    else:
        do_items.append(_mk_action(
            "do", "Create for 30–45 min. Save one rough draft.",
            bundle.get("creative", 0), None, "creative",
            key="DO_CREATIVE_SHORT", args={}
        ))
        do_items.append(_mk_action(
            "do", "Send one short, friendly update.",
            bundle.get("outreach", 0), None, "networking",
            key="DO_OUTREACH_SHORT", args={}
        ))
        do_items.append(_mk_action(
            "do", "Clear 1–2 small admin tasks today.",
            bundle.get("legal", 0)*0.9, None, "admin",
            key="DO_ADMIN_CLEAR_SMALL", args={}
        ))

    # Safety / caution
    if caution_wins:
        cw = caution_wins[0]
        # Keep message simple; generic defensive driving
        dont_items.append(_mk_action(
            "dont", f"Drive carefully {cw['start']}-{cw['end']}.",
            bundle.get("driving_caution", 0), cw, "driving",
            key="DONT_DRIVE_DEFENSIVE_WINDOW", args={"start": cw["start"], "end": cw["end"]}
        ))
    # Spam caution is always relevant, but keep it short
    dont_items.append(_mk_action(
        "dont", "Ignore spam/unknown callers; block and report.",
        bundle.get("spam_caution", 0), None, "spam",
        key="DONT_BLOCK_SPAM", args={}
    ))

    # De-duplicate by text, keep top scores
    do_items = sorted(_dedupe_actions(do_items), key=lambda x: x["score"], reverse=True)[:cap_do]
    dont_items = sorted(_dedupe_actions(dont_items), key=lambda x: x["score"], reverse=True)[:cap_dont]

    return {"do": do_items, "dont": dont_items}
