from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional, Tuple

PlanetName = Literal["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"]

@dataclass
class AspectRule:
    name: str                 # e.g., "conjunction"
    angle: float              # e.g., 0, 60, 90, 120, 180
    orb: float                # allowed deviation
    weight: float             # base weight contribution
    apply_to: List[PlanetName] | None = None  # if limited

@dataclass
class AspectHit:
    p1: PlanetName
    p2: PlanetName
    name: str
    exact: float              # exact angle
    delta: float              # |actual - exact|
    score: float              # rule weight, can be adjusted
    applying: bool | None = None

@dataclass
class DomainRule:
    domain: str               # "career", "finance", ...
    include_houses: List[int] # houses that strengthen
    include_lords: List[PlanetName]
    aspect_weights: Dict[str, float]  # {"conjunction": 1.0, "trine": 0.8 ...}
    yoga_boosts: Dict[str, float]     # {"raj_yoga": 1.5, ...}
    min_score: float
