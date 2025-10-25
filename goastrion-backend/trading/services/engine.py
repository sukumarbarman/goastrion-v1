
from __future__ import annotations
from datetime import date, datetime, timedelta
from typing import Dict, Any, List, Tuple
from astral import LocationInfo
from astral.sun import sun

from ..constants import DAY_LORD, HORA_SEQUENCE, ASSET_AFFINITY, BIAS_THRESH_UP, BIAS_THRESH_DOWN
from ..models import TradingAsset, TradingDaily
from ..utils.sessions import get_session_for

ENGINE_VERSION = "1.1.0"
MUMBAI = LocationInfo(name="Mumbai", region="IN", timezone="Asia/Kolkata", latitude=19.0760, longitude=72.8777)

def _hm_to_minutes(hm: str) -> int:
    h, m = hm.split(":"); return int(h)*60 + int(m)

def _minutes_to_hm(n: int) -> str:
    n = max(0, min(n, 24*60-1)); h = n//60; m = n%60; return f"{h:02d}:{m:02d}"

def _split_day_eighths(sr: datetime, ss: datetime) -> List[tuple]:
    total = (ss - sr).total_seconds()
    seg = total / 8.0
    slots = []
    for i in range(8):
        a = sr + timedelta(seconds=seg*i)
        b = sr + timedelta(seconds=seg*(i+1))
        slots.append((a,b))
    return slots

def _compute_rahu_yama_gulika(d0: date, loc: LocationInfo):
    sdict = sun(loc.observer, date=d0, tzinfo=loc.timezone)
    sr = sdict["sunrise"]; ss = sdict["sunset"]
    slots = _split_day_eighths(sr, ss)
    wd = d0.weekday()  # Mon=0..Sun=6
    def fmt(a, b): return a.strftime("%H:%M"), b.strftime("%H:%M")
    rahu = fmt(*{6: slots[7], 0: slots[1], 1: slots[6], 2: slots[4], 3: slots[5], 4: slots[3], 5: slots[2]}[wd])
    yama = fmt(*{6: slots[4], 0: slots[3], 1: slots[2], 2: slots[1], 3: slots[0], 4: slots[6], 5: slots[5]}[wd])
    gulika = fmt(*{6: slots[6], 0: slots[5], 1: slots[4], 2: slots[3], 3: slots[2], 4: slots[1], 5: slots[0]}[wd])
    return {"rahu": rahu, "yama": yama, "gulika": gulika}

def _compute_abhijit(d0: date, loc: LocationInfo):
    sdict = sun(loc.observer, date=d0, tzinfo=loc.timezone)
    sr = sdict["sunrise"]; ss = sdict["sunset"]
    day_len = (ss - sr).total_seconds()
    mid = sr + timedelta(seconds=day_len/2)
    dur = day_len/15.0  # ~1/15th of daytime
    a = (mid - timedelta(seconds=dur/2)).strftime("%H:%M")
    b = (mid + timedelta(seconds=dur/2)).strftime("%H:%M")
    return a, b

def _compute_horas(d0: date, loc: LocationInfo):
    sdict = sun(loc.observer, date=d0, tzinfo=loc.timezone)
    sr = sdict["sunrise"]; ss = sdict["sunset"]
    day_len = (ss - sr).total_seconds()
    seg = day_len / 12.0
    lord = DAY_LORD[d0.weekday()]
    start_idx = HORA_SEQUENCE.index(lord)
    seq = HORA_SEQUENCE[start_idx:] + HORA_SEQUENCE[:start_idx]
    horas = []
    for i, ruler in enumerate(seq):
        a = sr + timedelta(seconds=i*seg)
        b = sr + timedelta(seconds=(i+1)*seg)
        horas.append((a.strftime("%H:%M"), b.strftime("%H:%M"), ruler))
    return horas

def _affinity_for_asset(asset: TradingAsset):
    k = asset.kind
    aid = asset.id.upper()
    if k == "sector":
        if "BANK" in aid and "PSU" not in aid and "PVT" not in aid:
            return ASSET_AFFINITY["BANK"]
        if "IT" in aid: return ASSET_AFFINITY["IT"]
        if "AUTO" in aid: return ASSET_AFFINITY["AUTO"]
        if "FMCG" in aid: return ASSET_AFFINITY["FMCG"]
        if "PHARMA" in aid: return ASSET_AFFINITY["PHARMA"]
        if "METAL" in aid: return ASSET_AFFINITY["METAL"]
        if "ENERGY" in aid: return ASSET_AFFINITY["ENERGY"]
        if "REALTY" in aid: return ASSET_AFFINITY["REALTY"]
        if "PSU" in aid: return ASSET_AFFINITY["PSU"]
        if "PVT" in aid: return ASSET_AFFINITY["PVTBANK"]
    if k == "commodity":
        if "CRUDE" in aid: return ASSET_AFFINITY["CRUDE"]
        if "NATGAS" in aid: return ASSET_AFFINITY["NATGAS"]
        if "GOLD" in aid: return ASSET_AFFINITY["GOLD"]
        if "SILVER" in aid: return ASSET_AFFINITY["SILVER"]
    if k == "crypto":
        return ASSET_AFFINITY["BTC"]
    return ASSET_AFFINITY["INDEX"]

def _score_slot(asset: TradingAsset, hora_ruler: str, in_abhijit: bool, in_rahu: bool, in_yama: bool, in_gulika: bool):
    reasons: List[str] = []
    s = 0
    vol = "med"
    aff = _affinity_for_asset(asset)
    hora_w = aff.get(hora_ruler, 0)
    if hora_w:
        s += hora_w
        reasons.append(f"{hora_ruler.upper()}_HORA")
    if in_abhijit:
        s += 10
        reasons.append("ABHIJIT_MUHURAT")
        vol = "high"
    caution = False
    if in_rahu:
        s -= 10
        reasons.append("RAHU_KAAL")
        vol = "high"; caution = True
    if in_yama:
        s -= 6; reasons.append("YAMAGANDA")
    if in_gulika:
        s -= 6; reasons.append("GULIKA_KAAL")
    return s, reasons, caution, vol

def _decide_bias(signed_score: int) -> str:
    if signed_score >= BIAS_THRESH_UP: return "up"
    if signed_score <= BIAS_THRESH_DOWN: return "down"
    return "choppy"

def compute_daily_bands(asset: TradingAsset, d: date, *, force: bool = False) -> TradingDaily:
    existing = TradingDaily.objects.filter(asset=asset, date=d).first()
    if existing and not force:
        return existing
    session = get_session_for(asset, d)
    loc = MUMBAI
    abh_a, abh_b = _compute_abhijit(d, loc)
    ryf = _compute_rahu_yama_gulika(d, loc)
    rah_a, rah_b = ryf["rahu"]
    yam_a, yam_b = ryf["yama"]
    gul_a, gul_b = ryf["gulika"]
    horas = _compute_horas(d, loc)

    start_m = _hm_to_minutes(session.start)
    end_m = _hm_to_minutes(session.end)
    if start_m >= end_m:
        start_m, end_m = 9*60+15, 15*60+30

    def in_range(a: str, b: str, t: int) -> bool:
        return _hm_to_minutes(a) <= t < _hm_to_minutes(b)

    slots: List[Dict[str, Any]] = []
    t = start_m
    while t < end_m:
        hora_ruler = "Sun"
        for ha, hb, r in horas:
            if in_range(ha, hb, t):
                hora_ruler = r; break
        in_abh = in_range(abh_a, abh_b, t)
        in_rah = in_range(rah_a, rah_b, t)
        in_yam = in_range(yam_a, yam_b, t)
        in_gul = in_range(gul_a, gul_b, t)
        s, reasons, caution, vol = _score_slot(asset, hora_ruler, in_abh, in_rah, in_yam, in_gul)
        bias = _decide_bias(s)
        conf = max(0, min(100, 50 + abs(s)*2 + (10 if in_abh else 0)))
        slots.append({
            "start": _minutes_to_hm(t),
            "end": _minutes_to_hm(min(t+5, end_m)),
            "bias": bias,
            "confidence": conf,
            "volatility": vol,
            "reasons": reasons[:2],
            "caution": caution,
        })
        t += 5

    merged: List[Dict[str, Any]] = []
    cur = None
    for b in slots:
        if not cur:
            cur = dict(b); continue
        same_bias = b["bias"] == cur["bias"] and b.get("caution") == cur.get("caution") and b.get("volatility") == cur.get("volatility")
        if same_bias:
            cur["end"] = b["end"]
            cur["confidence"] = max(cur["confidence"], b["confidence"])
            rset = []
            for r in cur.get("reasons", []) + b.get("reasons", []):
                if r not in rset: rset.append(r)
            cur["reasons"] = rset[:2]
        else:
            merged.append(cur); cur = dict(b)
    if cur: merged.append(cur)

    td, _ = TradingDaily.objects.update_or_create(
        asset=asset, date=d,
        defaults=dict(
            tz=asset.tz,
            session_start=session.start,
            session_end=session.end,
            bands=merged,
            engine_version=ENGINE_VERSION,
        )
    )
    return td
