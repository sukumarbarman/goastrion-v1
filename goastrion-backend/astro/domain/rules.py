from __future__ import annotations
from typing import Dict, List, Tuple, Any
from .types import AspectHit, PlanetName

# ----------------------------
# Domain scoring (unchanged)
# ----------------------------

_DEFAULT_DOMAIN_HOUSES: Dict[str, List[int]] = {
    "Career":    [10, 6, 11],
    "Finance":   [2, 11],
    "Health":    [1, 6],
    "Marriage":  [7],
    "Education": [5, 9],
}

def _tier(score: float, thr: Dict[str, float]) -> str:
    if score >= thr["excellent"]: return "excellent"
    if score >= thr["strong"]:    return "strong"
    if score >= thr["moderate"]:  return "moderate"
    return "weak"

def _benefic_set(aspect_cfg: dict) -> set[str]:
    raw = set(aspect_cfg.get("benefics", []) or [])
    out = {p for p in raw if p not in ("WaxingMoon", "WaningMoon")}
    out.add("Moon")
    return out

def _has_benefic_harmony(aspects: List[AspectHit], benefics: set[str]) -> bool:
    for hit in aspects:
        if hit.name.lower() in ("trine", "sextile") and (hit.p1 in benefics or hit.p2 in benefics):
            if hit.score > 0.2:
                return True
    return False

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
    return sum(weights.get(k, 0.0) * parts.get(k, 0.0) for k in ["natal","transit","dasha","progressed"])

def _benefic_aspect_hits(
    aspects: List[AspectHit],
    benefics: set[str],
    min_score: float = 0.25,
) -> List[Dict[str, Any]]:
    hits: List[Dict[str, Any]] = []
    for hit in aspects:
        if hit.name.lower() in ("trine", "sextile") and (hit.p1 in benefics or hit.p2 in benefics):
            if hit.score >= min_score:
                hits.append({"p1": hit.p1, "p2": hit.p2, "name": hit.name})
    return hits

def evaluate_domains_v11(
    *,
    domain_rules_json: dict,
    aspect_cfg: dict,
    planets_in_houses: Dict[int | str, List[str]],
    chart_lords: Dict[int, str],
    aspects: List[AspectHit],
) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    benefics = _benefic_set(aspect_cfg)

    domains_cfg: Dict[str, Any] = domain_rules_json["domains"]
    for dkey, block in domains_cfg.items():
        weights   = block["weights"]
        thr       = block["thresholds"]
        strings   = block.get("strings", {})
        chips_cfg = strings.get("chips", [])

        # Phase-1 partials
        houses = _DEFAULT_DOMAIN_HOUSES.get(dkey, [])
        planets_here_count = _count_planets_in_houses(planets_in_houses, houses)

        natal = 0.30
        if planets_here_count > 0: natal += 0.10
        if _has_benefic_harmony(aspects, benefics): natal += 0.10
        natal = min(1.0, natal)

        transit    = 0.15
        dasha      = 0.20
        progressed = 0.05

        total = _aggregate(weights, {
            "natal": natal, "transit": transit, "dasha": dasha, "progressed": progressed
        })
        total = max(0.0, min(1.0, total))
        tier = _tier(total, thr)

        chips: List[str] = list(chips_cfg)
        if planets_here_count > 0:
            chips.append(f"chip.house_presence.{dkey.lower()}")
        if _has_benefic_harmony(aspects, benefics):
            chips.append("chip.benefic_harmony")

        hi_houses: List[int] = []
        for h in houses:
            arr = planets_in_houses.get(h) or planets_in_houses.get(str(h)) or []
            if arr:
                hi_houses.append(h)
        occupants = _planets_in_house_list(planets_in_houses, houses)
        lords = [chart_lords.get(h) for h in houses if chart_lords.get(h)]
        hi_planets = sorted(list({*occupants, *lords}))
        hi_aspects = _benefic_aspect_hits(aspects, benefics, min_score=0.25)

        out.append({
            "key": dkey,
            "score": round(total * 100),
            "tier": tier,
            "chips": chips,
            "reasons": [],
            "timeWindows": [],
            "highlights": {
                "planets": hi_planets,
                "houses": hi_houses,
                "aspects": hi_aspects,
            },
        })

    return out

# ----------------------------
# Skill Spotlights (NEW)
# ----------------------------

def _p2h_map(planets_in_houses: Dict[int | str, List[str]]) -> Dict[str, List[int]]:
    """planet -> list of houses occupied"""
    out: Dict[str, List[int]] = {}
    for h_key, plist in planets_in_houses.items():
        h = int(h_key) if not isinstance(h_key, int) else h_key
        for p in plist:
            out.setdefault(p, []).append(h)
    return out

def _has_house_support(p2h: Dict[str, List[int]], target_houses: List[int], key_planets: List[str] | None = None) -> int:
    """
    Count how many of target_houses have at least one planet (optionally among key_planets).
    """
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
    """
    Sum normalized aspect scores for the given planet pairs (orderless).
    """
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
    """Small boost if planet sits in a kendra (1/4/7/10)."""
    kendra = {1,4,7,10}
    hs = p2h.get(planet, [])
    return 0.10 if any(h in kendra for h in hs) else 0.0

def _cap01(x: float) -> float:
    return max(0.0, min(1.0, x))

def evaluate_skills_v11(
    *,
    aspect_cfg: dict,
    planets_in_houses: Dict[int | str, List[str]],
    aspects: List[AspectHit],
) -> List[Dict[str, Any]]:
    """
    Returns list of skill cards:
      [{ key, score (0-100), chips: [i18n keys], reasons: [] }]
    """
    p2h = _p2h_map(planets_in_houses)

    skills: List[Dict[str, Any]] = []

    # ---------- Analytical ----------
    # Anchors: Mercury; houses 3/6/10; aspects Mercury–Jupiter, Mercury–Saturn
    base = 0.20 if "Mercury" in p2h else 0.10
    house_hits = _has_house_support(p2h, [3,6,10], key_planets=None)
    base += 0.05 * house_hits
    asp_sum = _sum_aspect_pairs(aspects, [("Mercury","Jupiter"),("Mercury","Saturn")])
    score = _cap01(base + 0.40 * asp_sum)
    skills.append({
        "key": "Analytical",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.mercury",
            "chip.skill.mercuryJupiterTrine",
            "chip.skill.mercurySaturnTrine",
        ],
        "reasons": [],
    })

    # ---------- Communication ----------
    # Anchors: Mercury; houses 2/3; aspects Mercury–Venus, Mercury–Moon
    base = 0.20 if "Mercury" in p2h else 0.10
    house_hits = _has_house_support(p2h, [2,3], key_planets=None)
    base += 0.07 * house_hits
    asp_sum = _sum_aspect_pairs(aspects, [("Mercury","Venus"),("Mercury","Moon")])
    score = _cap01(base + 0.35 * asp_sum)
    skills.append({
        "key": "Communication",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.mercury",
            "chip.skill.mercuryVenusTrine",
            "chip.skill.mercuryMoonTrine",
        ],
        "reasons": [],
    })

    # ---------- Leadership ----------
    # Anchors: Sun; houses 1/10; aspects Sun–Mars, Sun–Jupiter; kendra boost
    base = 0.18 if "Sun" in p2h else 0.08
    base += _kendra_boost(p2h, "Sun")
    house_hits = _has_house_support(p2h, [1,10], key_planets=None)
    base += 0.06 * house_hits
    asp_sum = _sum_aspect_pairs(aspects, [("Sun","Mars"),("Sun","Jupiter")])
    score = _cap01(base + 0.40 * asp_sum)
    skills.append({
        "key": "Leadership",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.sun",
            "chip.skill.sunMarsTrine",
            "chip.skill.sunJupiterTrine",
        ],
        "reasons": [],
    })

    # ---------- Creativity ----------
    # Anchors: Venus, Moon; house 5; aspects Venus–Moon, Venus–Jupiter
    base = 0.16 + (0.06 if "Venus" in p2h else 0.0) + (0.06 if "Moon" in p2h else 0.0)
    house_hits = _has_house_support(p2h, [5], key_planets=None)
    base += 0.08 * house_hits
    asp_sum = _sum_aspect_pairs(aspects, [("Venus","Moon"),("Venus","Jupiter")])
    score = _cap01(base + 0.35 * asp_sum)
    skills.append({
        "key": "Creativity",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.venus",
            "chip.skill.venusMoonTrine",
            "chip.skill.venusJupiterTrine",
        ],
        "reasons": [],
    })

    # ---------- Focus / Discipline ----------
    # Anchors: Saturn; houses 6/10; aspect Saturn–Mercury trine/sextile
    base = 0.18 if "Saturn" in p2h else 0.10
    base += _kendra_boost(p2h, "Saturn")
    house_hits = _has_house_support(p2h, [6,10], key_planets=None)
    base += 0.07 * house_hits
    asp_sum = _sum_aspect_pairs(aspects, [("Saturn","Mercury")])
    score = _cap01(base + 0.35 * asp_sum)
    skills.append({
        "key": "Focus",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.saturn",
            "chip.skill.saturnMercuryTrine",
        ],
        "reasons": [],
    })

    # ---------- Entrepreneurial Drive ----------
    # Anchors: Mars + (Mercury/Jupiter); houses 3/5/10/11; Rahu in 10/11 support
    base = 0.14 + (0.06 if "Mars" in p2h else 0.0) + (0.05 if "Mercury" in p2h else 0.0) + (0.05 if "Jupiter" in p2h else 0.0)
    house_hits = _has_house_support(p2h, [3,5,10,11], key_planets=None)
    base += 0.05 * house_hits
    # Aspects that indicate drive + business sense
    asp_sum = _sum_aspect_pairs(aspects, [
        ("Mars","Mercury"), ("Mars","Jupiter"), ("Mercury","Jupiter")
    ])
    # Rahu boost if in 10th/11th
    rahu_boost = 0.08 if any(h in (10,11) for h in p2h.get("Rahu", [])) else 0.0
    score = _cap01(base + 0.35 * asp_sum + rahu_boost)
    skills.append({
        "key": "Entrepreneurial",
        "score": int(round(score * 100)),
        "chips": [
            "chip.skill.mars",
            "chip.skill.mercury",
            "chip.skill.jupiter",
            "chip.skill.rahu10or11",
        ],
        "reasons": [],
    })

    return skills
