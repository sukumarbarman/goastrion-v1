# astro/domain/insights.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple, Iterable, cast

from .types import AspectHit

# ------------------------------- models -------------------------------- #

@dataclass
class TimeWindow:
    title: str
    nextExact: Optional[str] = None
    window: Optional[str] = None
    source: Optional[str] = None

@dataclass
class DomainInsight:
    key: str
    score: int
    tier: str
    chips: List[str] = field(default_factory=list)
    reasons: List[str] = field(default_factory=list)
    timeWindows: List[TimeWindow] = field(default_factory=list)

@dataclass
class SkillInsight:
    key: str
    score: int
    chips: List[str] = field(default_factory=list)
    reasons: List[str] = field(default_factory=list)

# ---------------------------- tiny helpers ----------------------------- #

def _as_list(value: Any) -> List[Any]:
    """Ensure list; turn None->[], str-> [str], tuple->list(tuple)."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    # If it is a string (or any scalar), wrap it
    return [value]

def _tier_from_score(score_0_100: int, thresholds: Dict[str, float]) -> str:
    # thresholds in 0..1 scale; score_0_100 is 0..100
    s = score_0_100 / 100.0
    weak = float(thresholds.get("weak", 0.0))
    moderate = float(thresholds.get("moderate", 0.4))
    strong = float(thresholds.get("strong", 0.7))
    excellent = float(thresholds.get("excellent", 0.85))
    if s >= excellent: return "excellent"
    if s >= strong:    return "strong"
    if s >= moderate:  return "moderate"
    return "weak"

def _angle_diff(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

# -------------------------- WHEN evaluators ---------------------------- #

def _eval_when(
    *,
    when: Dict[str, Any],
    planets_in_houses: Dict[int, List[str]],
    house_lords: Dict[int, str],
    aspects_by_name: Dict[str, List[AspectHit]],
    current_md_lord: Optional[str],
    transit_hits: Optional[List[Dict[str, Any]]],
    progressed_hits: Optional[List[Dict[str, Any]]],
    benefics: List[str],
    malefics: List[str],
    classes_map: Dict[str, List[str]],
) -> Tuple[bool, float]:
    """
    Returns (condition_met, scaled_value) where scaled_value is used if the
    rule's score is defined as {"scale": "...", "multiplier": ...}.
    For fixed {"value": X}, caller ignores scaled_value.
    """
    t = when.get("type")

    if t == "houseBenefic":
        houses: List[int] = [int(h) for h in _as_list(when.get("houses"))]
        min_count = int(when.get("minCount", 1))
        count = 0
        for h in houses:
            plist = planets_in_houses.get(int(h), [])
            if any(p in benefics or p in ("Jupiter", "Venus") for p in plist):
                count += 1
        return (count >= min_count, float(count))

    if t == "houseMalefic":
        houses: List[int] = [int(h) for h in _as_list(when.get("houses"))]
        min_count = int(when.get("minCount", 1))
        count = 0
        for h in houses:
            plist = planets_in_houses.get(int(h), [])
            if any(p in malefics or p in ("Saturn","Mars","Rahu","Ketu") for p in plist):
                count += 1
        return (count >= min_count, float(count))

    if t == "lord_strength":
        # Minimal placeholder: presence of the lord in any angular/trine house → "good"
        house = int(when.get("house", 0))
        min_level = str(when.get("min", "good")).lower()
        lord = house_lords.get(house)
        if not lord:
            return (False, 0.0)
        good_houses = {1,4,5,7,9,10}
        lord_houses = {h for h, plist in planets_in_houses.items() if lord in plist}
        has_good = bool(good_houses & lord_houses)
        return (has_good, 1.0 if has_good else 0.0)

    if t == "placementStrength":
        # Minimal placeholder: planet in angular/trine == "good"
        planet = when.get("planet")
        min_level = str(when.get("min", "good")).lower()
        if not planet:
            return (False, 0.0)
        good_houses = {1,4,5,7,9,10}
        p_houses = {h for h, plist in planets_in_houses.items() if planet in plist}
        has_good = bool(good_houses & p_houses)
        return (has_good, 1.0 if has_good else 0.0)

    if t == "aspect":
        aname = when.get("aspect")
        min_score = float(when.get("minScore", 0.0))
        bclass = when.get("bClass")  # "benefic" | "malefic" | None
        hits = aspects_by_name.get(aname, [])
        best = 0.0
        for h in hits:
            if bclass == "benefic":
                if not (h.p1 in benefics or h.p2 in benefics or h.p1 in ("Jupiter","Venus") or h.p2 in ("Jupiter","Venus")):
                    continue
            if bclass == "malefic":
                if not (h.p1 in malefics or h.p2 in malefics or h.p1 in ("Saturn","Mars","Rahu","Ketu") or h.p2 in ("Saturn","Mars","Rahu","Ketu")):
                    continue
            if h.score > best:
                best = h.score
        return (best >= min_score, best)

    if t == "currentMDLordIsOneOf":
        lords = [str(x) for x in _as_list(when.get("lords"))]
        ok = current_md_lord in lords if current_md_lord else False
        return (ok, 1.0 if ok else 0.0)

    if t == "currentMDLordClass":
        cls = when.get("class")
        if not cls or not current_md_lord:
            return (False, 0.0)
        ok = current_md_lord in _as_list(classes_map.get(cls))
        return (ok, 1.0 if ok else 0.0)

    if t == "transitAspect":
        # expect {planet: "Jupiter", aspect:"Trine", b:"MC"|<planet>|..., windowDays, recentExact}
        planet = when.get("a") or when.get("planet")
        target = when.get("b") or when.get("target")
        aname  = when.get("aspect")
        min_score = float(when.get("minScore", 0.0))
        got = 0.0
        for h in _as_list(transit_hits or []):
            if h.get("aspect") == aname and h.get("planet") == planet and h.get("target") == target:
                got = max(got, float(h.get("score", 0.0)))
        return (got >= min_score, got)

    if t == "transitHouse":
        # minimal placeholder until real transit houses added
        planet = when.get("planet")
        house = int(when.get("house", 0))
        # currently we don’t compute transit-house occupancy; mark False
        return (False, 0.0)

    if t == "progressedAspect":
        # not yet implemented; always false
        return (False, 0.0)

    # Unknown type
    return (False, 0.0)

# ------------------------ domain computation --------------------------- #

def _safe_extend(chips: List[str], maybe_items: Any) -> None:
    """Extend chips with either a list or a single string safely."""
    items = _as_list(maybe_items)
    # ensure they are strings
    chips.extend([str(x) for x in items])

def build_domain_insights(
    *,
    domain_rules: Dict[str, Any],
    planets_in_houses: Dict[int, List[str]],
    lagna_sign: str,
    aspects: List[AspectHit],
    current_md_lord: Optional[str] = None,
    transit_hits: Optional[List[Dict[str, Any]]] = None,
    progressed_hits: Optional[List[Dict[str, Any]]] = None,
    benefics: Optional[List[str]] = None,
    malefics: Optional[List[str]] = None,
    classes_map: Optional[Dict[str, List[str]]] = None,
) -> List[DomainInsight]:
    domains_cfg = domain_rules.get("domains", {})
    if not isinstance(domains_cfg, dict):
        # safety: if someone provided a list by mistake
        return []

    # House lords (very basic): sign lords by whole sign from lagna
    # You can pass a richer map here if you already compute it elsewhere.
    house_lords: Dict[int, str] = {}  # optional feature; leave empty if not computed

    # aspects by name
    aspects_by_name: Dict[str, List[AspectHit]] = {}
    for h in aspects:
        aspects_by_name.setdefault(h.name, []).append(h)

    out: List[DomainInsight] = []
    benefics = benefics or []
    malefics = malefics or []
    classes_map = classes_map or {}

    for dkey, spec in domains_cfg.items():
        weights = spec.get("weights", {})
        thresholds = spec.get("thresholds", {})
        rules = _as_list(spec.get("rules"))
        strings = spec.get("strings", {}) or {}

        # score accumulation in 0..1 domain
        total = 0.0

        # chips start from configured list (ensure list)
        chips: List[str] = []
        _safe_extend(chips, strings.get("chips"))

        reasons: List[str] = []
        time_windows: List[TimeWindow] = []

        for r in rules:
            if not isinstance(r, dict):
                continue
            when = cast(Dict[str, Any], r.get("when", {}))
            score_spec = cast(Dict[str, Any], r.get("score", {}))
            explain_key = r.get("explainKey")

            ok, scaled = _eval_when(
                when=when,
                planets_in_houses=planets_in_houses,
                house_lords=house_lords,
                aspects_by_name=aspects_by_name,
                current_md_lord=current_md_lord,
                transit_hits=transit_hits,
                progressed_hits=progressed_hits,
                benefics=benefics,
                malefics=malefics,
                classes_map=classes_map,
            )
            if not ok:
                continue

            # fixed value vs scaled
            if "value" in score_spec:
                total += float(score_spec["value"])
            else:
                mult = float(score_spec.get("multiplier", 0.0))
                total += scaled * mult

            # explain & chips
            if explain_key:
                reasons.append(str(explain_key))

            # simple chip examples by rule type
            rtype = when.get("type")
            if rtype == "lord_strength":
                chips.append(f"chip.lord_strength.h{when.get('house')}")
            elif rtype == "aspect":
                chips.append(f"chip.aspect.{when.get('aspect')}")
                if when.get("bClass"):
                    chips.append(f"chip.aspectClass.{when.get('bClass')}")
            elif rtype == "currentMDLordIsOneOf":
                chips.append("chip.dasha.currentMD.supportive")
            elif rtype == "currentMDLordClass":
                chips.append(f"chip.dasha.mdClass.{when.get('class')}")

            # time window stub for transits (could be expanded later)
            if rtype in ("transitAspect", "transitHouse"):
                tw = TimeWindow(
                    title="insights.time.transitWindow",
                    nextExact=None,   # to be filled by a future exact-hit finder
                    window=f"±{when.get('windowDays', 0)}d" if when.get("windowDays") else None,
                    source="transit",
                )
                time_windows.append(tw)

        # clamp and weight (we already sum rule contributions; cap ~1.0)
        total = max(0.0, min(1.0, total))
        score_0_100 = int(round(total * 100))

        tier = _tier_from_score(score_0_100, thresholds)

        out.append(DomainInsight(
            key=dkey,
            score=score_0_100,
            tier=tier,
            chips=chips,
            reasons=reasons,
            timeWindows=time_windows
        ))

    # stable order
    out.sort(key=lambda x: x.key.lower())
    return out

# --------------------------- skills builder ---------------------------- #

def build_skill_insights(
    *,
    planets_in_houses: Dict[int, List[str]],
    aspects: List[AspectHit],
) -> List[SkillInsight]:
    """
    Simple illustrative skills, based on Mercury/Jupiter, Sun/Saturn, etc.
    You can expand this later or drive fully from config like domains.
    """
    # Aggregate a couple of useful aspect flags
    by_name: Dict[str, List[AspectHit]] = {}
    for h in aspects:
        by_name.setdefault(h.name, []).append(h)

    def best_score_involving(p: str, q: str, aname: str) -> float:
        best = 0.0
        for h in by_name.get(aname, []):
            if (h.p1 == p and h.p2 == q) or (h.p1 == q and h.p2 == p):
                best = max(best, h.score)
        return best

    out: List[SkillInsight] = []

    # Analytical (Mercury harmonics + 5th support)
    s = 0.0
    s += best_score_involving("Mercury", "Jupiter", "Trine") * 0.6
    s += best_score_involving("Mercury", "Saturn", "Trine") * 0.4
    s = max(0.0, min(1.0, s))
    out.append(SkillInsight(key="Analytical", score=int(round(s*100)), chips=[
        "chip.skill.mercury",
        "chip.skill.mercuryJupiterTrine",
        "chip.skill.mercurySaturnTrine",
    ]))

    # Communication (Mercury/Venus)
    s = 0.0
    s += best_score_involving("Mercury", "Venus", "Trine") * 0.7
    s = max(0.0, min(1.0, s))
    out.append(SkillInsight(key="Communication", score=int(round(s*100)), chips=[
        "chip.skill.mercury",
        "chip.skill.mercuryVenusTrine",
    ]))

    # Leadership (Sun + Jupiter support)
    s = 0.0
    s += best_score_involving("Sun", "Jupiter", "Trine") * 0.8
    s = max(0.0, min(1.0, s))
    out.append(SkillInsight(key="Leadership", score=int(round(s*100)), chips=[
        "chip.skill.sun",
        "chip.skill.sunJupiterTrine",
    ]))

    # Creativity (Venus + Mercury)
    s = 0.0
    s += best_score_involving("Venus", "Mercury", "Trine") * 0.7
    s = max(0.0, min(1.0, s))
    out.append(SkillInsight(key="Creativity", score=int(round(s*100)), chips=[
        "chip.skill.venus",
        "chip.skill.venusMercuryTrine",
    ]))

    out.sort(key=lambda x: x.key.lower())
    return out
