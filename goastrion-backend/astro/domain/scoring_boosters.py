# astro/domain/scoring_boosters.py
from __future__ import annotations
from typing import Dict, List, Set, Any, Tuple

# ---- Shared config ---------------------------------------------------------
DOMAIN_KEY_HOUSES = {
    "Career":   {10, 6, 11},
    "Finance":  {11, 2},
    "Health":   {1, 6},
    "Marriage": {7},
    "Education":{5, 9},
}

# NOTE: 2 is intentionally included here to slightly favor Finance.
UPACHAYA_HOUSES = {3, 6, 10, 11, 2}
SUPPORTIVE = {"Conjunction", "Trine", "Sextile"}

# soft caps/floors per domain (non-hard; final clamp will use these)
DOMAIN_CAP = {
    "Career": 98, "Finance": 98,
    "Health": 92, "Marriage": 92, "Education": 94,
}
DOMAIN_BASE_FLOOR = {
    "Career": 55, "Finance": 55,
    "Health": 45, "Marriage": 45, "Education": 50,
}

# skill caps/floors
# ---- Skill caps/floors (tighten caps a bit) -------------------------------
SKILL_CAP = {
    "Analytical": 90,       # was 92
    "Communication": 90,    # was 92
    "Leadership": 92,       # was 96
    "Creativity": 90,       # was 92
    "Focus": 90,            # was 92
    "Entrepreneurial": 92,  # was 96
}
SKILL_BASE_FLOOR = {k: 35 for k in SKILL_CAP}


# ---- Helpers ---------------------------------------------------------------
def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _tier(score: int) -> str:
    if score >= 80: return "strong"
    if score >= 55: return "moderate"
    return "weak"

def _bins_to_sets(bins: Dict[int, List[str] | Set[str]]) -> Dict[int, Set[str]]:
    out: Dict[int, Set[str]] = {}
    for k, v in (bins or {}).items():
        try:
            out[int(k)] = set(v or [])
        except Exception:
            pass
    return out

def _support_chain(hl: dict) -> float:
    asp = (hl or {}).get("aspects") or []
    vals = sorted([float(a.get("score", 0.0)) for a in asp if a.get("name") in SUPPORTIVE], reverse=True)
    return sum(vals[:4])  # 0..~3.2

def _occ_stats(houses: Set[int], bins_i: Dict[int, Set[str]], benefics: Set[str], malefics: Set[str]):
    total = bene = male = 0
    for h in houses:
        ps = bins_i.get(h, set())
        total += len(ps)
        bene  += len(ps & benefics)
        male  += len(ps & malefics)
    return total, bene, male

def _soft_logistic(x: float, mid: float = 68.0, slope: float = 0.11, lo: float = 32.0, span: float = 54.0) -> float:
    # gentle S-curve; we’ll floor after if excellence badges hit
    import math
    z = 1.0 / (1.0 + math.exp(-slope * (x - mid)))
    return lo + span * z

# ---- Domain excellence badges & boost -------------------------------------
def _domain_badges(key: str, bins_i: Dict[int, Set[str]], benefics: Set[str], malefics: Set[str], parts: dict, aspp: float):
    natal  = float(parts.get("natal_presence", 0.0))
    lord   = float(parts.get("lord", 0.0))
    karaka = float(parts.get("karaka", 0.0))
    parts_power = 0.35*natal + 0.40*lord + 0.25*karaka

    key_hs = DOMAIN_KEY_HOUSES.get(key, set())
    key_total, key_bene, key_male = _occ_stats(key_hs, bins_i, benefics, malefics)
    upa_total, upa_bene, upa_male = _occ_stats(UPACHAYA_HOUSES & key_hs, bins_i, benefics, malefics)

    # shared badges
    b_stack   = (key_total >= 3) or (upa_total >= 2)
    b_benefic = (key_bene - key_male >= 1) or (key_total >= 2 and key_bene >= key_male)
    b_parts   = parts_power >= 0.70
    b_aspects = aspp >= 1.10

    # domain-specific royalty
    ten = bins_i.get(10, set())
    eleven = bins_i.get(11, set())
    seven = bins_i.get(7, set())
    one = bins_i.get(1, set())
    five = bins_i.get(5, set())
    nine = bins_i.get(9, set())
    six = bins_i.get(6, set())

    b_royal = False
    if key in {"Career", "Finance"}:
        b_royal = ("Sun" in (ten | eleven)) or ("Rahu" in (ten | eleven)) or (("Mars" in ten) and ("Mercury" in ten))
    elif key == "Health":
        b_royal = ("Sun" in one) or ("Mars" in one) or ("Saturn" in six)
    elif key == "Marriage":
        b_royal = ("Venus" in seven) or ("Jupiter" in seven)  # natural karakas seated in 7th
    elif key == "Education":
        b_royal = ("Jupiter" in (five | nine)) or ("Mercury" in (five | nine))

    return {"stack": b_stack, "benefic": b_benefic, "parts": b_parts, "aspect": b_aspects, "royal": b_royal}

def excellence_boost_domains(domains: List[dict],
                             bins: Dict[int, List[str] | Set[str]],
                             aspect_cfg: Dict[str, Any]) -> None:
    """
    Mutates domains in-place with *deflated* tuning:
      - less raw 'excellence' fuel
      - harder & lower floors
      - slightly sterner curve
    """
    bins_i = _bins_to_sets(bins)
    benefics: Set[str] = set(aspect_cfg.get("benefics", []))
    malefics: Set[str] = set(aspect_cfg.get("malefics", []))

    for d in domains:
        key = d.get("key")
        if key not in DOMAIN_KEY_HOUSES:
            continue

        base = float(d.get("score", 0))
        hl   = d.get("highlights") or {}
        parts = hl.get("parts") or {}
        aspp = _support_chain(hl)             # supportive aspect power (0..~3.2)

        # ---- raw excellence (deflated) -------------------------------------
        exc = 0.0
        key_total, key_bene, key_male = _occ_stats(DOMAIN_KEY_HOUSES[key], bins_i, benefics, malefics)

        # occupancy weight trimmed
        if key_total >= 3:   exc += 8.0   # was 10
        elif key_total == 2: exc += 5.0   # was 6
        elif key_total == 1: exc += 2.0   # was 2.5

        # upachaya softer
        upa_total, upa_bene, upa_male = _occ_stats(UPACHAYA_HOUSES & DOMAIN_KEY_HOUSES[key], bins_i, benefics, malefics)
        exc += 1.0 * upa_total            # was 2.0 each
        if upa_male > upa_bene:
            exc -= 1.0                    # was 1.5

        natal  = float(parts.get("natal_presence",0.0))
        lord   = float(parts.get("lord",0.0))
        karaka = float(parts.get("karaka",0.0))
        parts_power = 0.35*natal + 0.40*lord + 0.25*karaka
        exc += 10.0 * max(0.0, parts_power - 0.60)  # was 14.0 over 0.55

        exc += min(6.0, aspp * 3.0)       # was min(8.0, aspp*3.5)

        # tame non-Career/Finance slightly more
        if key not in {"Career","Finance"}:
            exc *= 0.50                   # was 0.55

        raw = base + _clamp(exc, 0.0, 25.0)   # was clamp to 35

        # ---- badges → harder to trigger, lower floors ----------------------
        badges = _domain_badges(key, bins_i, benefics, malefics, parts, aspp)
        bc = sum(1 for v in badges.values() if v)
        excellence = bc >= 4              # was >= 3

        hard_floor = 0.0
        if excellence:
            if key in {"Career","Finance"}:
                hard_floor = 85.0         # was 90/92+
            elif key == "Education":
                hard_floor = 78.0         # was 82
            elif key in {"Health","Marriage"}:
                hard_floor = 76.0         # was 80
            if badges.get("royal"):
                hard_floor = max(hard_floor, (88.0 if key in {"Career","Finance"} else 80.0))

        # ---- sterner curve --------------------------------------------------
        curved = _soft_logistic(raw, mid=72.0, slope=0.10, lo=28.0, span=52.0)

        floored = max(curved, hard_floor, float(DOMAIN_BASE_FLOOR[key]))
        final = int(round(_clamp(floored, 5.0, float(DOMAIN_CAP[key]))))

        d["score"] = final
        d["tier"]  = _tier(final)



# ---- Skill boosters --------------------------------------------------------
SKILL_SIGNATURES = {
    "Analytical": {
        "planets": {"Mercury"},
        "houses": {3, 6, 10, 11},
        "aspect_pairs": {("Mercury","Saturn"), ("Mercury","Mars")},
    },
    "Communication": {
        "planets": {"Mercury", "Moon"},
        "houses": {3, 11, 7, 10},
        "aspect_pairs": {("Mercury","Venus"), ("Mercury","Jupiter")},
    },
    "Leadership": {
        "planets": {"Sun","Jupiter","Mars"},
        "houses": {10, 5, 1, 11},
        "aspect_pairs": {("Sun","Jupiter"), ("Sun","Mars")},
    },
    "Creativity": {
        "planets": {"Venus","Moon"},
        "houses": {5, 12, 4},
        "aspect_pairs": {("Venus","Moon"), ("Venus","Neptune")},  # Neptune may not exist; harmless
    },
    "Focus": {
        "planets": {"Saturn"},
        "houses": {10, 6, 1, 12},
        "aspect_pairs": {("Mercury","Saturn"), ("Sun","Saturn")},
    },
    "Entrepreneurial": {
        "planets": {"Mars","Mercury","Jupiter","Rahu"},
        "houses": {3, 5, 10, 11},
        "aspect_pairs": {("Mars","Mercury"), ("Sun","Jupiter")},
    },
}

def _aspect_hits(hl_aspects: List[dict], pair_set: Set[tuple]) -> Tuple[int, float]:
    cnt = 0; power = 0.0
    for a in hl_aspects or []:
        p1, p2, n = a.get("p1"), a.get("p2"), a.get("name")
        if n not in SUPPORTIVE:
            continue
        if (p1, p2) in pair_set or (p2, p1) in pair_set:
            cnt += 1
            power += float(a.get("score", 0.0))
    return cnt, power

def excellence_boost_skills(skills: List[dict],
                            bins: Dict[int, List[str] | Set[str]]) -> None:
    """
    Mutates skills in-place (deflated):
      - lower presence/aspect weights
      - require 3/3 buckets for floors
      - slightly sterner curve
      - caps tightened via SKILL_CAP
    """
    bins_i = _bins_to_sets(bins)

    for s in skills:
        key = s.get("key")
        if key not in SKILL_SIGNATURES:
            continue

        base = float(s.get("score", 0))
        hl   = s.get("highlights") or {}
        planets = set((hl.get("planets") or []))
        houses  = set((hl.get("houses") or []))
        aspects = (hl.get("aspects") or [])

        sig = SKILL_SIGNATURES[key]

        # presence points (deflated)
        p_hits = len(planets & sig["planets"])
        h_hits = len(houses & sig["houses"])
        a_cnt, a_pow = _aspect_hits(aspects, sig["aspect_pairs"])

        exc = (
            6.0 * p_hits +                 # was 8.0
            2.0 * h_hits +                 # was 3.0
            8.0 * min(2, a_cnt) +          # was 10.0
            6.0 * min(a_pow, 1.0)          # was 8.0 * min(a_pow, 1.2)
        )

        # synergy bumps (trimmed)
        if key == "Leadership":
            if ("Sun" in bins_i.get(10,set())) or ("Sun" in bins_i.get(1,set())):
                exc += 2.0                  # was +6.0
        if key == "Entrepreneurial":
            if ("Rahu" in bins_i.get(10,set()) or "Rahu" in bins_i.get(11,set())):
                exc += 2.0                  # was +4.0
        if key == "Focus":
            if "Saturn" in bins_i.get(10,set()):
                exc += 2.0                  # was +4.0

        raw = base + _clamp(exc, 0.0, 36.0) # was up to ~42 possible
        curved = _soft_logistic(raw, mid=70.0, slope=0.09, lo=26.0, span=54.0)

        # floors: require ALL 3 buckets to fire
        buckets = sum([
            1 if p_hits >= 1 else 0,
            1 if h_hits >= 2 else 0,
            1 if a_cnt >= 1 else 0,
        ])

        hard_floor = 0.0
        if buckets >= 3:
            hard_floor = {
                "Leadership": 82.0,      # was 88
                "Entrepreneurial": 82.0, # was 86
                "Analytical": 78.0,      # was 82
                "Communication": 76.0,   # was 82
                "Creativity": 74.0,      # was 80
                "Focus": 78.0,           # was 82
            }.get(key, 76.0)

        final = int(round(_clamp(
            max(curved, hard_floor, float(SKILL_BASE_FLOOR[key])),
            5.0, float(SKILL_CAP[key])
        )))

        s["score"] = final
        s.setdefault("chips", []).append(
            f"chip.skill.tier.{('strong' if final>=80 else 'moderate' if final>=55 else 'weak')}"
        )




# ---- Entry point you call from your pipeline -------------------------------
def apply_excellence(domains_list: List[dict], skills_list: List[dict],
                     planets_in_houses: Dict[int, List[str] | Set[str]],
                     aspect_cfg: Dict[str, Any]) -> None:
    excellence_boost_domains(domains_list, planets_in_houses, aspect_cfg)
    excellence_boost_skills(skills_list, planets_in_houses)

# ---- Back-compat shim ---------------------def excellence_boost_skills---------------------------------
__all__ = [
    "apply_excellence",
    "excellence_boost_domains",
    "excellence_boost_skills",
    "excellence_boost_and_curve",
]

def excellence_boost_and_curve(*args, **kwargs):
    """
    Back-compat wrapper.

    Supports:
      old: excellence_boost_and_curve(domains_list, skills_list, planets_in_houses)
      new: excellence_boost_and_curve(domains_list, skills_list, planets_in_houses, aspect_cfg)
    """
    if len(args) == 3:
        domains_list, skills_list, planets_in_houses = args
        aspect_cfg = kwargs.get("aspect_cfg", {})  # safe default
    elif len(args) == 4:
        domains_list, skills_list, planets_in_houses, aspect_cfg = args
    else:
        raise TypeError("excellence_boost_and_curve expected 3 or 4 positional args")

    return apply_excellence(domains_list, skills_list, planets_in_houses, aspect_cfg)
