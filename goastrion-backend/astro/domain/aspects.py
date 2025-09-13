from __future__ import annotations
from typing import Dict, List
from .types import AspectRule, AspectHit, PlanetName

def _angle_diff(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

def _load_rules(aspect_cfg: dict) -> List[AspectRule]:
    rules: List[AspectRule] = []
    for item in aspect_cfg.get("aspects", []):
        rules.append(
            AspectRule(
                name=item["name"],
                angle=float(item["angle"]),
                orb=float(item.get("orb", item.get("maxOrb", 6))),
                # IMPORTANT: support both "weight" and "baseWeight"
                weight=float(item.get("weight", item.get("baseWeight", 1.0))),
                apply_to=item.get("apply_to") or None,
            )
        )
    return rules

def compute_aspects(planets_deg: Dict[PlanetName, float], aspect_cfg: dict) -> List[AspectHit]:
    """
    planets_deg: ecliptic longitudes (sidereal) in [0, 360)
    aspect_cfg: loaded JSON (AspectConfig.json)
    """
    rules = _load_rules(aspect_cfg)
    names: List[PlanetName] = list(planets_deg.keys())
    hits: List[AspectHit] = []

    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            p1, p2 = names[i], names[j]
            a1 = planets_deg[p1] % 360.0
            a2 = planets_deg[p2] % 360.0
            actual = _angle_diff(a1, a2)

            for r in rules:
                if r.apply_to and (p1 not in r.apply_to and p2 not in r.apply_to):
                    continue
                delta_to_exact = _angle_diff(actual, r.angle)
                if delta_to_exact <= r.orb:
                    # simple linear falloff inside orb
                    frac = 1.0 - (delta_to_exact / max(1e-6, r.orb))
                    score = r.weight * max(0.0, frac)
                    hits.append(
                        AspectHit(
                            p1=p1, p2=p2, name=r.name, exact=actual,
                            delta=delta_to_exact, score=score, applying=None
                        )
                    )
    return hits
