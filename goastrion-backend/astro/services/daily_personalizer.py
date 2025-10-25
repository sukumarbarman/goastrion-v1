# goastrion-backend/astro/services/daily_personalizer.py
from __future__ import annotations

from datetime import datetime, timezone, timedelta, date
from typing import Any, Dict, List, Optional, Tuple
import re

# ---- shared helpers/constants live in daily_core.py (same package) ----
from .daily_core import (
    DailyError,
    BENEFIC, MALEFIC,
    COLOR, MANTRA, OPTIONAL, VALID_ASSETS,
    _tz, _asciiify, _romanize,
    parse_birth_or_legacy,
    natal_points,
    current_md_ad,
    support_stress_scores,
    sample_day_windows,
    _energy_score,
    _intent_score_bundle,
    _derive_daily_focus,
    _compose_dos_donts,
)

# Optional helper import for formatting time blocks (fallback below if missing)
try:
    from .daily_core import _fmt_block_hhmm_pair as _fmt_block_hhmm_pair_core  # type: ignore
except Exception:
    _fmt_block_hhmm_pair_core = None  # type: ignore

# Optional Panchang (if available in your utils)
try:
    from ..utils.panchang import dayparts_rahu_yama_gulika  # noqa: F401
except Exception:  # pragma: no cover
    dayparts_rahu_yama_gulika = None  # noqa: F401

# Optional: timezone auto-detection by lat/lon
try:
    from timezonefinder import TimezoneFinder  # pip install timezonefinder
    _TF = TimezoneFinder()
except Exception:
    _TF = None


# ---------------------- small optional "puja" suggestions ---------------------- #

_PUJA = {
    "Sun":     {"deity": "Surya",   "suggestion": "Offer water at sunrise; chant Aditya Hridayam (short)."},
    "Moon":    {"deity": "Shiva",   "suggestion": "Chant 'Om Namah Shivaya' 11x; drink more water today."},
    "Mars":    {"deity": "Hanuman", "suggestion": "Read Hanuman Chalisa 1x; offer sindoor."},
    "Mercury": {"deity": "Vishnu",  "suggestion": "Chant 'Om Namo Narayanaya' 11x; write one honest note."},
    "Jupiter": {"deity": "Guru",    "suggestion": "Offer yellow flowers; read a verse on wisdom."},
    "Venus":   {"deity": "Lakshmi", "suggestion": "Light a diya; tidy your space; share something sweet."},
    "Saturn":  {"deity": "Shani",   "suggestion": "Sesame-oil diya at dusk; read Shani stotra 1x."},
    "Rahu":    {"deity": "Durga",   "suggestion": "Short Durga stuti; avoid gossip; 10-min digital detox."},
    "Ketu":    {"deity": "Ganesha", "suggestion": "Offer durva grass; 5-min journaling/declutter."},
}


# ---------------------- helpers for more practical remedies ---------------------- #

def _day_period_from_best(best_win: Optional[Dict[str, str]]) -> str:
    """
    Return 'morning' | 'afternoon' | 'evening' | 'night' based on best window start.
    Fallback to 'afternoon' if unknown.
    """
    try:
        if not best_win or not best_win.get("start"):
            return "afternoon"
        h, _ = map(int, str(best_win["start"]).split(":"))
        if 5 <= h < 12:
            return "morning"
        if 12 <= h < 17:
            return "afternoon"
        if 17 <= h < 21:
            return "evening"
        return "night"
    except Exception:
        return "afternoon"


def _dedupe_wins(wins: Optional[List[Dict[str, str]]]) -> List[Dict[str, str]]:
    """Remove duplicate start/end windows."""
    out: List[Dict[str, str]] = []
    seen: set[Tuple[Optional[str], Optional[str]]] = set()
    for w in wins or []:
        k = (w.get("start"), w.get("end"))
        if k not in seen:
            seen.add(k)
            out.append(w)
    return out


def _enrich_donts(donts: List[Dict[str, Any]], msp: Optional[str]) -> List[Dict[str, Any]]:
    """
    If we only have the usual 'sensitive conversations' and 'travel',
    replace the second item with a planet-driven practical caution.
    """
    topic_by_msp = {
        "Mars":    "heated replies and confrontations",
        "Saturn":  "over-commitment and late-night work",
        "Rahu":    "doomscrolling and impulsive posts",
        "Ketu":    "abrupt exits or burning bridges",
        "Mercury": "signing documents without a second check",
        "Jupiter": "grand promises or big donations",
        "Venus":   "impulse shopping and overindulgence",
        "Moon":    "emotional decisions and late-night texting",
        "Sun":     "ego-driven announcements",
    }
    if not donts or len(donts) < 2:
        return donts

    cats = [d.get("category") for d in donts[:2]]
    if set(cats) == {"comm", "travel"}:
        keep = donts[0]
        replacement = {
            "kind": "dont",
            "text": f"Avoid {topic_by_msp.get(msp or '', 'impulsive decisions')}.",
            "score": max(d.get("score", 0) for d in donts) - 1,
            "category": "msp",
            "reason": "",
            # i18n
            "key": "DONT_AVOID_TOPIC_BY_MSP",
            "args": {"topic": topic_by_msp.get(msp or "", "impulsive decisions"), "msp": msp or ""},
        }
        return [keep, replacement] + donts[2:]
    return donts


def _optional_by_context(
    msp: Optional[str],
    energy: int,
    period: str,
    secular: bool,
    has_travel_caution: bool,
) -> str:
    """
    Build a short, practical 'optional' line based on top-stress planet (msp),
    energy, day-period, and whether travel caution exists.
    Keep it short (1 line), neutral, and secular-friendly by default.
    """
    # Generic fallbacks by energy
    low_energy = "Hydrate, 10-min stretch, keep tasks bite-sized."
    mid_energy = "Plan in 3 blocks; 10-min tidy between tasks."
    high_energy = "Batch messages; 15-min walk to reset focus."  # kept for future use

    # Planet-specific one-liners (pick by period where it helps)
    by_msp = {
        "Saturn": {
            "morning":  "2-min posture reset; list top 3 tasks only.",
            "afternoon":"Pay a small due; 10-min tidy desk.",
            "evening":  "Sunset walk 10-min; sleep on time.",
            "night":    "Light dinner; no screens 30-min before bed.",
            "generic":  "Help a daily-wage worker / tip fairly.",
        },
        "Rahu": {
            "morning":  "Delay socials till 10am; single-task first 30-min.",
            "afternoon":"Mute 2 distracting chats for 4h.",
            "evening":  "Digital sunset: no scrolling after 9pm.",
            "night":    "Airplane-mode before sleep; write 1 line you’re grateful for.",
            "generic":  "Declutter 5 items; avoid gossip loops.",
        },
        "Ketu": {
            "morning":  "Finish one loose end that takes <10-min.",
            "afternoon":"Archive 20 old emails/files.",
            "evening":  "Light declutter; plan one thing for tomorrow.",
            "night":    "5-min journaling; keep bedside minimal.",
            "generic":  "Remove one distraction from your desk.",
        },
        "Mars": {
            "morning":  "Short brisk walk; avoid spicy lunch.",
            "afternoon":"Cool-off before replies; count to 10.",
            "evening":  "Light workout or stretch 10-min.",
            "night":    "Warm shower; no arguments late.",
            "generic":  "Pause before sending heated messages.",
        },
        "Mercury": {
            "morning":  "Inbox-zero 10-min; check names & amounts.",
            "afternoon":"Write first draft; edit later.",
            "evening":  "Plan tomorrow’s 3 calls; keep them short.",
            "night":    "Brain-dump 5 bullets; sleep free.",
            "generic":  "Double-check travel times and venue pins.",
        },
        "Venus": {
            "morning":  "Wear something light/pastel; tidy your space.",
            "afternoon":"Add one kind note or appreciation.",
            "evening":  "Cook or share something sweet.",
            "night":    "Gentle music; soft lighting for wind-down.",
            "generic":  "Declutter beauty desk; choose calm colors.",
        },
        "Jupiter": {
            "morning":  "Read 1 page; set one learning goal.",
            "afternoon":"Share a helpful resource with a friend.",
            "evening":  "Donate ₹50/₹100 to edu/health cause.",
            "night":    "Gratitude note to a mentor.",
            "generic":  "Act on one generous impulse today.",
        },
        "Moon": {
            "morning":  "2 glasses of water; 5 slow breaths.",
            "afternoon":"Short walk in light; fresh fruit snack.",
            "evening":  "Early dinner; calming tea.",
            "night":    "No screens in bed; 11 slow breaths.",
            "generic":  "Check in with family; 5-min call.",
        },
        "Sun": {
            "morning":  "10-min sunlight; plan your 3 wins.",
            "afternoon":"Stand-up desk 15-min; shoulders back.",
            "evening":  "Wrap on time; no heroics today.",
            "night":    "Prepare clothes for tomorrow.",
            "generic":  "One decisive action > many drafts.",
        },
    }

    # Prefer planet-specific, period-aware; else energy-based generic
    if msp in by_msp:
        text = by_msp[msp].get(period) or by_msp[msp]["generic"]
    else:
        text = mid_energy  # sensible neutral default

    # Travel caution tweak
    if has_travel_caution:
        extra = " Leave 10-min early; confirm route."
        if len(text) + len(extra) <= 120:
            text += extra

    # Energy tweak
    if energy <= 60:
        text = low_energy
    elif energy >= 80 and len(text) < 90:
        text += " Ship one meaningful task."

    return text


def _append_optional_addons(base: str, msp: Optional[str], has_caution: bool) -> str:
    """
    Add practical add-ons requested by product:
      - '10-min digital detox' for Rahu-ish days / when caution windows exist
      - 'support road-safety/blanket charity' for Saturn/Rahu stress emphasis
    """
    txt = base.rstrip().rstrip(".")
    addons: List[str] = []
    if has_caution or (msp in ("Rahu",)):
        addons.append("10-min digital detox")
    if msp in ("Saturn", "Rahu"):
        addons.append("support road-safety/blanket charity")
    if addons:
        txt = f"{txt}; " + "; ".join(addons)
    return txt + "."


def _disclaimer_needed(energy: int, caution_count: int) -> bool:
    """
    Only show the disclaimer on tougher days so it doesn't feel repetitive.
    """
    if energy <= 60:
        return True
    if caution_count >= 2 and energy <= 70:
        return True
    return False


# --------- Summary polish: always output human-readable 'Do:' lines ----------

def _is_keyish(s: Optional[str]) -> bool:
    return bool(isinstance(s, str) and re.fullmatch(r"[A-Z0-9_]{6,}", s))

def _label_from_key(key: str) -> str:
    label = (key or "").upper()
    for rm in ("DO_", "DONT_", "_WINDOW"):
        label = label.replace(rm, "")
    return label.replace("_", " ").title()

def _render_action_line(action: Dict[str, Any]) -> str:
    txt  = action.get("text")
    key  = (action.get("key") or "")
    args = action.get("args") or {}
    start = args.get("start") or ""
    end   = args.get("end") or ""
    # If action.text looks like a real sentence, use it; else build from key/args
    if isinstance(txt, str) and txt.strip() and not _is_keyish(txt):
        return f"Do: {txt.strip()}"
    label = _label_from_key(key or "Do")
    if start and end:
        return f"Do: {label} {start}-{end}."
    return f"Do: {label}."

def _force_humanize_actions_do(actions: Dict[str, List[Dict[str, Any]]]) -> None:
    """Ensure actions['do'][i]['text'] is always a human sentence."""
    for a in actions.get("do", []):
        txt = a.get("text")
        if not isinstance(txt, str) or not txt.strip() or _is_keyish(txt):
            key  = (a.get("key") or "")
            args = a.get("args") or {}
            label = _label_from_key(key or "Do")
            st, en = args.get("start", ""), args.get("end", "")
            a["text"] = (f"{label} {st}-{en}." if (st and en) else label).strip()


# ---------------------- main assembly ---------------------- #
def assemble_daily(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds the daily payload from inputs. Phrasing kept simple & clear for all users.
    Expects either:
      - legacy: {"datetime": ISO, "lat": float, "lon": float}
      - birth:  {"birth": {"date": "YYYY-MM-DD", "time":"HH:MM", "lat":float, "lon":float}}
    Optional:
      - tz (IANA), ascii_fallback (bool), secular (bool), asset (str), for_date (YYYY-MM-DD)
      - summary_cap, dos_cap, donts_cap
      - include_disclaimer (bool)  # force-enable disclaimer if True
    """

    # Optional caps for summary and Do/Don't
    summary_cap = int(data.get("summary_cap", 5))
    dos_cap     = int(data.get("dos_cap", 3))
    donts_cap   = int(data.get("donts_cap", 2))

    # Optional asset for trading guidance
    asset_raw = data.get("asset")
    asset = str(asset_raw).strip().lower() if isinstance(asset_raw, str) else None
    if asset and asset not in VALID_ASSETS:
        asset = None

    secular = bool(data.get("secular", False))
    ascii_fallback = bool(data.get("ascii_fallback", False))
    force_disclaimer = bool(data.get("include_disclaimer", False))

    # Optional preview date (YYYY-MM-DD) for Today/Tomorrow UI
    day_override: Optional[date] = None
    if isinstance(data.get("for_date"), str) and data["for_date"]:
        try:
            day_override = date.fromisoformat(data["for_date"])
        except Exception:
            day_override = None

    # Inputs → UTC birth/legacy + site
    dt_aw, lat, lon = parse_birth_or_legacy(data)
    if not (-90 <= float(lat) <= 90 and -180 <= float(lon) <= 180):
        raise DailyError("lat/lon out of range")

    # Resolve time zone: use provided tz, else auto-guess from lat/lon, else default
    tz_str_in = str(data.get("tz") or "").strip()
    tz_guess: Optional[str] = None
    if not tz_str_in and _TF:
        try:
            tz_guess = _TF.timezone_at(lat=float(lat), lng=float(lon))
        except Exception:
            tz_guess = None
    tz = _tz(tz_str_in or tz_guess or "Asia/Kolkata")

    # Natal + dasha context
    dt_naive_utc = dt_aw.replace(tzinfo=None)
    natal_pts = natal_points(dt_naive_utc, lat, lon)
    md, ad = current_md_ad(tl=None, day=(day_override or datetime.now(tz).date()))

    # Midday sample for support/stress
    midday_l = (
        datetime(day_override.year, day_override.month, day_override.day, 12, 0, 0, tzinfo=tz)
        if day_override else datetime.now(tz).replace(hour=12, minute=0, second=0, microsecond=0)
    )
    midday_utc = midday_l.astimezone(timezone.utc).replace(tzinfo=None)

    support, stress, why = support_stress_scores(
        aspect_cfg=None,
        natal_pts=natal_pts,
        sample_dt=midday_utc,
        lat=lat, lon=lon,
        md=md, ad=ad,
    )

    # Resolve strongest support/stress (tsp/msp)
    def argmax(d: Dict[str, float]) -> Optional[str]:
        keys = [k for k, _ in sorted(d.items(), key=lambda kv: kv[1], reverse=True)]
        return keys[0] if keys else None

    tsp = argmax(support)
    msp = argmax(stress)
    if tsp and msp and tsp == msp and abs(support.get(tsp, 0) - stress.get(msp, 0)) <= 8:
        ordered = [k for k, _ in sorted(support.items(), key=lambda kv: kv[1], reverse=True)]
        tsp = ordered[1] if len(ordered) > 1 else tsp

    # Day windows (merged & future-aware)
    best_win, green_wins, caution_wins, reason = sample_day_windows(
        tz=tz, lat=lat, lon=lon, natal_pts=natal_pts, day=day_override
    )

    # ---------------------- Panchang (optional) ---------------------- #
    panchang_ui: Dict[str, Dict[str, str]] = {}
    if dayparts_rahu_yama_gulika is not None:
        try:
            dp = dayparts_rahu_yama_gulika(
                (day_override or datetime.now(tz).date()),
                float(lat), float(lon), tz
            )
            def _mk(dpair: Optional[Tuple[datetime, datetime]]) -> Optional[Dict[str, str]]:
                if not dpair:
                    return None
                s, e = dpair
                if _fmt_block_hhmm_pair_core:
                    return _fmt_block_hhmm_pair_core(s, e)  # -> {"start":"HH:MM","end":"HH:MM"}
                # Fallback local formatter
                return {
                    "start": s.astimezone(tz).strftime("%H:%M"),
                    "end":   e.astimezone(tz).strftime("%H:%M"),
                }
            if isinstance(dp, dict):
                if dp.get("rahu"):    panchang_ui["rahu"]    = _mk(dp.get("rahu")) or {}
                if dp.get("yama"):    panchang_ui["yama"]    = _mk(dp.get("yama")) or {}
                if dp.get("gulika"):  panchang_ui["gulika"]  = _mk(dp.get("gulika")) or {}
                if dp.get("abhijit"): panchang_ui["abhijit"] = _mk(dp.get("abhijit")) or {}
        except Exception:
            panchang_ui = {}

    # Energy with contextual bonuses
    energy = _energy_score(support, stress, md, ad, reason, best_win if best_win else None)

    # Intent bundle (heuristic)
    bundle = _intent_score_bundle(support, stress, md, ad)

    # Derive practical focus (communication/travel/trading)
    focus = _derive_daily_focus(
        tz=tz, lat=lat, lon=lon,
        day=(day_override or datetime.now(tz).date()),
        support=support, stress=stress,
        best=(best_win if best_win else None),
        greens=green_wins, cautions=caution_wins,
    )

    # De-dupe trading avoid windows (sometimes repeated)
    if isinstance(focus, dict) and "trading" in focus and isinstance(focus["trading"], dict):
        focus["trading"]["avoid"] = _dedupe_wins(focus["trading"].get("avoid"))

    # Compose Do/Don't
    actions = _compose_dos_donts(
        bundle=bundle,
        focus=focus,
        best_win=(best_win if best_win else None),
        caution_wins=caution_wins,
        energy=energy,
        cap_do=dos_cap,
        cap_dont=donts_cap,
    )

    # Humanize any key-like lines so UI gets readable text, and enrich don'ts
    _force_humanize_actions_do(actions)
    actions["dont"] = _enrich_donts(actions.get("dont", []), msp)

    # ---------------------- headline ---------------------- #
    headline_bits: List[str] = []
    headline_i18n: List[Dict[str, Any]] = []

    if focus["communication"]["best"]:
        w = focus["communication"]["best"][0]
        headline_bits.append(f"Good for conversations {w['start']}-{w['end']}")
        headline_i18n.append({"key": "HEADLINE_GOOD_FOR_CONVERSATIONS_WINDOW", "args": {"start": w["start"], "end": w["end"]}})

    if focus["travel"]["avoid"]:
        w = focus["travel"]["avoid"][0]
        headline_bits.append(f"Avoid travel {w['start']}-{w['end']}")
        headline_i18n.append({"key": "HEADLINE_AVOID_TRAVEL_WINDOW", "args": {"start": w["start"], "end": w["end"]}})

    if reason not in ("supportive timing", ""):
        headline_bits.append(reason.replace(" → ", " ").replace(" -> ", " "))
        headline_i18n.append({"key": "HEADLINE_REASON_FREEFORM", "args": {"reason": reason}})
    headline = "; ".join(headline_bits) or f"Energy {energy}/100 — steady progress"
    if not headline_bits:
        headline_i18n.append({"key": "HEADLINE_ENERGY_STEADY_PROGRESS", "args": {"energy": energy}})

    # ---------------------- overview (Do-only lines) ---------------------- #
    summary = [_render_action_line(it) for it in actions.get("do", [])][:summary_cap]
    summary_i18n = [{"key": it.get("key", ""), "args": it.get("args", {})} for it in actions.get("do", [])][:summary_cap]

    # ---------------------- remedies ---------------------- #
    wear_color = COLOR.get(tsp or "", "green")

    say_text = MANTRA.get(msp or "", "Om Budhaya Namah")
    say_obj = {"text": say_text, "secular_alt": "11 slow breaths",
               "key": "REMEDY_SAY_MANTRA", "args": {"planet": msp or "", "text": say_text}}
    if secular:
        say_obj["text"] = say_text

    period = _day_period_from_best(best_win)
    has_travel_caution = bool(caution_wins)
    optional_base = _optional_by_context(msp, energy, period, secular, has_travel_caution)
    optional = _append_optional_addons(optional_base, msp, has_travel_caution)

    puja = {**_PUJA.get(msp or "", {})}
    if puja:
        puja["key"] = "REMEDY_PUJA_SUGGESTION"
        puja["args"] = {"planet": msp or "", "deity": puja.get("deity", ""), "suggestion": puja.get("suggestion", "")}

    now_local = datetime.now(tz)
    if green_wins:
        def _to_dt(hhmm: str) -> datetime:
            h, m = map(int, hhmm.split(":"))
            base = (day_override or now_local.date())
            return datetime(base.year, base.month, base.day, h, m, tzinfo=tz)
        first_s = _to_dt(green_wins[0]["start"])
        if (first_s - now_local) <= timedelta(minutes=20) and len(green_wins) > 1:
            best_win = green_wins[1]

    today_iso = (day_override or datetime.now(tz).date()).isoformat()
    why_brief_md = md if md is not None else "-"
    why_brief_ad = ad if ad is not None else "-"
    why_brief = f"{reason}; MD: {why_brief_md}, AD: {why_brief_ad}"
    why_brief_i18n = {"key": "WHY_BRIEF_REASON_MD_AD", "args": {"reason": reason, "md": why_brief_md, "ad": why_brief_ad}}

    disclaimer_flag = force_disclaimer or _disclaimer_needed(energy, len(caution_wins or []))

    if best_win:
        hl1_text = f"Client meeting? Try {best_win['start']}-{best_win['end']}. Keep it simple."
        hl1_i18n = {"key": "DOMAIN_CLIENT_MEETING_TRY_WINDOW", "args": {"start": best_win["start"], "end": best_win["end"]}}
    else:
        hl1_text = "Send a warm note to one client. Ask for one clear next step."
        hl1_i18n = {"key": "DOMAIN_SEND_WARM_NOTE", "args": {}}

    hl2_text = "Follow up on pending invoices before lunch. Be polite and clear."
    hl2_i18n = {"key": "DOMAIN_FOLLOWUP_INVOICES", "args": {}}

    payload: Dict[str, Any] = {
        "date": today_iso,
        "tz": str(tz),
        "headline": headline,
        "headline_i18n": headline_i18n,
        "overview": {
            "summary": summary,
            "summary_i18n": summary_i18n,
            "energy": energy
        },
        "windows": {
            "best": {**best_win, "reason": reason} if best_win else {},
            "green": green_wins,
            "caution": caution_wins,
            "panchang": panchang_ui,
        },
        "daily_focus": {
            **focus,
            "communication_note_key": "FOCUS_COMM_NOTE",
            "travel_note_key": "FOCUS_TRAVEL_NOTE",
            "trading_note_key": "FOCUS_TRADING_NOTE",
        },
        "actions": actions,
        "domain_highlights": [hl1_text, hl2_text][:2],
        "domain_highlights_i18n": [hl1_i18n, hl2_i18n][:2],
        "remedies": {
            "wear": wear_color,
            "wear_key": "REMEDY_WEAR_COLOR",
            "wear_args": {"color": wear_color},
            "say": say_obj,
            "do": {
                "label": "Client call",
                "label_key": "REMEDY_DO_LABEL_CLIENT_CALL",
                "window": best_win or (green_wins[0] if green_wins else {}),
                "note": "keep it simple",
                "note_key": "REMEDY_DO_NOTE_KEEP_SIMPLE",
            },
            "optional": optional,
            "optional_key": "REMEDY_OPTIONAL_DYNAMIC",
            "optional_args": {
                "msp": msp or "",
                "period": _day_period_from_best(best_win),
                "has_travel_caution": bool(caution_wins),
                "energy": energy,
                "text": optional,
            },
            "puja": puja,
            "disclaimer": bool(disclaimer_flag),
            "disclaimer_key": "DISCLAIMER_GENERAL",
            "disclaimer_text": "This is general guidance. Use your discretion for big decisions.",
        },
        "why": {
            "tsp": tsp, "msp": msp,
            "support": support, "stress": stress,
            "md": md, "ad": ad,
            "tags_support": why.get("tags_support", []),
            "tags_stress":  why.get("tags_stress", []),
        },
        "why_brief": why_brief,
        "why_brief_i18n": why_brief_i18n,
    }

    # ---------------------- ASCII fallback (UI-safe) ---------------------- #
    if ascii_fallback:
        payload["overview"]["summary"] = [_asciiify(x) for x in payload["overview"]["summary"]]
        payload["domain_highlights"] = [_asciiify(x) for x in payload["domain_highlights"]]
        if payload["windows"].get("best", {}).get("reason"):
            payload["windows"]["best"]["reason"] = _asciiify(payload["windows"]["best"]["reason"])
        if "why" in payload:
            payload["why"]["tags_support"] = [_asciiify(x) for x in payload["why"].get("tags_support", [])]
            payload["why"]["tags_stress"]  = [_asciiify(x) for x in payload["why"].get("tags_stress", [])]
        if "why_brief" in payload:
            payload["why_brief"] = _asciiify(payload["why_brief"])
        if "remedies" in payload and isinstance(payload["remedies"].get("say", {}), dict):
            txt = payload["remedies"]["say"].get("text")
            if isinstance(txt, str):
                payload["remedies"]["say"]["text"] = _romanize(_asciiify(txt))
        if "actions" in payload:
            payload["actions"]["do"] = [{**a, "text": _asciiify(a.get("text", ""))} for a in payload["actions"].get("do", [])]
            payload["actions"]["dont"] = [{**a, "text": _asciiify(a.get("text", ""))} for a in payload["actions"].get("dont", [])]

    return payload
