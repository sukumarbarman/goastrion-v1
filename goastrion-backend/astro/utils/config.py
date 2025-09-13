# astro/utils/config.py
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple, Optional


_CFG_ENV = "GOASTRION_CFG_DIR"


# ------------------------- path helpers ------------------------- #
def _cfg_dir() -> Path:
    """
    Returns the directory that contains the config JSON files.
    Priority: env var GOASTRION_CFG_DIR → repo fallback (../config).
    """
    env = os.environ.get(_CFG_ENV)
    if env:
        p = Path(env).expanduser().resolve()
        if p.is_dir():
            return p

    # fallback: .../goastrion-backend/astro/utils -> ../../../config
    here = Path(__file__).resolve().parent
    fallback = (here / "../../../config").resolve()
    return fallback


def _first_existing(base: Path, candidates: List[str]) -> Optional[Path]:
    """Return the first candidate path that exists under base, else None."""
    for name in candidates:
        p = (base / name).resolve()
        if p.is_file():
            return p
    return None


# ------------------------- validation helpers ------------------------- #
def _err(prefix: str, msg: str) -> ValueError:
    return ValueError(f"{prefix}: {msg}")


def _require_keys(d: Dict[str, Any], keys: List[str], where: str) -> None:
    missing = [k for k in keys if k not in d]
    if missing:
        raise _err(where, f"missing keys {missing}")


def _as_float(x: Any, where: str) -> float:
    try:
        return float(x)
    except Exception:
        raise _err(where, f"expected number, got {type(x).__name__}")


def _validate_and_normalize_aspect_cfg(cfg: Dict[str, Any], where: str) -> Dict[str, Any]:
    # Top level presence
    _require_keys(cfg, ["version", "zodiacType", "ayanamsa", "houseSystem", "bodies", "aspects"], where)

    # Normalize bodies: allow ["Sun","Moon",...] OR [{"id":"Sun","type":"planet"},...]
    bodies_in = cfg.get("bodies", [])
    if not isinstance(bodies_in, list) or not bodies_in:
        raise _err(where, "`bodies` must be a non-empty list")
    bodies_out: List[Dict[str, str]] = []
    for i, b in enumerate(bodies_in):
        if isinstance(b, str):
            bid = b.strip()
            btype = "angle" if bid in ("Asc", "MC") else "planet" if bid not in ("Rahu", "Ketu") else "node"
            bodies_out.append({"id": bid, "type": btype})
        elif isinstance(b, dict):
            if "id" not in b:
                raise _err(where, f"bodies[{i}] missing `id`")
            btype = b.get("type") or ("angle" if b["id"] in ("Asc", "MC") else "planet")
            bodies_out.append({"id": str(b["id"]), "type": str(btype)})
        else:
            raise _err(where, f"bodies[{i}] must be string or object")
    cfg["bodies"] = bodies_out

    # Normalize aspects list entries; accept 'maxOrb' alias
    aspects = cfg.get("aspects", [])
    if not isinstance(aspects, list) or not aspects:
        raise _err(where, "`aspects` must be a non-empty list")
    a_out: List[Dict[str, Any]] = []
    for i, a in enumerate(aspects):
        if not isinstance(a, dict):
            raise _err(where, f"aspects[{i}] must be an object")
        name = a.get("name")
        angle = a.get("angle")
        orb = a.get("orb", a.get("maxOrb", None))
        base_weight = a.get("baseWeight", 1.0)
        if name is None or angle is None or orb is None:
            raise _err(where, f"aspects[{i}] must have name, angle, orb")
        angle_f = _as_float(angle, f"{where}.aspects[{i}].angle")
        orb_f = _as_float(orb, f"{where}.aspects[{i}].orb")
        bw_f = _as_float(base_weight, f"{where}.aspects[{i}].baseWeight")
        if orb_f < 0:
            raise _err(where, f"aspects[{i}].orb must be >= 0")

        norm = {
            "name": str(name),
            "angle": angle_f,
            "orb": orb_f,
            "baseWeight": bw_f,
        }
        # pass-through optional flags
        if "allowSelf" in a:
            norm["allowSelf"] = bool(a["allowSelf"])
        a_out.append(norm)
    cfg["aspects"] = a_out

    # orbPolicy (optional but if present, check types)
    if "orbPolicy" in cfg:
        op = cfg["orbPolicy"]
        if not isinstance(op, dict):
            raise _err(where, "`orbPolicy` must be an object")
        # No strict schema, just basic sanity:
        if "model" in op and not isinstance(op["model"], str):
            raise _err(where, "`orbPolicy.model` must be string")

    # scoring (optional)
    if "scoring" in cfg:
        sc = cfg["scoring"]
        if not isinstance(sc, dict):
            raise _err(where, "`scoring` must be an object")
        if "cap" in sc:
            _as_float(sc["cap"], f"{where}.scoring.cap")

    # Optional sets: no strict type enforcement beyond dict
    for k in ["benefics", "malefics"]:
        if k in cfg and not isinstance(cfg[k], list):
            raise _err(where, f"`{k}` must be a list")

    # dignitySets/rulerships are dictionaries if present
    for k in ["rulerships", "dignitySets"]:
        if k in cfg and not isinstance(cfg[k], dict):
            raise _err(where, f"`{k}` must be an object")

    return cfg


def _validate_and_normalize_domain_rules(cfg: Dict[str, Any], where: str) -> Dict[str, Any]:
    _require_keys(cfg, ["version", "domains"], where)
    domains = cfg.get("domains")
    if not isinstance(domains, dict) or not domains:
        raise _err(where, "`domains` must be a non-empty object")

    for dname, dom in domains.items():
        dw = f"{where}.domains[{dname}]"

        # weights
        _require_keys(dom, ["weights", "thresholds", "rules", "strings"], dw)
        weights = dom["weights"]
        if not isinstance(weights, dict):
            raise _err(dw, "`weights` must be an object")
        needed = ["natal", "transit", "dasha", "progressed"]
        for k in needed:
            if k not in weights:
                raise _err(dw, f"`weights.{k}` missing")
            _as_float(weights[k], f"{dw}.weights.{k}")
        # allow small floating error (~1%)
        total_w = sum(float(weights[k]) for k in needed)
        if not (0.99 <= total_w <= 1.01):
            raise _err(dw, f"weights must sum to ~1.0 (got {total_w:.3f})")

        # thresholds
        th = dom["thresholds"]
        if not isinstance(th, dict):
            raise _err(dw, "`thresholds` must be an object")
        for k in ["weak", "moderate", "strong", "excellent"]:
            if k not in th:
                raise _err(dw, f"`thresholds.{k}` missing")
            _as_float(th[k], f"{dw}.thresholds.{k}")
        if not (th["weak"] <= th["moderate"] <= th["strong"] <= th["excellent"]):
            raise _err(dw, "thresholds must be monotonic (weak ≤ moderate ≤ strong ≤ excellent)")

        # rules
        rules = dom["rules"]
        if not isinstance(rules, list):
            raise _err(dw, "`rules` must be a list")
        for i, r in enumerate(rules):
            rw = f"{dw}.rules[{i}]"
            if not isinstance(r, dict):
                raise _err(rw, "must be an object")
            _require_keys(r, ["id", "sources", "when", "score", "explainKey"], rw)
            if not isinstance(r["id"], str):
                raise _err(rw, "`id` must be string")
            if not isinstance(r["sources"], list) or not all(isinstance(s, str) for s in r["sources"]):
                raise _err(rw, "`sources` must be a string list")
            if not isinstance(r["when"], dict):
                raise _err(rw, "`when` must be an object")
            if not isinstance(r["score"], dict):
                raise _err(rw, "`score` must be an object")
            # score must be either fixed value or (scale + multiplier)
            sc = r["score"]
            if "value" in sc:
                _as_float(sc["value"], f"{rw}.score.value")
            else:
                if "scale" not in sc or "multiplier" not in sc:
                    raise _err(rw, "`score` needs either `value` or (`scale` and `multiplier`)")
                if not isinstance(sc["scale"], str):
                    raise _err(rw, "`score.scale` must be string")
                _as_float(sc["multiplier"], f"{rw}.score.multiplier")

            # optional numeric guards
            if "cooldownDays" in r:
                _as_float(r["cooldownDays"], f"{rw}.cooldownDays")

        # strings
        strings = dom["strings"]
        if not isinstance(strings, dict):
            raise _err(dw, "`strings` must be an object")
        if "titleKey" not in strings or not isinstance(strings["titleKey"], str):
            raise _err(dw, "`strings.titleKey` missing or not string")
        if "chips" in strings and (not isinstance(strings["chips"], list) or not all(isinstance(x, str) for x in strings["chips"])):
            raise _err(dw, "`strings.chips` must be a string list")

    # classes (optional)
    if "classes" in cfg:
        cls = cfg["classes"]
        if not isinstance(cls, dict):
            raise _err(where, "`classes` must be an object")
        for cname, arr in cls.items():
            if not isinstance(arr, list) or not all(isinstance(x, str) for x in arr):
                raise _err(where, f"`classes.{cname}` must be a string list")

    return cfg


# ------------------------- public API ------------------------- #
def load_config() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Reads and validates AspectConfig.json and DomainRuleSet.json.
    Returns (aspect_cfg, domain_rules).
    Raises FileNotFoundError / JSONDecodeError / ValueError with context.
    """
    cfg_dir = _cfg_dir()

    aspect_path = _first_existing(cfg_dir, ["AspectConfig.json", "aspect_config.json"])
    domain_path = _first_existing(cfg_dir, ["DomainRuleSet.json", "domain_rules.json"])

    if aspect_path is None:
        raise FileNotFoundError(
            f"Aspect config not found in {cfg_dir} (looked for AspectConfig.json, aspect_config.json)"
        )
    if domain_path is None:
        raise FileNotFoundError(
            f"Domain rules not found in {cfg_dir} (looked for DomainRuleSet.json, domain_rules.json)"
        )

    try:
        with aspect_path.open("r", encoding="utf-8") as f:
            aspect_cfg = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"{aspect_path.name}: invalid JSON at line {e.lineno} col {e.colno}: {e.msg}")

    try:
        with domain_path.open("r", encoding="utf-8") as f:
            domain_rules = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"{domain_path.name}: invalid JSON at line {e.lineno} col {e.colno}: {e.msg}")

    aspect_cfg = _validate_and_normalize_aspect_cfg(aspect_cfg, aspect_path.name)
    domain_rules = _validate_and_normalize_domain_rules(domain_rules, domain_path.name)

    return aspect_cfg, domain_rules
