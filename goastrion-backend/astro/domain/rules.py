# astro/domain/rules.py
from __future__ import annotations
from typing import Dict, List, Tuple, Any, Set, Optional, Iterable, Union
from .types import AspectHit, PlanetName
from .scoring_recalibration import recalibrate_domains, recalibrate_skills

# ----------------------------
# Domain anchors & defaults
# ----------------------------

_DEFAULT_DOMAIN_HOUSES: Dict[str, List[int]] = {
    "Career":    [10, 6, 11],
    "Finance":   [2, 11],
    "Health":    [1, 6],
    "Marriage":  [7],
    "Education": [5, 9],
}

# Natural significators (karakas) per domain
_DOMAIN_KARAKAS: Dict[str, List[PlanetName]] = {
    "Career":    ["Sun", "Saturn", "Mars", "Jupiter"],
    "Finance":   ["Jupiter", "Venus", "Mercury"],
    "Health":    ["Sun", "Mars", "Saturn"],
    "Marriage":  ["Venus", "Jupiter", "Moon"],
    "Education": ["Jupiter", "Mercury", "Moon"],
}

# Per-domain default weights (used if domain_rules_json lacks them)
_DEFAULT_WEIGHTS: Dict[str, Dict[str, float]] = {
    "Career":    {"natal_presence": 0.30, "lord": 0.25, "aspects": 0.28, "karaka": 0.13, "transit": 0.03, "dasha": 0.01, "progressed": 0.00},
    "Finance":   {"natal_presence": 0.32, "lord": 0.24, "aspects": 0.29, "karaka": 0.11, "transit": 0.03, "dasha": 0.01, "progressed": 0.00},
    "Health":    {"natal_presence": 0.34, "lord": 0.22, "aspects": 0.28, "karaka": 0.12, "transit": 0.03, "dasha": 0.01, "progressed": 0.00},
    "Marriage":  {"natal_presence": 0.31, "lord": 0.26, "aspects": 0.29, "karaka": 0.12, "transit": 0.02, "dasha": 0.00, "progressed": 0.00},
    "Education": {"natal_presence": 0.31, "lord": 0.24, "aspects": 0.32, "karaka": 0.11, "transit": 0.02, "dasha": 0.00, "progressed": 0.00},
}

# Per-domain default thresholds (0..1 scale)
_DEFAULT_THRESHOLDS: Dict[str, Dict[str, float]] = {
    "Career":    {"moderate": 0.40, "strong": 0.68, "excellent": 0.85},
    "Finance":   {"moderate": 0.42, "strong": 0.70, "excellent": 0.88},
    "Health":    {"moderate": 0.38, "strong": 0.67, "excellent": 0.85},
    "Marriage":  {"moderate": 0.40, "strong": 0.70, "excellent": 0.87},
    "Education": {"moderate": 0.40, "strong": 0.69, "excellent": 0.86},
}

_KENDRA = {1, 4, 7, 10}
_TRIKONA = {1, 5, 9}
_UPACHAYA = {3, 6, 10, 11}
_DUSTHANA = {6, 8, 12}

_PLANETS = {"Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"}
_ANGLES  = {"Asc","MC","IC","DC"}

# ----------------------------
# Helpers
# ----------------------------

def _tier(score: float, thr: Dict[str, float]) -> str:
    if score >= thr.get("excellent", 0.85): return "excellent"
    if score >= thr.get("strong", 0.70):    return "strong"
    if score >= thr.get("moderate", 0.40):  return "moderate"
    return "weak"

def _benefic_set(aspect_cfg: dict) -> set[str]:
    raw = set(aspect_cfg.get("benefics", []) or [])
    out = {p for p in raw if p not in ("WaxingMoon", "WaningMoon")}
    out.add("Moon")
    if not out:
        out.update({"Jupiter","Venus","Mercury","Moon"})
    return out

def _malefic_set(aspect_cfg: dict) -> set[str]:
    raw = set(aspect_cfg.get("malefics", []) or [])
    if not raw:
        raw.update({"Saturn","Mars","Rahu","Ketu"})
    return raw

def _cap01(x: float) -> float:
    return max(0.0, min(1.0, x))

def _p2h_map(planets_in_houses: Dict[int | str, List[str]]) -> Dict[str, List[int]]:
    out: Dict[str, List[int]] = {}
    for h_key, plist in (planets_in_houses or {}).items():
        h = int(h_key) if not isinstance(h_key, int) else h_key
        for p in plist or []:
            out.setdefault(p, []).append(h)
    return out

def _count_planets_in_houses(
    planets_in_houses: Dict[int | str, List[str]], houses: List[int]
) -> int:
    cnt = 0
    for h in houses:
        arr = planets_in_houses.get(h) or planets_in_houses.get(str(h)) or []
        cnt += len(arr)
    return cnt

def _planets_in_house_list(
    planets_in_houses: Dict[int | str, List[str]], houses: List[int]
) -> List[str]:
    out: List[str] = []
    for h in houses:
        arr = planets_in_houses.get(h) or planets_in_houses.get(str(h)) or []
        out.extend(arr)
    return out

def _aggregate(weights: Dict[str, float], parts: Dict[str, float]) -> float:
    total = 0.0
    for k, v in parts.items():
        total += float(weights.get(k, 0.0)) * float(v)
    return total

# ----------------------------
# Global benefic aspects (chart-wide)
# ----------------------------

def _benefic_aspect_hits(
    aspects: List[AspectHit],
    benefics: set[str],
    min_score: float = 0.25,
) -> List[Dict[str, Any]]:
    hits: List[Dict[str, Any]] = []
    for hit in aspects:
        nm = hit.name.lower()
        if nm in ("trine","sextile") and (hit.p1 in benefics or hit.p2 in benefics):
            if hit.score >= min_score:
                hits.append({"p1": hit.p1, "p2": hit.p2, "name": hit.name, "score": float(hit.score)})
    hits.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return hits

# ----------------------------
# Presence / Lords / Karakas
# ----------------------------

def _presence_subscore(
    *,
    planets_in_houses: Dict[int | str, List[str]],
    houses: List[int],
    benefics: Set[str],
    malefics: Set[str],
) -> Tuple[float, List[int], float, float]:
    """
    Presence considers: occupancy, benefic/malefic mix, and house quality
    ONLY when that house is occupied. Small bonus for Rahu in 10/11.
    """
    if not houses:
        return (0.0, [], 0.0, 0.0)

    hi_houses: List[int] = []
    occupants = 0
    ben = 0
    mal = 0
    quality_bonus = 0.0
    mal_upachaya_count = 0

    for h in houses:
        arr = (planets_in_houses.get(h) or planets_in_houses.get(str(h)) or [])
        if not arr:
            continue

        hi_houses.append(h)
        occupants += len(arr)

        # house quality contributes only if occupied
        if h in _KENDRA:   quality_bonus += 0.06
        if h in _TRIKONA:  quality_bonus += 0.06
        if h in _UPACHAYA: quality_bonus += 0.04
        if h in _DUSTHANA: quality_bonus -= 0.05

        for p in arr:
            if p in benefics: ben += 1
            if p in malefics:
                mal += 1
                if h in _UPACHAYA:
                    mal_upachaya_count += 1
            # Rahu in 10/11 — tiny entrepreneurial/network boost
            if p == "Rahu" and h in (10, 11):
                quality_bonus += 0.03

    if occupants == 0:
        return (0.0, [], 0.0, 0.0)

    occ_ratio = min(1.0, occupants / float(len(houses)))
    ben_ratio = ben / float(occupants)
    mal_ratio = mal / float(occupants)

    # Malefics in upachaya are less harmful
    mal_upa_rel = mal_upachaya_count / float(occupants)
    mal_penalty = 0.20 * mal_ratio
    mal_penalty *= (1.0 - 0.40 * mal_upa_rel)  # reduce penalty up to 40% if malefics sit in upachaya

    base = 0.20 + 0.55 * occ_ratio + 0.20 * ben_ratio - mal_penalty + quality_bonus
    return (_cap01(base), hi_houses, _cap01(ben_ratio), _cap01(mal_ratio))

def _lord_subscore(
    *,
    chart_lords: Dict[int, str],
    planets_in_houses: Dict[int | str, List[str]],
    domain_houses: List[int],
) -> Tuple[float, List[str]]:
    p2h = _p2h_map(planets_in_houses)
    chips: List[str] = []
    good = 0
    total = 0
    penalty = 0.0
    bonus = 0.0

    for h in domain_houses:
        lord = chart_lords.get(h)
        if not lord:
            continue
        total += 1
        lord_houses = p2h.get(lord, [])
        if not lord_houses:
            continue

        if h in lord_houses:
            bonus += 0.10
            chips.append(f"chip.lord.own.h{h}")

        best_here = 0.0
        worst_here = 0.0
        for lh in lord_houses:
            if lh in _KENDRA:   best_here = max(best_here, 0.25)
            if lh in _TRIKONA:  best_here = max(best_here, 0.25)
            if lh in _UPACHAYA: best_here = max(best_here, 0.18)
            if lh in _DUSTHANA: worst_here = max(worst_here, 0.20)

        if best_here > 0:
            good += 1
            chips.append(f"chip.lord.good.h{h}")
        if worst_here > 0:
            penalty += 0.18
            chips.append(f"chip.lord.dusthana.h{h}")

    if total == 0:
        return (0.0, chips)

    base = (good / total) * 0.70 + bonus - penalty
    # --- NEW: tiny floor if there is *any* good or own-sign signal present ---
    if good > 0 or bonus > 0.0:
        base = max(base, 0.08)
    # ------------------------------------------------------------------------
    return (_cap01(base), chips)

def _karaka_placement_subscore(p2h: Dict[str, List[int]], karakas: List[str]) -> Tuple[float, List[str]]:
    if not karakas:
        return 0.0, []
    pts = 0.0
    chips: List[str] = []
    for k in karakas:
        best = 0.0
        for h in p2h.get(k, []):
            if h in _KENDRA:   best = max(best, 1.00); chips.append(f"chip.karaka.{k}.kendra")
            if h in _TRIKONA:  best = max(best, 0.90); chips.append(f"chip.karaka.{k}.trikona")
            if h in _UPACHAYA: best = max(best, 0.60); chips.append(f"chip.karaka.{k}.upachaya")
            if h in _DUSTHANA: best = max(best, 0.20); chips.append(f"chip.karaka.{k}.dusthana")
        pts += best
    return (_cap01(pts / max(1, len(karakas))), chips)

# ----------------------------
# Aspect scoring (domain-scoped)
# ----------------------------

def _house_mul(h: int) -> float:
    if h in _KENDRA:   return 1.15
    if h in _TRIKONA:  return 1.12
    if h in _UPACHAYA: return 1.08
    if h in _DUSTHANA: return 0.90
    return 1.00

def _context_mul_for_pair(p2h: Dict[str, List[int]], a: str, b: str) -> float:
    ha = max((_house_mul(h) for h in p2h.get(a, [])), default=1.00)
    hb = max((_house_mul(h) for h in p2h.get(b, [])), default=1.00)
    return max(ha, hb)

def _domain_aspects_pos_neg(
    *,
    aspects: List[AspectHit],
    domain_planets: Set[str],
    benefics: set[str],
    malefics: set[str],
    p2h: Dict[str, List[int]],
    min_score: float = 0.20,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], float, float]:
    POS_W = {"trine": 1.00, "sextile": 0.75, "conjunction": 0.55}
    NEG_W = {"square": 0.70, "opposition": 0.75, "quincunx": 0.40, "conjunction": 0.60}

    pos_hits: List[Dict[str, Any]] = []
    neg_hits: List[Dict[str, Any]] = []
    pos_sum = 0.0
    neg_sum = 0.0

    for h in aspects:
        if h.score < min_score:
            continue
        if h.p1 in _ANGLES or h.p2 in _ANGLES:  # ignore angles for domain scoring
            continue
        if h.p1 not in _PLANETS or h.p2 not in _PLANETS:
            continue
        if not ({h.p1, h.p2} & domain_planets):
            continue

        nm = h.name.lower()
        cmul = _context_mul_for_pair(p2h, h.p1, h.p2)

        # easy positives
        if nm in ("trine", "sextile"):
            w = POS_W[nm] * cmul
            pos_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
            pos_sum += w * float(h.score)
            continue

        # conjunction nuances
        if nm == "conjunction":
            s = {h.p1, h.p2}
            both_benefic = (s <= benefics)
            both_malefic = (s <= malefics)
            has_node     = bool(s & {"Rahu","Ketu"})

            if both_benefic:
                w = POS_W["conjunction"] * cmul
                pos_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
                pos_sum += w * float(h.score)
                continue

            if both_malefic:
                w = NEG_W["conjunction"] * cmul
                neg_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
                neg_sum += w * float(h.score)
                continue

            # mixed with nodes/luminaries
            if {"Sun","Rahu"} <= s or {"Sun","Ketu"} <= s or {"Moon","Rahu"} <= s or {"Moon","Ketu"} <= s:
                w = 0.65 * cmul  # luminary with node → stress
                neg_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
                neg_sum += w * float(h.score)
                continue

            if {"Jupiter","Saturn"} <= s:
                # structural; mild positive, less so if both in dusthana
                ha = set(_DUSTHANA) & set(p2h.get("Jupiter", []))
                hb = set(_DUSTHANA) & set(p2h.get("Saturn", []))
                dust_both = bool(ha) and bool(hb)
                w = (0.38 if not dust_both else 0.28) * cmul
                pos_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
                pos_sum += w * float(h.score)
                continue

            # other mixed with nodes: lean mild stress unless in upachaya
            if has_node:
                w = (0.50 if cmul < 1.05 else 0.35) * cmul
                neg_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
                neg_sum += w * float(h.score)
                continue

            # generic mixed: mild/neutral positive
            w = 0.20 * cmul
            pos_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
            pos_sum += w * float(h.score)
            continue

        # hard aspects
        if nm in ("square", "opposition", "quincunx"):
            w = NEG_W[nm] * cmul
            # --- NEW: if it's node-vs-node (Rahu–Ketu), de-weight the negativity ---
            if {h.p1, h.p2} <= {"Rahu", "Ketu"} and nm == "opposition":
                w *= 0.50  # halve the weight for pure node polarity
            # -----------------------------------------------------------------------
            neg_hits.append({"p1": h.p1, "p2": h.p2, "name": h.name, "score": float(h.score)})
            neg_sum += w * float(h.score)

    pos_hits.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    neg_hits.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return pos_hits, neg_hits, pos_sum, neg_sum

# ----------------------------
# Rule engine (policy-driven)
# ----------------------------

AspectLike = Union[AspectHit, Dict[str, Any]]

def _iter_aspect_like(items: Optional[Iterable[AspectLike]]) -> Iterable[AspectHit]:
    """Yield AspectHit-like objects from dicts or AspectHit instances."""
    if not items:
        return []
    for it in items:
        if isinstance(it, AspectHit):
            yield it
        else:
            # tolerate dicts: {p1,p2,name,score,...}
            class _A:
                __slots__ = ("p1","p2","name","score")
                def __init__(self, d: Dict[str, Any]):
                    self.p1 = d.get("p1")
                    self.p2 = d.get("p2")
                    self.name = d.get("name")
                    self.score = float(d.get("score", 0.0))
            yield _A(it)  # type: ignore[misc]

def _quality_from_houses(houses: List[int]) -> str:
    """
    Crude strength label from house placements.
    'excellent' (kendra/trikona presence), 'good' (upachaya), 'poor' (dusthana), 'neutral' otherwise.
    """
    if any(h in _KENDRA or h in _TRIKONA for h in houses):
        return "excellent"
    if any(h in _UPACHAYA for h in houses):
        return "good"
    if any(h in _DUSTHANA for h in houses):
        return "poor"
    return "neutral"

def _meets_min_strength(actual: str, min_needed: str) -> bool:
    order = {"poor":0, "neutral":1, "good":2, "excellent":3}
    return order.get(actual, 0) >= order.get(min_needed, 0)

def _match_aspect_rule(
    *,
    aspects: Iterable[AspectHit],
    a: Optional[str],
    b: Optional[str],
    b_class: Optional[str],
    aspect_name: Optional[str],
    min_score: float,
    benefics: set[str],
    malefics: set[str],
) -> float:
    """Return best matching aspect score (0 if none). Supports a+b, or a + class(other)."""
    target = (aspect_name or "").lower()
    best = 0.0
    for hit in aspects:
        if target and hit.name.lower() != target:
            continue
        if min_score and float(hit.score) < float(min_score):
            continue

        if a and b:
            s = {hit.p1, hit.p2}
            if a in s and b in s:
                best = max(best, float(hit.score))
                continue
        elif a and b_class:
            other = None
            if hit.p1 == a:
                other = hit.p2
            elif hit.p2 == a:
                other = hit.p1
            if other:
                if b_class == "benefic" and other in benefics:
                    best = max(best, float(hit.score))
                elif b_class == "malefic" and other in malefics:
                    best = max(best, float(hit.score))
    return best

def _rule_add(part_boosts: Dict[str, float], key: str, delta: float) -> None:
    part_boosts[key] = _cap01(part_boosts.get(key, 0.0) + float(delta))

def _apply_json_rules(
    *,
    domain_key: str,
    block: Dict[str, Any],
    aspect_cfg: dict,
    planets_in_houses: Dict[int | str, List[str]],
    chart_lords: Dict[int, str],
    aspects: List[AspectHit],
    transit_ctx: Optional[Dict[str, Any]] = None,
    dasha_ctx: Optional[Dict[str, Any]] = None,
    progressed_ctx: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, float], List[Dict[str, Any]]]:
    """
    Evaluate DomainRuleSet.json rules and return per-part boosts and any time windows (for UI).
    Transit/dasha/progressed contexts are optional; rules silently no-op if data isn't provided.
    """
    rules = (block or {}).get("rules") or []
    if not rules:
        return {}, []

    benefics = _benefic_set(aspect_cfg)
    malefics = _malefic_set(aspect_cfg)
    p2h = _p2h_map(planets_in_houses)

    part_boosts: Dict[str, float] = {}
    time_windows: List[Dict[str, Any]] = []

    # Helpers to read external contexts safely
    t_planets_in_houses = ((transit_ctx or {}).get("planets_in_houses") or {})
    t_aspects = list(_iter_aspect_like((transit_ctx or {}).get("aspects")))
    p_aspects = list(_iter_aspect_like((progressed_ctx or {}).get("aspects")))
    current_md_lord = (dasha_ctx or {}).get("current_md_lord")
    current_md_class = (dasha_ctx or {}).get("current_md_class")  # optional
    classes_map = ((block or {}).get("__classes")  # internal injection; normally top-level in JSON not per-block
                   or {})  # we will receive top-level classes through domain_rules_json at the call site

    # Natal aspects list
    natal_aspects = list(_iter_aspect_like(aspects))

    def _score_from_spec(spec: Dict[str, Any], matched_score: float) -> float:
        if not spec:
            return 0.0
        if "value" in spec:
            return float(spec["value"])
        if spec.get("scale") == "aspectScore":
            mul = float(spec.get("multiplier", 1.0))
            return float(matched_score) * mul
        return 0.0

    for rule in rules:
        sources = set(rule.get("sources") or [])
        when = rule.get("when") or {}
        score_spec = rule.get("score") or {}

        # -------- Natal rules --------
        if "natal" in sources:
            wtype = when.get("type")
            if wtype == "houseBenefic":
                houses = list(when.get("houses") or [])
                min_count = int(when.get("minCount", 1))
                cnt = 0
                for h in houses:
                    arr = planets_in_houses.get(h) or planets_in_houses.get(str(h)) or []
                    cnt += sum(1 for p in arr if p in benefics)
                if cnt >= min_count:
                    _rule_add(part_boosts, "natal_presence", _score_from_spec(score_spec, 0.0))

            elif wtype == "houseMalefic":
                houses = list(when.get("houses") or [])
                min_count = int(when.get("minCount", 1))
                cnt = 0
                for h in houses:
                    arr = planets_in_houses.get(h) or planets_in_houses.get(str(h)) or []
                    cnt += sum(1 for p in arr if p in malefics)
                if cnt >= min_count:
                    _rule_add(part_boosts, "natal_presence", _score_from_spec(score_spec, 0.0))

            elif wtype == "lord_strength":
                house = int(when.get("house", 0))
                min_label = when.get("min", "good")
                lord = chart_lords.get(house)
                if lord:
                    q = _quality_from_houses(p2h.get(lord, []))
                    if _meets_min_strength(q, min_label):
                        _rule_add(part_boosts, "lord", _score_from_spec(score_spec, 0.0))

            elif wtype == "placementStrength":
                planet = when.get("planet")
                min_label = when.get("min", "good")
                q = _quality_from_houses(p2h.get(planet, []))
                if _meets_min_strength(q, min_label):
                    # Natural significators often feel like 'karaka' channel
                    _rule_add(part_boosts, "karaka", _score_from_spec(score_spec, 0.0))

            elif wtype == "aspect":
                a = when.get("a")
                b = when.get("b")
                b_class = when.get("bClass")
                aspect_name = when.get("aspect")
                min_sc = float(when.get("minScore", 0.0))
                matched = _match_aspect_rule(
                    aspects=natal_aspects, a=a, b=b, b_class=b_class,
                    aspect_name=aspect_name, min_score=min_sc,
                    benefics=benefics, malefics=malefics,
                )
                if matched > 0.0:
                    _rule_add(part_boosts, "aspects", _score_from_spec(score_spec, matched))

        # -------- Transit rules --------
        if "transit" in sources and transit_ctx:
            wtype = when.get("type")
            if wtype == "transitHouse":
                planet = when.get("planet")
                house = int(when.get("house", 0))
                min_stay = int(when.get("minStayDays", 0))
                in_house = planet in (t_planets_in_houses or {}) and house in (t_planets_in_houses.get(planet) or t_planets_in_houses.get(str(planet)) or [])
                if in_house:
                    ok = True
                    # optional: transit_ctx can provide stayed_days[planet,house] = int
                    stayed_days = (transit_ctx or {}).get("stayed_days") or {}
                    key = f"{planet}:{house}"
                    if min_stay and stayed_days:
                        ok = int(stayed_days.get(key, 0)) >= min_stay
                    if ok:
                        _rule_add(part_boosts, "transit", _score_from_spec(score_spec, 0.0))

            elif wtype == "transitAspect":
                a = when.get("a")
                b = when.get("b")
                aspect_name = when.get("aspect")
                min_sc = float(when.get("minScore", 0.0))
                window_days = int(when.get("windowDays", 0))
                recent_exact_req = bool(when.get("recentExact", False))

                matched = 0.0
                window_ok = True
                exact_ok = True

                # try to find the best hit matching a-b
                for hit in t_aspects:
                    if aspect_name and hit.name.lower() != str(aspect_name).lower():
                        continue
                    s = {hit.p1, hit.p2}
                    if a in s and b in s and float(hit.score) >= min_sc:
                        matched = max(matched, float(hit.score))
                        # check optional timing decorations on the aspect object
                        # expecting optional fields: days_from_exact (float), recentExact (bool)
                        df = getattr(hit, "days_from_exact", None) or getattr(hit, "df", None) or None
                        hx_recent = getattr(hit, "recentExact", None)
                        if window_days and df is not None:
                            window_ok = abs(float(df)) <= float(window_days)
                        if recent_exact_req and hx_recent is not None:
                            exact_ok = bool(hx_recent)

                if matched > 0.0 and window_ok and exact_ok:
                    _rule_add(part_boosts, "transit", _score_from_spec(score_spec, matched))
                    if window_days:
                        time_windows.append({"ruleId": rule.get("id"), "labelKey": rule.get("explainKey"), "windowDays": window_days})

        # -------- Dasha rules --------
        if "dasha" in sources and dasha_ctx:
            wtype = when.get("type")
            if wtype == "currentMDLordIsOneOf":
                lords = set(when.get("lords") or [])
                if current_md_lord and current_md_lord in lords:
                    _rule_add(part_boosts, "dasha", _score_from_spec(score_spec, 0.0))
            elif wtype == "currentMDLordClass":
                class_name = when.get("class")
                # classes normally come from the top-level JSON; they'll be handed in from caller (we'll wire below)
                if class_name and classes_map:
                    members = set(classes_map.get(class_name) or [])
                    if current_md_lord and current_md_lord in members:
                        _rule_add(part_boosts, "dasha", _score_from_spec(score_spec, 0.0))

        # -------- Progressed rules --------
        if "progressed" in sources and progressed_ctx:
            wtype = when.get("type")
            if wtype == "progressedAspect":
                a = when.get("a")
                b = when.get("b")
                aspect_name = when.get("aspect")
                min_sc = float(when.get("minScore", 0.0))
                matched = 0.0
                for hit in p_aspects:
                    if aspect_name and hit.name.lower() != str(aspect_name).lower():
                        continue
                    s = {hit.p1, hit.p2}
                    if a in s and b in s and float(hit.score) >= min_sc:
                        matched = max(matched, float(hit.score))
                if matched > 0.0:
                    _rule_add(part_boosts, "progressed", _score_from_spec(score_spec, matched))

    return part_boosts, time_windows

# ----------------------------
# Public API
# ----------------------------

def evaluate_domains_v11(
    *,
    domain_rules_json: dict,
    aspect_cfg: dict,
    planets_in_houses: Dict[int | str, List[str]],
    chart_lords: Dict[int, str],
    aspects: List[AspectHit],
    # Optional contexts for rule engine (remain backwards compatible)
    transit_ctx: Optional[Dict[str, Any]] = None,
    dasha_ctx: Optional[Dict[str, Any]] = None,
    progressed_ctx: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    out: List[Dict[str, Any]] = []
    benefics = _benefic_set(aspect_cfg)
    malefics = _malefic_set(aspect_cfg)

    drj = domain_rules_json or {}
    domains_cfg: Dict[str, Any] = drj.get("domains", {}) or {}
    classes_map: Dict[str, List[str]] = drj.get("classes", {}) or {}

    # Show the strongest few aspects overall (excluding angles), so UI always has meaningful context.
    _ga: List[Dict[str, Any]] = []
    for hit in aspects:
        if hit.p1 in _ANGLES or hit.p2 in _ANGLES:
            continue
        if hit.p1 not in _PLANETS or hit.p2 not in _PLANETS:
            continue
        _ga.append({"p1": hit.p1, "p2": hit.p2, "name": hit.name, "score": float(hit.score)})
    _ga.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    global_aspects = _ga[:5]
    p2h_full = _p2h_map(planets_in_houses)

    for dkey in (_DEFAULT_DOMAIN_HOUSES.keys()):
        block = dict(domains_cfg.get(dkey, {}) or {})
        # inject top-level classes so _apply_json_rules can access them
        block["__classes"] = classes_map

        base_w = _DEFAULT_WEIGHTS.get(dkey, _DEFAULT_WEIGHTS["Career"])
        base_t = _DEFAULT_THRESHOLDS.get(dkey, _DEFAULT_THRESHOLDS["Career"])

        weights = dict(base_w)
        weights.update(block.get("weights", {}) or {})

        thr = dict(base_t)
        thr.update(block.get("thresholds", {}) or {})

        strings = block.get("strings", {}) or {}
        chips_cfg = list(strings.get("chips", []) or [])

        houses = _DEFAULT_DOMAIN_HOUSES.get(dkey, [])

        # ---------- Structural sub-scores ----------
        presence, hi_houses, ben_ratio, mal_ratio = _presence_subscore(
            planets_in_houses=planets_in_houses,
            houses=houses,
            benefics=benefics,
            malefics=malefics,
        )

        lord_strength, lord_chips = _lord_subscore(
            chart_lords=chart_lords,
            planets_in_houses=planets_in_houses,
            domain_houses=houses,
        )

        occupants = _planets_in_house_list(planets_in_houses, houses)
        lords = [chart_lords.get(h) for h in houses if chart_lords.get(h)]
        karakas = _DOMAIN_KARAKAS.get(dkey, [])
        domain_planets: Set[str] = set(occupants) | set(lords) | set(karakas)

        pos_hits, neg_hits, pos_sum, neg_sum = _domain_aspects_pos_neg(
            aspects=aspects,
            domain_planets=domain_planets,
            benefics=benefics,
            malefics=malefics,
            p2h=p2h_full,
            min_score=0.20,
        )
        support = float(pos_sum)
        stress = float(neg_sum)
        aspects_score = _cap01(0.10 + 0.85 * (support / (support + stress + 1.75)))

        karaka_score, karaka_chips = _karaka_placement_subscore(p2h_full, karakas)

        # Placeholder channels (kept for compatibility)
        transit_part = float(block.get("transit", 0.0))
        dasha_part = float(block.get("dasha", 0.0))
        progressed_part = float(block.get("progressed", 0.0))

        parts = {
            "natal_presence": presence,
            "lord":           lord_strength,
            "aspects":        aspects_score,
            "karaka":         karaka_score,
            "transit":        transit_part,
            "dasha":          dasha_part,
            "progressed":     progressed_part,
        }

        # ---------- Apply JSON rule engine ----------
        rule_boosts, time_windows = _apply_json_rules(
            domain_key=dkey,
            block=block,
            aspect_cfg=aspect_cfg,
            planets_in_houses=planets_in_houses,
            chart_lords=chart_lords,
            aspects=aspects,
            transit_ctx=transit_ctx,
            dasha_ctx=dasha_ctx,
            progressed_ctx=progressed_ctx,
        )

        # merge boosts into parts (clamped)
        for k, dv in (rule_boosts or {}).items():
            parts[k] = _cap01(parts.get(k, 0.0) + float(dv))

        total = _cap01(_aggregate(weights, parts))
        # Soft floor: if aspects+karaka support is meaningful, don't let the domain collapse.
        _support = float(parts.get("aspects", 0.0)) + float(parts.get("karaka", 0.0))
        if _support >= 0.55:
            total = max(total, 0.25)  # floor at 25/100 when supported
        tier = _tier(total, thr)

        chips: List[str] = list(chips_cfg)
        chips.extend(lord_chips)
        chips.extend(karaka_chips)
        if hi_houses:
            chips.append(f"chip.house_presence.{dkey.lower()}")
        if pos_hits:
            chips.append("chip.benefic_harmony")
        if neg_hits:
            chips.append("chip.aspect_stress")

        # Windows-safe ASCII hyphen in reasons
        reasons: List[str] = []
        if hi_houses:
            reasons.append("Planets present in key houses: " + ", ".join(str(h) for h in hi_houses) + ".")
        else:
            reasons.append("No planets in key houses for this domain.")
        reasons.append(f"Benefic vs malefic mix among occupants: {int(round(ben_ratio*100))}% vs {int(round(mal_ratio*100))}%.")

        if pos_hits:
            top_pos = ", ".join(f"{a['p1']}-{a['p2']} {a['name']}" for a in pos_hits[:2])
            reasons.append("Supportive aspects: " + top_pos + ".")
        else:
            reasons.append("Few or no supportive benefic aspects in this domain.")

        if neg_hits:
            top_neg = ", ".join(f"{a['p1']}-{a['p2']} {a['name']}" for a in neg_hits[:1])
            reasons.append("Stress aspects present: " + top_neg + ".")

        hi_planets = sorted(list(domain_planets))

        out.append({
            "key": dkey,
            "score": int(round(total * 100)),
            "tier": tier,
            "chips": chips,
            "reasons": reasons,
            "timeWindows": time_windows or [],
            "highlights": {
                "planets": hi_planets,
                "houses": hi_houses,
                "aspects": pos_hits,  # supportive
                "aspectsNegative": neg_hits,  # stress
                "parts": parts,  # for UI/debug tuning
            },
            "benefic_pct": int(round(ben_ratio * 100)),  # NEW
            "malefic_pct": int(round(mal_ratio * 100)),  # NEW
        })
    domains_recal = recalibrate_domains(out)
    return {
        "domains": domains_recal,
        "globalAspects": global_aspects,
    }

# ----------------------------
# Skills (unchanged except shared helpers)
# ----------------------------

def _has_house_support(p2h: Dict[str, List[int]], target_houses: List[int], key_planets: List[str] | None = None) -> int:
    occupied = set()
    for planet, houses in p2h.items():
        if key_planets and planet not in key_planets:
            continue
        for h in houses:
            if h in target_houses:
                occupied.add(h)
    return len(occupied)

def _sum_aspect_pairs(
    aspects: List[AspectHit],
    pairs: List[Tuple[str, str]],
    allowed: set[str] = frozenset({"Trine","Sextile","Conjunction"}),
    min_delta_score: float = 0.0,
) -> float:
    want = {tuple(sorted(p)) for p in pairs}
    total = 0.0
    for hit in aspects:
        if hit.name not in allowed:
            continue
        pair = tuple(sorted((hit.p1, hit.p2)))
        if pair in want and hit.score > min_delta_score:
            total += float(hit.score)
    return total

def _kendra_boost(p2h: Dict[str, List[int]], planet: str) -> float:
    hs = p2h.get(planet, [])
    return 0.10 if any(h in _KENDRA for h in hs) else 0.0

def _skill_aspects(
    aspects: List[AspectHit],
    pairs: List[Tuple[str, str]],
    allowed: set[str] = frozenset({"Trine","Sextile","Conjunction"}),
    min_score: float = 0.15,
) -> List[Dict[str, Any]]:
    hits: List[Dict[str, Any]] = []
    want = {tuple(sorted(p)) for p in pairs}
    for hit in aspects:
        if hit.name not in allowed:
            continue
        if hit.score < min_score:
            continue
        pair = tuple(sorted((hit.p1, hit.p2)))
        if pair in want:
            hits.append({"p1": hit.p1, "p2": hit.p2, "name": hit.name, "score": float(hit.score)})
    hits.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return hits

def _best_aspect_score(
    aspects: List[AspectHit],
    a: str, b: str,
    allowed: set[str] = frozenset({"Trine"}),
    min_score: float = 0.0,
) -> float:
    best = 0.0
    for hit in aspects:
        if hit.name not in allowed:
            continue
        if hit.p1 == a and hit.p2 == b or hit.p1 == b and hit.p2 == a:
            if hit.score > min_score:
                best = max(best, float(hit.score))
    return best

def _has_aspect(
    aspects: List[AspectHit],
    a: str, b: str, name: str = "Trine",
    min_score: float = 0.0,
) -> bool:
    return _best_aspect_score(aspects, a, b, allowed=frozenset({name}), min_score=min_score) > 0.0




# Small generic kendra helper for several skills (Mercury/Venus/Moon boosts)
def _kendra_boost_generic(p2h: Dict[str, List[int]], *planets: str) -> float:
    return sum(0.04 for pl in planets if any(h in _KENDRA for h in p2h.get(pl, [])))

def evaluate_skills_v11(
    *, aspect_cfg: dict, planets_in_houses: Dict[int | str, List[str]], aspects: List[AspectHit],
) -> List[Dict[str, Any]]:
    p2h = _p2h_map(planets_in_houses)
    skills: List[Dict[str, Any]] = []

    def _houses_of(planets: List[str]) -> List[int]:
        seen: Set[int] = set()
        for pl in planets:
            for h in p2h.get(pl, []):
                seen.add(h)
        return sorted(seen)

    # ---------- Analytical ----------
    base = 0.26 if "Mercury" in p2h else 0.12
    base += 0.07 * _has_house_support(p2h, [3,6,10])
    base += _kendra_boost(p2h, "Mercury") + _kendra_boost_generic(p2h, "Mercury")
    mj_trine = _best_aspect_score(aspects, "Mercury", "Jupiter", allowed=frozenset({"Trine"}))
    ms_trine = _best_aspect_score(aspects, "Mercury", "Saturn",  allowed=frozenset({"Trine"}))
    score = _cap01(base + 0.38 * mj_trine + 0.32 * ms_trine)  # weights just an example
    chips = ["chip.skill.mercury"]
    if _has_aspect(aspects, "Mercury", "Jupiter", "Trine"): chips.append("chip.skill.mercuryJupiterTrine")
    if _has_aspect(aspects, "Mercury", "Saturn",  "Trine"): chips.append("chip.skill.mercurySaturnTrine")
    skills.append({
        "key": "Analytical",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "planets": ["Mercury"],
            "houses": [3,6,10],
            "aspects": _skill_aspects(aspects, [("Mercury","Jupiter"),("Mercury","Saturn")], allowed=frozenset({"Trine"}))
        }
    })

    # ---------- Communication ----------
    base = 0.22 if "Mercury" in p2h else 0.11
    base += 0.09 * _has_house_support(p2h, [2,3])
    base += _kendra_boost(p2h, "Mercury") + _kendra_boost_generic(p2h, "Mercury","Moon","Venus")
    mv_trine = _best_aspect_score(aspects, "Mercury", "Venus", allowed=frozenset({"Trine"}))
    mm_trine = _best_aspect_score(aspects, "Mercury", "Moon",  allowed=frozenset({"Trine"}))
    score = _cap01(base + 0.36 * mv_trine + 0.30 * mm_trine)
    chips = ["chip.skill.mercury"]
    if _has_aspect(aspects, "Mercury", "Venus", "Trine"): chips.append("chip.skill.mercuryVenusTrine")
    if _has_aspect(aspects, "Mercury", "Moon",  "Trine"): chips.append("chip.skill.mercuryMoonTrine")
    skills.append({
        "key": "Communication",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "planets": ["Mercury"],
            "houses": _houses_of(["Mercury"]),
            "aspects": _skill_aspects(aspects, [("Mercury","Venus"),("Mercury","Moon")], allowed=frozenset({"Trine"}))
        }
    })

    # ---------- Leadership ----------
    base = 0.20 if "Sun" in p2h else 0.10
    base += _kendra_boost(p2h, "Sun")
    base += 0.08 * _has_house_support(p2h, [1,7,10])  # visibility angles
    sj_trine = _best_aspect_score(aspects, "Sun", "Jupiter", allowed=frozenset({"Trine"}))
    sm_trine = _best_aspect_score(aspects, "Sun", "Mars",    allowed=frozenset({"Trine"}))
    score = _cap01(base + 0.40 * sj_trine + 0.28 * sm_trine)
    chips = ["chip.skill.sun"]
    if _has_aspect(aspects, "Sun", "Jupiter", "Trine"): chips.append("chip.skill.sunJupiterTrine")
    if _has_aspect(aspects, "Sun", "Mars",    "Trine"): chips.append("chip.skill.sunMarsTrine")
    skills.append({
        "key": "Leadership",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "aspects": _skill_aspects(aspects, [("Sun","Jupiter"),("Sun","Mars")], allowed=frozenset({"Trine"}))
        }
    })

    # ---------- Creativity ----------
    base = 0.18 + (0.06 if "Venus" in p2h else 0.0) + (0.06 if "Moon" in p2h else 0.0)
    base += _kendra_boost_generic(p2h, "Venus","Moon")
    base += 0.10 * _has_house_support(p2h, [5])
    vm_trine = _best_aspect_score(aspects, "Venus", "Moon",    allowed=frozenset({"Trine"}))
    vj_trine = _best_aspect_score(aspects, "Venus", "Jupiter", allowed=frozenset({"Trine"}))
    score = _cap01(base + 0.34 * vm_trine + 0.28 * vj_trine)
    chips = ["chip.skill.venus"]
    if _has_aspect(aspects, "Venus", "Moon",    "Trine"): chips.append("chip.skill.venusMoonTrine")
    if _has_aspect(aspects, "Venus", "Jupiter", "Trine"): chips.append("chip.skill.venusJupiterTrine")
    skills.append({
        "key": "Creativity",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "planets": ["Venus","Moon"],
            "houses": _houses_of(["Venus","Moon"]),
            "aspects": _skill_aspects(aspects, [("Venus","Moon"),("Venus","Jupiter")], allowed=frozenset({"Trine"}))
        }
    })

    # ---------- Focus / Discipline ----------
    base = 0.20 if "Saturn" in p2h else 0.12
    base += _kendra_boost(p2h, "Saturn")
    base += 0.09 * _has_house_support(p2h, [6,10])
    sm_trine = _best_aspect_score(aspects, "Saturn", "Mercury", allowed=frozenset({"Trine"}))
    score = _cap01(base + 0.38 * sm_trine)
    chips = ["chip.skill.saturn"]
    if _has_aspect(aspects, "Saturn", "Mercury", "Trine"): chips.append("chip.skill.saturnMercuryTrine")
    skills.append({
        "key": "Focus",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "planets": ["Saturn"],
            "houses": _houses_of(["Saturn"]),
            "aspects": _skill_aspects(aspects, [("Saturn","Mercury")], allowed=frozenset({"Trine"}))
        }
    })

    # ---------- Entrepreneurial Drive ----------
    base = 0.16 + (0.06 if "Mars" in p2h else 0.0) + (0.05 if "Mercury" in p2h else 0.0) + (0.05 if "Jupiter" in p2h else 0.0)
    base += 0.07 * _has_house_support(p2h, [3,5,10,11])
    # you can let all soft aspects help here (Trine/Sextile/Conjunction) if you want
    asp_sum = _sum_aspect_pairs(aspects, [("Mars","Mercury"),("Mars","Jupiter"),("Mercury","Jupiter")])
    rahu_boost = 0.10 if any(h in (10,11) for h in p2h.get("Rahu", [])) else 0.0
    score = _cap01(base + 0.42 * asp_sum + rahu_boost)
    chips = ["chip.skill.mars","chip.skill.mercury","chip.skill.jupiter"]
    if any(h in (10,11) for h in p2h.get("Rahu", [])):
        chips.append("chip.skill.rahu10or11")
    skills.append({
        "key": "Entrepreneurial",
        "score": int(round(score * 100)),
        "chips": chips,
        "reasons": [],
        "highlights": {
            "planets": ["Mars","Mercury","Jupiter"],
            "houses": [3,5,10,11],
            "aspects": _skill_aspects(aspects, [("Mars","Mercury"),("Mars","Jupiter"),("Mercury","Jupiter")])
        }
    })

    return recalibrate_skills(skills)
