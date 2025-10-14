# astro/services/insights_pipeline.py
from __future__ import annotations
from typing import Any, Dict, List, Set, Tuple
from datetime import datetime

from ..utils.config import load_config
from ..utils.time import parse_client_iso_to_aware_utc, aware_utc_to_naive
from ..ephem.swiss import compute_all_planets, get_sign_name, deg_to_sign_index
from ..utils.astro import assign_planets_to_houses, sign_lord_for
from ..domain.aspects import compute_aspects
from ..domain.rules import evaluate_domains_v11, evaluate_skills_v11

# ⬅️ import the correct entry point (also okay to import the shim, but not needed)
from ..domain.scoring_boosters import apply_excellence


class InsightsError(Exception):
    pass


def _parse_and_validate(data: Dict[str, Any]) -> Tuple[datetime, float, float, float]:
    dt_str = (str(data.get("datetime") or "")).strip()
    if not dt_str:
        raise InsightsError("datetime required")
    try:
        lat = float(data.get("lat"))
        lon = float(data.get("lon"))
    except Exception:
        raise InsightsError("lat/lon must be numbers")
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
        raise InsightsError("lat/lon out of range")
    try:
        _ = float(data.get("tz_offset_hours", 0.0))
    except Exception:
        raise InsightsError("tz_offset_hours must be a number")
    try:
        dt_aw_utc = parse_client_iso_to_aware_utc(dt_str)
    except Exception as e:
        raise InsightsError(f"invalid datetime: {e}")
    return dt_aw_utc, lat, lon, float(data.get("tz_offset_hours", 0.0))


def _compute_chart(dt_aw_utc: datetime, lat: float, lon: float):
    dt_naive_utc = aware_utc_to_naive(dt_aw_utc)
    lagna_deg, positions = compute_all_planets(
        dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri"
    )
    lagna_sign = get_sign_name(lagna_deg)
    bins = assign_planets_to_houses(lagna_deg, positions)  # {1:[..], ...}
    asc_sign_idx = deg_to_sign_index(lagna_deg)
    chart_lords: Dict[int, str] = {}
    for h in range(1, 13):
        sign_index_for_house = (asc_sign_idx + (h - 1)) % 12
        chart_lords[h] = sign_lord_for(sign_index_for_house)

    planets_deg: Dict[str, float] = {"Asc": float(lagna_deg)}
    planets_deg.update({k: float(v) for k, v in positions.items()})
    return lagna_deg, lagna_sign, bins, chart_lords, planets_deg, positions


def _serialize_aspects(aspects) -> List[dict]:
    return [
        {
            "p1": hit.p1, "p2": hit.p2, "name": hit.name,
            "exact": hit.exact, "delta": hit.delta,
            "score": hit.score, "applying": hit.applying,
        }
        for hit in aspects
    ]


def _bins_int_sets(bins: Dict[int, List[str]]) -> Dict[int, set]:
    # kept for compatibility; not required by apply_excellence which normalizes internally
    out: Dict[int, set] = {}
    for k, v in (bins or {}).items():
        try:
            i = int(k)
        except Exception:
            continue
        out[i] = set(v or [])
    return out


def run_insights(payload: Dict[str, Any]) -> Dict[str, Any]:
    # 1) configs
    aspect_cfg, domain_rules = load_config()

    # 2) input
    dt_aw_utc, lat, lon, tz_off = _parse_and_validate(payload)

    # 3) chart primitives
    lagna_deg, lagna_sign, bins, chart_lords, planets_deg, positions = _compute_chart(dt_aw_utc, lat, lon)

    # 4) aspects (deterministic natal)
    aspects = compute_aspects(planets_deg, aspect_cfg)

    # 5) domains & skills
    domain_result = evaluate_domains_v11(
        domain_rules_json=domain_rules,
        aspect_cfg=aspect_cfg,
        planets_in_houses=bins,
        chart_lords=chart_lords,
        aspects=aspects,
    )
    domains_list: List[dict] = domain_result.get("domains", [])
    global_aspects: List[dict] = domain_result.get("globalAspects", [])

    skills_list: List[dict] = evaluate_skills_v11(
        aspect_cfg=aspect_cfg,
        planets_in_houses={str(k): v for k, v in bins.items()},
        aspects=aspects,
    )

    # 6) excellence booster (+ gentle curve) — pass ALL FOUR args
    apply_excellence(
        domains_list=domains_list,
        skills_list=skills_list,
        planets_in_houses=bins,   # no need to convert; booster normalizes keys
        aspect_cfg=aspect_cfg,
    )

    # 7) assemble context for FE debugging
    context = {
        "lagna_deg": lagna_deg,
        "lagna_sign": lagna_sign,
        "angles": {"Asc": lagna_deg},
        "planets": positions,
        "planets_in_houses": {str(k): v for k, v in bins.items()},
        "aspects": _serialize_aspects(aspects),
    }

    # 8) final envelope
    return {
        "input": {
            "datetime": payload.get("datetime"),
            "lat": lat,
            "lon": lon,
            "tz_offset_hours": tz_off,
        },
        "config": {
            "aspectVersion": str(aspect_cfg.get("version")),
            "domainVersion": str(domain_rules.get("version")),
        },
        "context": context,
        "insights": {
            "domains": domains_list,
            "globalAspects": global_aspects,
            "skills": skills_list,
        },
    }
