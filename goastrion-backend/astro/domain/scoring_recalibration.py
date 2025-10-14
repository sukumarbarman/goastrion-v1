# scoring_recalibration.py
# ------------------------------------------------------------
# What this does
# - Deflates raw 0–100 scores into realistic bands (no more auto-80s)
# - Adds percentiles using your baseline μ/σ per domain/skill
# - Applies a narrow "Elite Override" (+2..+5 max) to top 1–2 domains
#   when independent strong signals are present
#
# How to use
# 1) Call `recalibrate_all(domains, skills)` right before you serialize.
#    Each domain/skill item must have:
#      - "key": str
#      - "score": float  (raw/pre-existing)
#      - "highlights": {
#            "parts": { "natal_presence": float, "lord": float,
#                       "aspects": float, "karaka": float, ... },
#            "aspects": [ { "score": float, ... }, ... ]
#        }
#    (If some fields are missing, the code degrades gracefully.)
# 2) Optional: pass benefic/malefic occupant share if you have it:
#    domain_item.get("benefic_pct"), domain_item.get("malefic_pct")
# 3) Replace BASELINE_STATS with your own μ/σ (learned from your population).
# ------------------------------------------------------------

from math import erf, sqrt

# ------------------------------------------------------------
# 1) Tunables (caps, curves, baselines)
# ------------------------------------------------------------

# Practical caps (before Elite Override)
DOMAIN_CAPS = {
    # strong domains rarely exceed ~86 without override
    "Career": 86, "Finance": 86, "Health": 78, "Marriage": 76, "Education": 80
}
SKILL_CAPS = {
    # skills cap lower by default; keeps separation meaningful
    "Analytical": 74, "Communication": 74, "Leadership": 76, "Creativity": 74,
    "Focus": 74, "Entrepreneurial": 78
}

# Floors (hard minimums to avoid collapsing weak results too far)
DOMAIN_FLOOR = 38
SKILL_FLOOR = 34

# Deflation curve (“gamma” > 1 compresses the top end)
DOMAIN_GAMMA = 1.22
SKILL_GAMMA  = 1.18

# Elite-override amounts (applied only to the top N domains that pass the gate)
ELITE_TOP1_BONUS = 4    # e.g., 86 → up to 90
ELITE_TOP2_BONUS = 2    # e.g., 83 → up to 85

# Percentile baselines (replace with your learned μ/σ from a few 10Ks of charts)
# μ/σ should be the distribution *after* your raw scoring but *before* this recalibration
BASELINE_STATS = {
    "domains": {
        "Career":     {"mu": 63, "sigma": 9.0},
        "Finance":    {"mu": 62, "sigma": 9.5},
        "Health":     {"mu": 58, "sigma": 8.5},
        "Marriage":   {"mu": 57, "sigma": 8.0},
        "Education":  {"mu": 60, "sigma": 8.5},
        "_default":   {"mu": 60, "sigma": 9.0},
    },
    "skills": {
        "Analytical":      {"mu": 56, "sigma": 8.0},
        "Communication":   {"mu": 56, "sigma": 8.0},
        "Leadership":      {"mu": 57, "sigma": 8.0},
        "Creativity":      {"mu": 55, "sigma": 8.0},
        "Focus":           {"mu": 56, "sigma": 8.0},
        "Entrepreneurial": {"mu": 59, "sigma": 8.5},
        "_default":        {"mu": 57, "sigma": 8.0},
    }
}

# ------------------------------------------------------------
# 2) Helpers
# ------------------------------------------------------------

def _norm_cdf(z: float) -> float:
    # standard normal CDF using erf; returns [0,1]
    return 0.5 * (1.0 + erf(z / sqrt(2.0)))

def _to_percentile(score: float, mu: float, sigma: float) -> int:
    if sigma <= 1e-6:  # safety
        return 50
    pct = _norm_cdf((score - mu) / sigma)
    # return integer percentile 1..99 for display
    return max(1, min(99, int(round(100 * pct))))

def _deflate(raw: float, cap: float, floor_val: float, gamma: float) -> float:
    # Map raw∈[0,100] → practical band [floor, cap] with top-end compression
    s = max(0.0, min(100.0, raw)) / 100.0
    y = s ** gamma
    return floor_val + (cap - floor_val) * y

def _count_high_power_aspects(aspects: list, threshold=0.70) -> int:
    if not aspects:
        return 0
    return sum(1 for a in aspects if isinstance(a, dict) and a.get("score", 0) >= threshold)

def _elite_gate(parts: dict, aspects: list, benefic_pct: float | None, malefic_pct: float | None) -> bool:
    """Gate for Elite Override. All conditions must hold."""
    parts = parts or {}
    np_ = float(parts.get("natal_presence", 0))
    lord = float(parts.get("lord", 0))
    kara = float(parts.get("karaka", 0))
    asp  = float(parts.get("aspects", 0))

    # 1) independent strengths
    cond_parts = (np_ >= 0.85) and (lord >= 0.70) and (kara >= 0.80)
    # 2) aspects: at least 2 high-power ones
    cond_aspects = (_count_high_power_aspects(aspects) >= 2)
    # 3) malefic not dominating (if provided)
    if benefic_pct is None or malefic_pct is None:
        cond_mix = True
    else:
        cond_mix = (benefic_pct >= malefic_pct - 10)  # allow up to 10% disadvantage
    return cond_parts and cond_aspects and cond_mix

def _cap_for_domain(key: str) -> float:
    return DOMAIN_CAPS.get(key, 82)

def _cap_for_skill(key: str) -> float:
    return SKILL_CAPS.get(key, 74)

def _baseline_for(kind: str, key: str) -> tuple[float, float]:
    tbl = BASELINE_STATS["domains" if kind == "domain" else "skills"]
    st = tbl.get(key, tbl["_default"])
    return float(st["mu"]), float(st["sigma"])

# ------------------------------------------------------------
# 3) Public API
# ------------------------------------------------------------

def recalibrate_domains(domains: list[dict]) -> list[dict]:
    """Returns a new list with deflated scores, elite override, and percentiles."""
    if not domains:
        return []

    # 1) Precompute elite-eligible domains (for gating the top two later)
    eligible_flags = []
    for d in domains:
        parts     = (d.get("highlights") or {}).get("parts") or {}
        aspects   = (d.get("highlights") or {}).get("aspects") or []
        benefic   = d.get("benefic_pct")  # optional
        malefic   = d.get("malefic_pct")  # optional
        eligible_flags.append(_elite_gate(parts, aspects, benefic, malefic))

    # 2) Deflate all domain scores to practical bands
    deflated = []
    for d in domains:
        key   = d.get("key", "Unknown")
        cap   = _cap_for_domain(key)
        raw   = float(d.get("score", 0))
        new_s = _deflate(raw, cap=cap, floor_val=DOMAIN_FLOOR, gamma=DOMAIN_GAMMA)
        out   = dict(d)
        out["score"] = round(new_s)
        deflated.append(out)

    # 3) Elite Override — apply to top 1–2 domains that are eligible
    #    (re-rank by deflated scores so we don’t bias by raw ordering)
    ranked_idx = sorted(range(len(deflated)), key=lambda i: deflated[i]["score"], reverse=True)
    applied = 0
    for idx in ranked_idx:
        if not eligible_flags[idx]:
            continue
        key = deflated[idx].get("key", "Unknown")
        base_cap = _cap_for_domain(key)
        bonus = ELITE_TOP1_BONUS if applied == 0 else (ELITE_TOP2_BONUS if applied == 1 else 0)
        if bonus <= 0:
            break
        hard_cap = base_cap + bonus
        deflated[idx]["score"] = min(int(round(deflated[idx]["score"] + bonus)), hard_cap)
        applied += 1
        if applied >= 2:
            break

    # 4) Add percentiles (based on the *deflated* score, which is what users see)
    for d in deflated:
        mu, sigma = _baseline_for("domain", d.get("key", "Unknown"))
        d["percentile"] = _to_percentile(float(d["score"]), mu, sigma)

    return deflated


def recalibrate_skills(skills: list[dict]) -> list[dict]:
    """Deflate skills, add percentiles. (No elite override by default.)
       If you want a narrow override for e.g. Entrepreneurial, extend similarly."""
    if not skills:
        return []

    out = []
    for s in skills:
        key   = s.get("key", "Unknown")
        cap   = _cap_for_skill(key)
        raw   = float(s.get("score", 0))
        new_s = _deflate(raw, cap=cap, floor_val=SKILL_FLOOR, gamma=SKILL_GAMMA)

        # Optional: micro-override for Entrepreneurial when very stacked
        if key == "Entrepreneurial":
            hl = (s.get("highlights") or {})
            parts   = (hl.get("parts") or {})
            aspects = (hl.get("aspects") or [])
            strong = _elite_gate(parts, aspects, benefic_pct=None, malefic_pct=None)
            if strong:
                new_s = min(new_s + 2, cap + 2)  # tiny nudge; never dramatic

        mu, sigma = _baseline_for("skills", key)
        item = dict(s)
        item["score"] = int(round(new_s))
        item["percentile"] = _to_percentile(float(item["score"]), mu, sigma)
        out.append(item)

    return out


def recalibrate_all(domains: list[dict], skills: list[dict]) -> tuple[list[dict], list[dict]]:
    return recalibrate_domains(domains), recalibrate_skills(skills)
