# astro/i18n/__init__.py
from __future__ import annotations
from pathlib import Path
from functools import lru_cache
from typing import Any, Dict, Optional, Tuple, List
import json

_I18N_DIR = Path(__file__).resolve().parent
_DAILY_DIR = _I18N_DIR / "daily"

def _safe_json_load(p: Path) -> Dict[str, Any]:
    try:
        with p.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

@lru_cache(maxsize=64)
def _load_locale(lang: str) -> Dict[str, Any]:
    p = _DAILY_DIR / f"{lang}.json"
    if not p.exists():
        return {}
    return _safe_json_load(p)

def available_locales() -> List[str]:
    return sorted([p.stem for p in _DAILY_DIR.glob("*.json")])

def _parse_accept_language(h: Optional[str]) -> Optional[str]:
    if not h:
        return None
    first = h.split(",")[0].strip()
    if not first:
        return None
    return first.split("-")[0].lower()

def _pick_lang(explicit: Optional[str], accept: Optional[str]) -> str:
    if explicit:
        return explicit.split("-")[0].lower()
    a = _parse_accept_language(accept)
    return a or "en"

_BUILTIN_FALLBACKS: Dict[str, Dict[str, str]] = {
    "en": {
        "HEADLINE_GOOD_FOR_CONVERSATIONS_WINDOW": "Good for conversations {start}-{end}",
        "HEADLINE_AVOID_TRAVEL_WINDOW": "Avoid travel {start}-{end}",
        "HEADLINE_REASON_FREEFORM": "{reason}",
        "FOCUS_COMM_NOTE": "Use the best window for official and personal talks.",
        "FOCUS_TRAVEL_NOTE": "Delay non-essential travel in the avoid windows.",
        "FOCUS_TRADING_NOTE": "Stay disciplined; avoid trades in the marked windows.",
        "REMEDY_WEAR_COLOR": "Today's color: {color}",
        "REMEDY_DO_LABEL_CLIENT_CALL": "Client call",
        "REMEDY_DO_NOTE_KEEP_SIMPLE": "keep it simple",
        "REMEDY_SAY_MANTRA": "{planet}: chant {text}",
        "DOMAIN_CLIENT_MEETING_TRY_WINDOW": "Client meeting? Try {start}-{end}. Keep it simple.",
        "DOMAIN_FOLLOWUP_INVOICES": "Follow up on pending invoices before lunch. Be polite and clear.",
        "DONT_AVOID_TOPIC_BY_MSP": "Avoid {topic}.",
        "DISCLAIMER_GENERAL": "This is general guidance. Use your discretion for big decisions.",
        "WHY_BRIEF_REASON_MD_AD": "{reason}; MD: {md}, AD: {ad}",
    },
    "bn": {
        "HEADLINE_GOOD_FOR_CONVERSATIONS_WINDOW": "আলাপের জন্য ভালো {start}-{end}",
        "HEADLINE_AVOID_TRAVEL_WINDOW": "ভ্রমণ এড়িয়ে চলুন {start}-{end}",
        "HEADLINE_REASON_FREEFORM": "{reason}",
        "FOCUS_COMM_NOTE": "অফিসিয়াল ও ব্যক্তিগত কথোপকথনের জন্য সেরা সময় ব্যবহার করুন।",
        "FOCUS_TRAVEL_NOTE": "এড়াতে বলা সময়ে অপ্রয়োজনীয় ভ্রমণ পিছিয়ে দিন।",
        "FOCUS_TRADING_NOTE": "শৃঙ্খলা বজায় রাখুন; চিহ্নিত সময়ে ট্রেডিং এড়িয়ে চলুন।",
        "REMEDY_WEAR_COLOR": "আজকের রঙ: {color}",
        "REMEDY_DO_LABEL_CLIENT_CALL": "ক্লায়েন্ট কল",
        "REMEDY_DO_NOTE_KEEP_SIMPLE": "সরল রাখুন",
        "REMEDY_SAY_MANTRA": "{planet}-এর জন্য জপ করুন: {text}",
        "DOMAIN_CLIENT_MEETING_TRY_WINDOW": "ক্লায়েন্ট মিটিং? চেষ্টা করুন {start}-{end}। সরল রাখুন।",
        "DOMAIN_FOLLOWUP_INVOICES": "দুপুরের আগে ইনভয়েসে ভদ্র ফলো-আপ দিন। স্পষ্ট থাকুন।",
        "DONT_AVOID_TOPIC_BY_MSP": "এড়িয়ে চলুন {topic}।",
        "DISCLAIMER_GENERAL": "এটি সাধারণ দিকনির্দেশ। বড় সিদ্ধান্তের আগে নিজের বিচক্ষণতা ব্যবহার করুন।",
        "WHY_BRIEF_REASON_MD_AD": "{reason}; এমডি: {md}, এডি: {ad}",
    },
}

# alias routes for keys stored in nested sections per your bn.json
_ALIAS_ROUTES: Dict[str, Tuple[str, str]] = {
    "HEADLINE_GOOD_FOR_CONVERSATIONS_WINDOW": ("headline", "comm_good"),
    "HEADLINE_AVOID_TRAVEL_WINDOW": ("headline", "travel_avoid"),
    "FOCUS_COMM_NOTE": ("phrases", "FOCUS_COMM_NOTE"),
    "FOCUS_TRAVEL_NOTE": ("phrases", "FOCUS_TRAVEL_NOTE"),
    "FOCUS_TRADING_NOTE": ("phrases", "FOCUS_TRADING_NOTE"),
    "REMEDY_WEAR_COLOR": ("remedies", "wear_color"),
    "REMEDY_DO_LABEL_CLIENT_CALL": ("remedies", "do_label_client"),
    "REMEDY_DO_NOTE_KEEP_SIMPLE": ("remedies", "do_note_simple"),
    "REMEDY_SAY_MANTRA": ("remedies", "say_mantra"),
    "DOMAIN_CLIENT_MEETING_TRY_WINDOW": ("domains", "client_meeting_simple"),
    "DOMAIN_FOLLOWUP_INVOICES": ("domains", "invoices_followup"),
    # IMPORTANT: topic sentence lives under "avoid.topic" in your bn.json
    "DONT_AVOID_TOPIC_BY_MSP": ("avoid", "topic"),
    "DISCLAIMER_GENERAL": ("phrases", "DISCLAIMER_GENERAL"),
    "WHY_BRIEF_REASON_MD_AD": ("phrases", "WHY_BRIEF_REASON_MD_AD"),
}

def _lookup_alias(locale_dict: Dict[str, Any], key: str) -> Optional[str]:
    if key not in _ALIAS_ROUTES:
        return None
    dom, leaf = _ALIAS_ROUTES[key]
    block = locale_dict.get(dom)
    if isinstance(block, dict):
        val = block.get(leaf)
        if isinstance(val, str) and val.strip():
            return val
    return None

def _from_block(locale_dict: Dict[str, Any], key: str) -> Optional[str]:
    phrases = locale_dict.get("phrases")
    if isinstance(phrases, dict):
        val = phrases.get(key)
        if isinstance(val, str) and val.strip():
            return val
    return None

def _fmt(template: str, args: Optional[Dict[str, Any]]) -> str:
    if not args:
        return template
    try:
        return template.format(**args)
    except Exception:
        return template

def tr(lang: str, key: str, args: Optional[Dict[str, Any]] = None) -> str:
    lang = (lang or "en").split("-")[0].lower()
    loc = _load_locale(lang)
    s = _from_block(loc, key)
    if s:
        return _fmt(s, args)
    s = _lookup_alias(loc, key)
    if s:
        return _fmt(s, args)
    if lang in _BUILTIN_FALLBACKS and key in _BUILTIN_FALLBACKS[lang]:
        return _fmt(_BUILTIN_FALLBACKS[lang][key], args)
    if key in _BUILTIN_FALLBACKS["en"]:
        return _fmt(_BUILTIN_FALLBACKS["en"][key], args)
    return key

def tr_color(lang: str, color_en: str) -> str:
    loc = _load_locale((lang or "en").split("-")[0].lower())
    colors = loc.get("colors", {}) if isinstance(loc, dict) else {}
    return colors.get(color_en, color_en)

# ---- topic localization helpers ---------------------------------------------

_TOPIC_CANON = {
    # english → topic key in locale["topics"]
    "heated replies and confrontations": "heated_replies",
    "over-commitment and late-night work": "overcommit_late",
    "doomscrolling and impulsive posts": "doomscroll",
    "abrupt exits or burning bridges": "abrupt_exits",
    "signing documents without a second check": "signing_without_check",
    "grand promises or big donations": "grand_promises",
    "impulse shopping and overindulgence": "impulse_shopping",
    "emotional decisions and late-night texting": "emotional_decisions",
    "ego-driven announcements": "ego_announcements",
    "impulsive decisions": "impulsive_decisions",
}

# default topic suggestion per MSP if caller didn't pass a topic
_MSP_DEFAULT_TOPIC = {
    "Mars": "heated_replies",
    "Saturn": "overcommit_late",
    "Rahu": "doomscroll",
    "Ketu": "abrupt_exits",
    "Mercury": "signing_without_check",
    "Jupiter": "grand_promises",
    "Venus": "impulse_shopping",
    "Moon": "emotional_decisions",
    "Sun": "ego_announcements",
}

def _localize_topic(lang: str, args: Dict[str, Any]) -> str:
    loc = _load_locale((lang or "en").split("-")[0].lower())
    topics = loc.get("topics") or {}
    topic_raw = (args.get("topic") or "").strip()
    msp = (args.get("msp") or "").strip()
    key = None
    if topic_raw:
        key = _TOPIC_CANON.get(topic_raw.lower())
    if not key and msp:
        key = _MSP_DEFAULT_TOPIC.get(msp)
    if key and isinstance(topics, dict) and key in topics:
        return topics[key]
    # fallback: if locale lacks it, just return raw
    return topic_raw or (topics.get("impulsive_decisions") if isinstance(topics, dict) else "")

# ---- apply to payload --------------------------------------------------------

def apply_i18n_daily(payload: Dict[str, Any],
                     locale: Optional[str] = None,
                     accept_language: Optional[str] = None) -> Dict[str, Any]:
    lang = _pick_lang(locale, accept_language)
    out = json.loads(json.dumps(payload))  # deep copy

    # HEADLINE
    parts: List[str] = []
    for piece in out.get("headline_i18n") or []:
        k = piece.get("key"); a = piece.get("args") or {}
        if not isinstance(k, str):
            continue
        parts.append(tr(lang, k, a))
    if parts:
        out["headline"] = " ; ".join([p for p in parts if p])

    # OVERVIEW summary
    if isinstance(out.get("overview"), dict):
        summ_i18n = out["overview"].get("summary_i18n") or []
        if summ_i18n:
            out["overview"]["summary"] = [
                tr(lang, it.get("key", ""), (it.get("args") or {}))
                for it in summ_i18n
            ]

    # DAILY FOCUS notes
    df = out.get("daily_focus") or {}
    if isinstance(df, dict):
        if df.get("communication_note_key"):
            df["communication"]["note"] = tr(lang, df["communication_note_key"], {})
        if df.get("travel_note_key"):
            df["travel"]["note"] = tr(lang, df["travel_note_key"], {})
        if df.get("trading_note_key"):
            df["trading"]["note"] = tr(lang, df["trading_note_key"], {})

    # ACTIONS
    acts = out.get("actions") or {}
    for bucket in ("do", "dont"):
        if isinstance(acts.get(bucket), list):
            for item in acts[bucket]:
                k = item.get("key")
                if not k:
                    continue
                args = item.get("args") or {}
                # special handling: localize {topic}
                if k == "DONT_AVOID_TOPIC_BY_MSP":
                    args = dict(args)
                    args["topic"] = _localize_topic(lang, args)
                    item["args"] = args
                item["text"] = tr(lang, k, args)

    # DOMAIN HIGHLIGHTS
    dh_i18n = out.get("domain_highlights_i18n") or []
    if dh_i18n:
        out["domain_highlights"] = [
            tr(lang, it.get("key", ""), it.get("args") or {})
            for it in dh_i18n
        ]

    # REMEDIES
    rem = out.get("remedies") or {}
    if isinstance(rem, dict):
        # wear
        wear_args = rem.get("wear_args") or {}
        col_en = wear_args.get("color")
        if isinstance(col_en, str) and col_en:
            col_local = tr_color(lang, col_en)
            rem["wear"] = tr(lang, "REMEDY_WEAR_COLOR", {"color": col_local})
            rem["wear_args"]["color"] = col_en

        # say
        say = rem.get("say") or {}
        if isinstance(say, dict) and say.get("key") == "REMEDY_SAY_MANTRA":
            say_args = dict(say.get("args") or {})
            say["text"] = tr(lang, "REMEDY_SAY_MANTRA", say_args)
            # override secular_alt if provided by locale
            loc = _load_locale(lang)
            sec_alt = (loc.get("remedies") or {}).get("secular_alt")
            if isinstance(sec_alt, str) and sec_alt.strip():
                say["secular_alt"] = sec_alt

        # do label/note
        do_blk = rem.get("do") or {}
        if isinstance(do_blk, dict):
            if do_blk.get("label_key"):
                do_blk["label"] = tr(lang, do_blk["label_key"], {})
            if do_blk.get("note_key"):
                do_blk["note"] = tr(lang, do_blk["note_key"], {})

        # puja suggestion (planet-specific string from locale['puja'])
        puja = rem.get("puja") or {}
        if isinstance(puja, dict) and puja.get("key") == "REMEDY_PUJA_SUGGESTION":
            loc = _load_locale(lang)
            planet = ((puja.get("args") or {}).get("planet") or "").strip()
            puja_map = loc.get("puja") or {}
            if isinstance(puja_map, dict) and planet in puja_map and isinstance(puja_map[planet], str):
                puja["suggestion"] = puja_map[planet]

        # disclaimer
        if rem.get("disclaimer_key"):
            rem["disclaimer_text"] = tr(lang, rem["disclaimer_key"], {})

    # WHY BRIEF
    wb = out.get("why_brief_i18n")
    if isinstance(wb, dict) and wb.get("key"):
        out["why_brief"] = tr(lang, wb["key"], wb.get("args") or {})

    return out
