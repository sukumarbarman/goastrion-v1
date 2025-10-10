from __future__ import annotations

from datetime import datetime, timezone,timedelta, date


from rest_framework.permissions import AllowAny

from .charts.north_indian import render_north_indian_chart_svg
from .ephem.swiss import compute_all_planets, get_sign_name, compute_angles, deg_to_sign_index
from .utils.astro import (
    assign_planets_to_houses, build_summary, NAKSHATRAS,
    sign_lord_for, geocode_place,
)
from .dasha.vimshottari import compute_vimshottari_full, Period, DashaTimeline


from .domain.rules import evaluate_domains_v11, evaluate_skills_v11


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from typing import Any, Dict, List

from .utils.config import load_config
from .utils.time import parse_client_iso_to_aware_utc, aware_utc_to_naive
from .ephem.swiss import compute_all_planets, get_sign_name
from .utils.astro import assign_planets_to_houses
from .domain.aspects import compute_aspects



from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Tuple, Optional, Any

from zoneinfo import ZoneInfo
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .domain.insights import build_domain_insights, build_skill_insights
from .domain.transits import compute_transit_hits_now

from zoneinfo import ZoneInfo
from .ephem.swiss import compute_all_planets, compute_angles, compute_all_planets
from .domain.transits import compute_transit_hits_now
from .shubhdin_helpers import (
    duration_days, fmt_start_end_duration, normalize_scores, best_window,
    grow_window, non_overlapping_top_windows, dedupe_windows,
    angle_diff, dates_in_range, format_dates_list_ascii, make_caution_line
)

# --- add near your other imports ---
from datetime import datetime, timezone, timedelta, date
from zoneinfo import ZoneInfo

from .ephem.swiss import compute_all_planets, compute_angles
from .domain.saturn_watch import saturn_overview
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny



# ---------------- Geocode ---------------- #

class GeocodeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        place = request.query_params.get("place", "").strip()
        if not place:
            return Response({"error": "Query parameter 'place' is required"}, status=400)

        address, lat, lon = geocode_place(place)
        if not (address and lat and lon):
            return Response({"error": "Location not found"}, status=404)

        return Response({"place": place, "address": address, "lat": lat, "lon": lon})


# ------------- Vimshottari helpers ------------- #

def _serialize_period(p: Period) -> Dict[str, Any]:
    return {
        "lord": p.lord,
        "start": p.start.replace(tzinfo=timezone.utc).isoformat(),
        "end": p.end.replace(tzinfo=timezone.utc).isoformat(),
        "years": float(p.years),
    }

def _serialize_timeline(tl: DashaTimeline) -> Dict[str, Any]:
    md_list: List[Dict[str, Any]] = [_serialize_period(p) for p in tl.mahadashas]
    ad_map: Dict[str, List[Dict[str, Any]]] = {}
    for md in tl.mahadashas:
        key = f"{md.lord}@{md.start.replace(tzinfo=timezone.utc).isoformat()}"
        ad_map[key] = [_serialize_period(p) for p in tl.antardashas.get(key, [])]
    return {"mahadashas": md_list, "antardashas": ad_map}


# ---------------- ChartView ---------------- #

class ChartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data: Dict[str, Any] = request.data or {}
            dt_str = (data.get("datetime") or "").strip()
            lat_raw, lon_raw = data.get("lat"), data.get("lon")
            client_tz_off = data.get("tz_offset_hours", 0.0)

            # validate
            if not dt_str:
                return Response({"error": "datetime required"}, status=400)
            try:
                lat = float(lat_raw)
                lon = float(lon_raw)
            except Exception:
                return Response({"error": "lat/lon must be numbers"}, status=400)
            if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                return Response({"error": "lat/lon out of range"}, status=400)

            # normalize to aware UTC
            try:
                iso = dt_str.replace("Z", "+00:00")
                dt_aw = datetime.fromisoformat(iso)
            except Exception as e:
                return Response({"error": f"invalid datetime: {e}"}, status=400)
            if dt_aw.tzinfo is None:
                dt_aw = dt_aw.replace(tzinfo=timezone.utc)
            else:
                dt_aw = dt_aw.astimezone(timezone.utc)

            dt_utc_naive = dt_aw.replace(tzinfo=None)

            tz_off_for_chart = 0.0
            tz_off_for_dasha = 0.0

            warnings: List[str] = []
            try:
                client_off = float(client_tz_off)
                if abs(client_off) > 1e-9:
                    warnings.append(f"Client tz_offset_hours={client_off} ignored; astronomy uses UTC.")
            except Exception:
                warnings.append("Client tz_offset_hours malformed; ignored (using 0.0).")

            # chart (legacy ayanamsa=None to match your prior behavior)
            lagna_deg, planets = compute_all_planets(dt_utc_naive, lat, lon, tz_off_for_chart, ayanamsa=None)
            lagna_sign = get_sign_name(lagna_deg)
            bins = assign_planets_to_houses(lagna_deg, planets)

            svg = render_north_indian_chart_svg(
                lagna_deg=lagna_deg, lagna_sign=lagna_sign, planets_in_houses=bins, size=420
            )
            summary = build_summary(dt_utc_naive, lat, lon, tz_off_for_chart)

            # dasha (UTC + Lahiri)
            tl = compute_vimshottari_full(dt_aw, lat, lon, tz_off_for_dasha, horizon_years=120.0)
            vim = _serialize_timeline(tl)

            # debug moon under Lahiri
            _, pos_dbg = compute_all_planets(dt_utc_naive, lat, lon, tz_off_for_chart, ayanamsa="lahiri")
            moon_lon = pos_dbg["Moon"]
            seg = 360.0 / 27.0
            idx = int(moon_lon // seg) % 27
            within = moon_lon - (idx * seg)
            frac = within / seg
            start_lords = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] * 3
            start_lord = start_lords[idx]
            lord_years = {"Ketu":7,"Venus":20,"Sun":6,"Moon":10,"Mars":7,"Rahu":18,"Jupiter":16,"Saturn":19,"Mercury":17}[start_lord]
            balance = lord_years * (1.0 - frac)

            meta: Dict[str, Any] = {
                "lagna_deg": lagna_deg,
                "lagna_sign": lagna_sign,
                "planets": planets,
                "planets_in_houses": bins,
                "vimshottari": vim,
                "vimshottari_debug": {
                    "utc_iso": dt_aw.isoformat(),
                    "ayanamsa": "lahiri",
                    "tz_offset_for_dasha": tz_off_for_dasha,
                    "moon_lon_deg": round(moon_lon, 5),
                    "nakshatra": f"{NAKSHATRAS[idx]} (index {idx})",
                    "fraction_elapsed_pct": round(frac * 100, 3),
                    "start_md_lord": start_lord,
                    "start_md_balance_years": round(balance, 5),
                },
            }
            if warnings:
                meta["warnings"] = warnings

            return Response({"svg": svg, "summary": summary, "meta": meta})

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------- InsightsView ---------------- #
# astro/api_views.py (replace the InsightsView class only)

# astro/api_views.py (complete InsightsView)

# --- keep your existing imports at the top of api_views.py ---

# --- Insights API -------------------------------------------------------------



class InsightsView(APIView):
    """
    POST /api/insights
    {
      "datetime": "1990-11-20T17:30:00Z",
      "lat": 22.30,
      "lon": 87.92,
      "tz_offset_hours": 5.5   # ignored for astronomy; UTC is used internally
    }
    """
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # 1) Load validated configs (AspectConfig.json, DomainRuleSet.json)
            try:
                aspect_cfg, domain_rules = load_config()
            except Exception as e:
                return Response({"error": f"config: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 2) Parse & validate input
            data: Dict[str, Any] = request.data or {}
            dt_str = (data.get("datetime") or "").strip()
            if not dt_str:
                return Response({"error": "datetime required"}, status=400)

            try:
                lat = float(data.get("lat"))
                lon = float(data.get("lon"))
            except Exception:
                return Response({"error": "lat/lon must be numbers"}, status=400)

            if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                return Response({"error": "lat/lon out of range"}, status=400)

            # Note: we accept tz_offset_hours but ignore it for core astronomy
            try:
                _ = float(data.get("tz_offset_hours", 0.0))
            except Exception:
                return Response({"error": "tz_offset_hours must be a number"}, status=400)

            # 3) Normalize to aware UTC & derive naive-UTC (Swiss wants UT)
            try:
                dt_aw_utc: datetime = parse_client_iso_to_aware_utc(dt_str)  # aware UTC
            except Exception as e:
                return Response({"error": f"invalid datetime: {e}"}, status=400)

            dt_naive_utc: datetime = aware_utc_to_naive(dt_aw_utc)

            # 4) Compute Ascendant & planetary longitudes (sidereal) - Lahiri
            tz_off = 0.0
            lagna_deg, positions = compute_all_planets(
                dt_naive_utc, lat, lon, tz_offset_hours=tz_off, ayanamsa="lahiri"
            )
            lagna_sign = get_sign_name(lagna_deg)

            # 5) Planet placement by house (1..12)
            bins = assign_planets_to_houses(lagna_deg, positions)

            # 6) Compute house lords for all houses (based on lagna sign index)
            asc_sign_idx = deg_to_sign_index(lagna_deg)  # 0..11
            chart_lords: Dict[int, str] = {}
            for h in range(1, 13):
                sign_index_for_house = (asc_sign_idx + (h - 1)) % 12
                chart_lords[h] = sign_lord_for(sign_index_for_house)

            # 7) Build set of longitudes to feed aspect engine (include Asc)
            planets_deg: Dict[str, float] = {"Asc": float(lagna_deg)}
            planets_deg.update({k: float(v) for k, v in positions.items()})

            # 8) Aspects (natal-style, deterministic)
            aspects = compute_aspects(planets_deg, aspect_cfg)

            # 9) Evaluate domains — now returns {"domains": [...], "globalAspects": [...]}
            domain_result: Dict[str, Any] = evaluate_domains_v11(
                domain_rules_json=domain_rules,
                aspect_cfg=aspect_cfg,
                planets_in_houses=bins,
                chart_lords=chart_lords,
                aspects=aspects,
            )
            domains_list: List[dict] = domain_result.get("domains", [])
            global_aspects: List[dict] = domain_result.get("globalAspects", [])

            # 10) Evaluate skills (includes highlights in each skill)
            skills_list: List[dict] = evaluate_skills_v11(
                aspect_cfg=aspect_cfg,
                planets_in_houses={str(k): v for k, v in bins.items()},
                aspects=aspects,
            )

            # 11) Prepare context payload for FE debugging/visualization
            aspects_dict = [
                {
                    "p1": hit.p1,
                    "p2": hit.p2,
                    "name": hit.name,
                    "exact": hit.exact,
                    "delta": hit.delta,
                    "score": hit.score,
                    "applying": hit.applying,
                }
                for hit in aspects
            ]

            context = {
                "lagna_deg": lagna_deg,
                "lagna_sign": lagna_sign,
                "angles": {
                    "Asc": lagna_deg,
                    # "MC": <optionally add later>
                },
                "planets": positions,
                "planets_in_houses": {str(k): v for k, v in bins.items()},
                "aspects": aspects_dict,
            }

            # 12) Final response (now includes globalAspects)
            return Response(
                {
                    "input": {
                        "datetime": dt_str,
                        "lat": lat,
                        "lon": lon,
                        "tz_offset_hours": float(data.get("tz_offset_hours", 0.0)),
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
                },
                status=200,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# astro/api_views.py
from datetime import datetime, timezone, timedelta, date
from zoneinfo import ZoneInfo
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .ephem.swiss import compute_all_planets, compute_angles
from .domain.saturn_watch import saturn_overview

# api_views.py

class SaturnOverviewView(APIView):
    """
    POST /api/v1/saturn/overview
    Body:
    {
      "datetime": "1990-11-20T17:30:00Z",
      "lat": 22.30,
      "lon": 87.92,
      "tz": "Asia/Kolkata",
      "horizon_months": 18,           # optional
      "horizon_years": 100,           # optional (overrides months if present)
      "anchor": "today|birth|date",   # optional, default "today"
      "start_date": "YYYY-MM-DD",     # optional if anchor="date"

      "include": {
        "sade_sati": true,            # default true
        "stations": true,             # default true
        "retro": true,                # default true (maps to 'retrograde')
        "ashtama": false,             # default false
        "kantaka": false,             # default false
        "support_hits": false,        # default false
        "stress_hits": false          # default false
      },

      "max_windows": 12               # optional cap applied to list-like sections
    }
    """
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data: Dict[str, Any] = request.data or {}

            # --- Requireds / basics -------------------------------------------------
            dt_raw = (data.get("datetime") or "").strip()
            if not dt_raw:
                return Response({"error": "datetime required"}, status=400)

            # normalize Z -> +00:00 for fromisoformat
            dt_str = dt_raw.replace("Z", "+00:00")

            try:
                lat = float(data.get("lat"))
                lon = float(data.get("lon"))
            except (TypeError, ValueError):
                return Response({"error": "lat/lon required and must be numbers"}, status=400)

            tz_str = (data.get("tz") or "Asia/Kolkata").strip()
            try:
                tz = ZoneInfo(tz_str)
            except Exception:
                return Response({"error": f"invalid tz: {tz_str}"}, status=400)

            # --- Horizon: years takes precedence over months -----------------------
            if "horizon_years" in data and data.get("horizon_years") is not None:
                try:
                    horizon_years = float(data.get("horizon_years"))
                except (TypeError, ValueError):
                    return Response({"error": "horizon_years must be a number"}, status=400)
                horizon_days = max(1, int(round(horizon_years * 365.25)))
            else:
                try:
                    horizon_months = int(data.get("horizon_months", 18))
                except (TypeError, ValueError):
                    return Response({"error": "horizon_months must be an integer"}, status=400)
                horizon_days = max(1, horizon_months * 30)

            # safety cap ≤ 100y
            horizon_days = min(horizon_days, int(100 * 365.25))

            # --- Parse birth datetime; keep aware UTC for tz transforms -------------
            try:
                dt_aw = datetime.fromisoformat(dt_str).astimezone(timezone.utc)
            except Exception:
                return Response({"error": "invalid datetime format (use ISO8601)"}, status=400)
            dt_utc = dt_aw.replace(tzinfo=None)  # Swiss expects naive UTC

            # --- Natal angles & planets (sidereal Lahiri) ---------------------------
            angles = compute_angles(dt_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")
            _, natal_pos = compute_all_planets(dt_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")

            # --- Anchor date selection (in user's local calendar) -------------------
            anchor = str(data.get("anchor", "today")).lower()
            start_date_iso = data.get("start_date")

            if anchor == "birth":
                start_day = dt_aw.astimezone(tz).date()
            elif anchor == "date" and start_date_iso:
                try:
                    start_day = date.fromisoformat(start_date_iso)
                except Exception:
                    return Response({"error": "start_date must be YYYY-MM-DD"}, status=400)
            else:  # default: today
                start_day = datetime.now(tz=tz).date()

            # --- Compute context (event-based, fast) --------------------------------
            sat_ctx = saturn_overview(
                today_local=start_day,
                horizon_days=horizon_days,
                moon_natal_deg=float(natal_pos["Moon"]),
                asc_natal_deg=float(angles.get("Asc")),
                mc_natal_deg=float(angles.get("MC")) if angles.get("MC") is not None else None,
                lat=lat, lon=lon, user_tz_str=tz_str, ayanamsa="lahiri",
            )

            # --- Includes & trimming ------------------------------------------------
            include = data.get("include") or {}
            inc_sade   = bool(include.get("sade_sati", True))
            inc_stn    = bool(include.get("stations", True))
            inc_ret    = bool(include.get("retro", True))
            inc_asht   = bool(include.get("ashtama", False))
            inc_kant   = bool(include.get("kantaka", False))
            inc_supp   = bool(include.get("support_hits", False))
            inc_stress = bool(include.get("stress_hits", False))

            max_windows = int(data.get("max_windows", 12))
            if max_windows < 0:
                max_windows = 0  # treat negative as 0 (show nothing)

            def _cap_list(val):
                if isinstance(val, list) and max_windows > 0:
                    return val[:max_windows]
                return val

            out: Dict[str, Any] = {
                "query_id": "saturn_overview_v1",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "tz": tz_str,
                "anchor": anchor,
                "start_date": start_day.isoformat(),
                "horizon_days": horizon_days,
            }

            # Sade Sati (with caution_days recomputed after window trimming)
            if inc_sade and "sade_sati" in sat_ctx:
                ss = dict(sat_ctx.get("sade_sati") or {})
                wins: List[Dict[str, Any]] = list(ss.get("windows") or [])
                if max_windows > 0:
                    wins = wins[:max_windows]
                # Rebuild caution_days from trimmed windows (important)
                ss["windows"] = wins
                ss["caution_days"] = sorted({d for w in wins for d in (w.get("stations") or [])})
                out["sade_sati"] = ss

            if inc_stn and "stations" in sat_ctx:
                out["stations"] = _cap_list(sat_ctx.get("stations", []))

            if inc_ret and "retrograde" in sat_ctx:
                out["retrograde"] = _cap_list(sat_ctx.get("retrograde", []))

            if inc_asht and "ashtama" in sat_ctx:
                out["ashtama"] = _cap_list(sat_ctx.get("ashtama", []))

            if inc_kant and "kantaka" in sat_ctx:
                out["kantaka"] = _cap_list(sat_ctx.get("kantaka", []))

            if inc_supp and "support_hits" in sat_ctx:
                out["support_hits"] = _cap_list(sat_ctx.get("support_hits", []))

            if inc_stress and "stress_hits" in sat_ctx:
                out["stress_hits"] = _cap_list(sat_ctx.get("stress_hits", []))

            return Response(out, status=200)

        except Exception as e:
            # You can add Sentry/structlog here
            return Response({"error": str(e)}, status=400)


#shubhdin
# astro/api_views.py

# --- your existing imports/utilities (assumed) ---
# from .astro_core import compute_all_planets, compute_angles, load_config, saturn_overview
# from .time_utils import parse_client_iso_to_aware_utc, aware_utc_to_naive
# from .shubhdin_helpers import (
#     duration_days, fmt_start_end_duration, percentiles, normalize_scores,
#     best_window, grow_window, non_overlapping_top_windows, dedupe_windows,
#     angle_diff, dates_in_range
# )

class ShubhDinRunView(APIView):
    """
    POST /api/v1/shubhdin/run
    Accepts either:
      - { "birth": { "date": "YYYY-MM-DD", "time": "HH:MM", "lat": <f>, "lon": <f> }, "tz": "Asia/Kolkata", "horizon_months": 12, ... }
      - or legacy: { "datetime": "YYYY-MM-DDTHH:MM:SSZ", "lat": <f>, "lon": <f>, "tz": "Asia/Kolkata", "horizon_months": 12 }
    """
    permission_classes = [AllowAny]
    _GOAL_KEYS = (
        "promotion", "job_change", "startup", "property", "marriage",
        "business_expand", "business_start", "new_relationship"
    )

    # ---------- i18n helpers (NEW) ----------
    @staticmethod
    def _t(key: str, args: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Build a translation object: {key, args}"""
        return {"key": key, "args": (args or {})}

    @staticmethod
    def _headline_t(windows: List[Dict]) -> Dict[str, Any]:
        """sd.headline.best_windows with spans [{start,end,days}]"""
        spans = [
            {"start": w["start"], "end": w["end"], "days": int(w.get("duration_days") or 0)}
            for w in (windows or [])
        ]
        # Client will render list using sd.headline.span + joiners
        return {"key": "sd.headline.best_windows", "args": {"spans": spans}}

    @staticmethod
    def _aspect_tag_t(p1: str, name: str, p2: str) -> Dict[str, Any]:
        # Planet aspect tag: "{p1} {name} -> {p2}"
        return {"key": "sd.aspect.tag", "args": {"p1": p1, "name": name, "p2": p2}}

    @staticmethod
    def _dasha_tag_t(kind: str, lord: str) -> Dict[str, Any]:
        # kind: "MD" or "AD"
        k = "sd.dasha.md" if kind == "MD" else "sd.dasha.ad"
        return {"key": k, "args": {"lord": lord}}

    @staticmethod
    def _no_big_txn_t(dates_iso: List[str], more: int = 0) -> Dict[str, Any]:
        """Caution with a list of ISO dates; client formats per locale."""
        obj = {"key": "sd.caution.no_big_txn", "args": {"dates": dates_iso}}
        if more:
            obj["args"]["more"] = more
        return obj

    # ---------------- local normalization (wider spread; ASCII-safe tags later) -----
    @staticmethod
    def _normalize_scores_wide(daylist: List[Dict], raw_key: str = "raw", out_key: str = "score") -> None:
        """
        Wider, robust normalization:
          p50 -> ~58, p90 -> ~90, p97 -> ~97; clamp [3, 99]
        Leaves more headroom so not every top day shows as 98/99.
        """
        vals = [float(d.get(raw_key, 0.0)) for d in daylist]
        if not vals:
            return
        sv = sorted(vals)
        n = len(sv)

        def pct(p: float) -> float:
            if n == 1: return sv[0]
            idx = p * (n - 1)
            lo = int(idx); hi = min(lo + 1, n - 1)
            frac = idx - lo
            return sv[lo] * (1 - frac) + sv[hi] * frac

        p50 = pct(0.50)
        p90 = pct(0.90)
        p97 = pct(0.97)
        # piecewise: below p50 compress, between p50..p90 linear, above p90 slower
        for d in daylist:
            x = float(d.get(raw_key, 0.0))
            if x <= p50:
                # push lows into 3..58
                if p50 - 1e-9 > sv[0]:
                    z = (x - sv[0]) / max(1e-6, (p50 - sv[0]))
                else:
                    z = 0.0
                s = 3 + 55 * max(0.0, min(1.0, z))
            elif x <= p90:
                z = (x - p50) / max(1e-6, (p90 - p50))
                s = 58 + 30 * max(0.0, min(1.0, z))
            else:
                z = (x - p90) / max(1e-6, (p97 - p90 if p97 > p90 else (sv[-1] - p90 + 1e-6)))
                s = 88 + 11 * max(0.0, min(1.0, z))
            d[out_key] = round(max(3.0, min(99.0, s)), 2)

    def post(self, request):
        try:
            # ------------------ input ------------------
            data = request.data or {}
            birth = (data.get("birth") or {}) if isinstance(data.get("birth"), dict) else {}
            goals = data.get("goals") or list(self._GOAL_KEYS)

            business = (data.get("business") or {}) if isinstance(data.get("business"), dict) else {}
            business_type = (business.get("type") or data.get("business_type") or "other").strip().lower()

            tz_str = (data.get("tz") or "Asia/Kolkata").strip() or "Asia/Kolkata"
            try:
                USER_TZ = ZoneInfo(tz_str)
            except Exception:
                USER_TZ = ZoneInfo("Asia/Kolkata")

            # horizon months clamp 1..24
            try:
                hm = int(data.get("horizon_months", 12))
            except Exception:
                hm = 12
            hm = max(1, min(24, hm))
            H_DEFAULT = hm * 30
            H_MARR    = min(24 * 30, max(H_DEFAULT, 18 * 30))  # ensure ~≥18 months for marriage

            # ---------- parse input (legacy OR new) ----------
            if "datetime" in data and "lat" in data and "lon" in data:
                try:
                    dt_aw = parse_client_iso_to_aware_utc(str(data.get("datetime")).strip())
                except Exception as e:
                    return Response({"error": f"invalid datetime: {e}"}, status=400)
                try:
                    lat = float(data.get("lat")); lon = float(data.get("lon"))
                except Exception:
                    return Response({"error": "lat/lon must be numbers"}, status=400)
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    return Response({"error": "lat/lon out of range"}, status=400)
                dt_naive_utc = aware_utc_to_naive(dt_aw)
            else:
                b_date = str(birth.get("date", "")).strip()
                b_time = str(birth.get("time", "")).strip()
                lat_raw, lon_raw = birth.get("lat"), birth.get("lon")
                if not b_date or not b_time:
                    return Response({"error": "birth.date and birth.time are required (or use legacy datetime/lat/lon)"}, status=400)
                try:
                    lat = float(lat_raw); lon = float(lon_raw)
                except Exception:
                    return Response({"error": "birth.lat and birth.lon must be numbers"}, status=400)
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    return Response({"error": "lat/lon out of range"}, status=400)
                try:
                    dt_aw = datetime.fromisoformat(f"{b_date}T{b_time}:00+00:00").astimezone(timezone.utc)
                except Exception as e:
                    return Response({"error": f"invalid birth date/time: {e}"}, status=400)
                dt_naive_utc = dt_aw.replace(tzinfo=None)

            # ---------- load configs ----------
            try:
                aspect_cfg, _domain_rules = load_config()
            except Exception as e:
                return Response({"error": f"config: {e}"}, status=500)

            # ---------- natal points ----------
            angles = compute_angles(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")
            asc_deg = angles.get("Asc"); mc_deg = angles.get("MC")
            _, natal_pos = compute_all_planets(dt_naive_utc, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")

            natal_points: Dict[str, float] = {}
            if asc_deg is not None:
                natal_points["Asc"] = float(asc_deg)
            if mc_deg is not None:
                natal_points["MC"] = float(mc_deg)
            for k, v in natal_pos.items():
                natal_points[str(k)] = float(v)

            # ---------- Vimshottari timeline (MD/AD) ----------
            try:
                tl = compute_vimshottari_full(dt_aw, lat, lon, 0.0, horizon_years=120.0)
                md_periods = []   # (start_date, end_date, lord)
                ad_periods = []   # (start_date, end_date, lord)
                for p in getattr(tl, "mahadashas", []):
                    s = p.start.date(); e = p.end.date()
                    md_periods.append((s, e, p.lord))
                    key = f"{p.lord}@{p.start.replace(tzinfo=timezone.utc).isoformat()}"
                    for ad in getattr(tl, "antardashas", {}).get(key, []):
                        ad_periods.append((ad.start.date(), ad.end.date(), ad.lord))
            except Exception:
                md_periods, ad_periods = [], []  # fail-open

            # ---------- tiny helpers ----------
            today_local = datetime.now(USER_TZ).date()

            def local_date_to_naive_utc(d: date, hour_local: int = 9) -> datetime:
                dt_local = datetime(d.year, d.month, d.day, hour_local, 0, 0, tzinfo=USER_TZ)
                dt_aw_utc = dt_local.astimezone(timezone.utc)
                return dt_aw_utc.replace(tzinfo=None)

            def dasha_lords_for_date(d: date) -> tuple[Optional[str], Optional[str]]:
                md = None; ad = None
                for s, e, lord in md_periods:
                    if s <= d <= e:
                        md = lord
                        break
                if md:
                    for s, e, lord in ad_periods:
                        if s <= d <= e:
                            ad = lord
                            break
                return md, ad

            def dasha_multiplier(goal: str, md: Optional[str], ad: Optional[str]) -> float:
                support = {
                    "promotion":        {"Sun","Saturn","Mercury","Jupiter"},
                    "job_change":       {"Mercury","Jupiter","Mars","Sun"},
                    "startup":          {"Jupiter","Mercury","Sun","Venus"},
                    "property":         {"Venus","Saturn","Jupiter","Moon"},
                    "marriage":         {"Venus","Moon","Jupiter"},
                    "business_expand":  {"Jupiter","Mercury","Venus","Sun"},
                    "business_start":   {"Jupiter","Mercury","Venus","Sun"},
                    "new_relationship": {"Venus","Moon","Jupiter"},
                }
                contra = {
                    "promotion":        {"Rahu","Ketu"},
                    "job_change":       {"Rahu","Ketu"},
                    "startup":          {"Saturn","Rahu","Ketu"},
                    "property":         {"Mars","Rahu","Ketu"},
                    "marriage":         {"Saturn","Mars","Rahu","Ketu"},
                    "business_expand":  {"Rahu","Ketu","Saturn"},
                    "business_start":   {"Rahu","Ketu","Saturn"},
                    "new_relationship": {"Saturn","Mars","Rahu","Ketu"},
                }
                sup = support.get(goal, set()); con = contra.get(goal, set())
                m = 1.0
                if md in sup: m *= 1.20
                if ad in sup: m *= 1.10
                if md in con: m *= 0.90
                if ad in con: m *= 0.95
                return m

            # --------------- STRICT Transit → Natal scoring ---------------
            ASPECTS = [
                ("Conjunction", 0.0,   4.0, 1.00),
                ("Sextile",     60.0,  2.0, 0.85),
                ("Square",      90.0,  2.0, 0.65),
                ("Trine",       120.0, 3.0, 1.00),
                ("Opposition",  180.0, 3.0, 0.85),
            ]
            benefics = set(aspect_cfg.get("benefics", []))
            malefics = set(aspect_cfg.get("malefics", []))

            def aspect_hit(delta: float) -> Optional[Tuple[str, float]]:
                # Return (aspect_name, strength 0..1) for closest aspect within orb.
                best: Optional[Tuple[str, float]] = None
                for name, ang, orb, base in ASPECTS:
                    diff = abs(delta - ang)
                    if diff <= orb or abs(diff - 360.0) <= orb:
                        taper = max(0.0, 1.0 - (min(diff, 360.0 - diff) / orb))
                        strength = base * (0.6 + 0.4 * taper)
                        if best is None or strength > best[1]:
                            best = (name, strength)
                return best

            def day_score_base(d: date) -> tuple[float, dict]:
                """Personalized raw score from TRANSIT → NATAL aspects only."""
                dt = local_date_to_naive_utc(d, hour_local=9)
                _, tpos = compute_all_planets(dt, lat, lon, tz_offset_hours=0.0, ayanamsa="lahiri")

                # Combustion flag (Sun–Mercury)
                sun = float(tpos.get("Sun", 0.0))
                merc = float(tpos.get("Mercury", 0.0))
                combust = angle_diff(sun, merc) <= 8.0

                # actors
                transiting_planets = [p for p in ("Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Rahu","Ketu") if p in tpos]

                raw = 0.0
                tag_buf: List[str] = []
                tag_t_buf: List[Dict[str, Any]] = []  # NEW

                for p in transiting_planets:
                    p_deg = float(tpos[p])
                    for tgt, natal_deg in natal_points.items():
                        delta = angle_diff(p_deg, float(natal_deg))
                        hit = aspect_hit(delta)
                        if not hit:
                            continue
                        a_name, a_strength = hit
                        # weight by benefic/malefic of transiting planet
                        if p in benefics:
                            w = 1.00
                        elif p in malefics:
                            w = 0.70
                        else:
                            w = 0.85
                        contrib = a_strength * w
                        raw += contrib
                        # ASCII-safe tag
                        if a_name in ("Trine", "Sextile") and contrib >= 0.60:
                            tag_buf.append(f"{p} {a_name} -> {tgt}")
                            tag_t_buf.append(self._aspect_tag_t(p, a_name, tgt))  # NEW

                # Dasha context
                md_lord, ad_lord = dasha_lords_for_date(d)
                tags = list(dict.fromkeys(tag_buf))[:4]
                tags_t = tag_t_buf[:4]

                meta = {
                    "tags": tags,
                    "tags_t": tags_t,   # NEW
                    "hits": {"_source": "t->n local"},   # breadcrumb only
                    "flags": {"combust": combust},
                    "dasha": {"md": md_lord, "ad": ad_lord}
                }
                return (raw, meta)

            # ------------------ horizons ------------------
            H_PROMO   = H_DEFAULT
            H_JOB     = H_DEFAULT
            H_PROP    = H_DEFAULT
            H_STARTUP = H_DEFAULT
            H_EXPAND  = H_DEFAULT
            H_REL     = H_DEFAULT  # new_relationship

            # ========== SATURN CONTEXT (goal-agnostic) ==========
            H_MAX = max(H_PROMO, H_JOB, H_PROP, H_STARTUP, H_EXPAND, H_REL, H_MARR)
            try:
                sat_ctx = saturn_overview(
                    today_local=today_local,
                    horizon_days=H_MAX,
                    moon_natal_deg=float(natal_pos["Moon"]),
                    asc_natal_deg=float(natal_points.get("Asc")) if "Asc" in natal_points else None,
                    mc_natal_deg=float(natal_points.get("MC")) if "MC" in natal_points else None,
                    lat=lat, lon=lon, user_tz_str=tz_str, ayanamsa="lahiri",
                ) or {}
            except Exception:
                sat_ctx = {}

            def _collect_windows(section: str) -> list[tuple[str, str]]:
                wins: list[tuple[str, str]] = []
                sec = sat_ctx.get(section)
                if isinstance(sec, dict):
                    for w in (sec.get("windows") or []):
                        a = w.get("start"); b = w.get("end")
                        if a and b: wins.append((a, b))
                return wins

            def _collect_days_in_windows(wins: list[tuple[str, str]]) -> set[str]:
                if not wins: return set()
                out = set()
                cur = today_local
                end = today_local + timedelta(days=H_MAX)
                while cur <= end:
                    iso = cur.isoformat()
                    for a, b in wins:
                        if a <= iso <= b:
                            out.add(iso); break
                    cur += timedelta(days=1)
                return out

            def _collect_station_days_from_ss() -> set[str]:
                out = set()
                ss = (sat_ctx.get("sade_sati") or {})
                for w in ss.get("windows", []):
                    for d in (w.get("stations") or []):
                        if isinstance(d, str): out.add(d)
                return out

            SS_WINS        = _collect_windows("sade_sati")
            RETRO_WINS_RAW = (sat_ctx.get("retrograde") or [])
            RETRO_WINS     = [(w.get("start"), w.get("end")) for w in RETRO_WINS_RAW if w.get("start") and w.get("end")]
            ASHTAMA_WINS   = _collect_windows("ashtama")
            KANTAKA_WINS   = _collect_windows("kantaka")

            SS_STATION_DAYS = _collect_station_days_from_ss()
            SS_DAYS         = _collect_days_in_windows(SS_WINS)
            RETRO_DAYS      = _collect_days_in_windows(RETRO_WINS)
            ASHTAMA_DAYS    = _collect_days_in_windows(ASHTAMA_WINS)
            KANTAKA_DAYS    = _collect_days_in_windows(KANTAKA_WINS)

            def _collect_hit_days(key: str) -> set[str]:
                out = set()
                for it in (sat_ctx.get(key) or []):
                    d = it.get("date")
                    if isinstance(d, str): out.add(d)
                return out

            SAT_SUPPORT_DAYS = _collect_hit_days("support_hits")
            SAT_STRESS_DAYS  = _collect_hit_days("stress_hits")

            def saturn_multiplier_for(goal: str, d_iso: str) -> tuple[float, list[str]]:
                m = 1.0
                tags: list[str] = []
                if d_iso in SS_STATION_DAYS:
                    m *= 0.95; tags.append("Saturn Station")
                if d_iso in SS_DAYS:
                    tags.append("Sade Sati")
                    goal_penalty = {"promotion":0.96,"job_change":0.96,"marriage":0.97,"new_relationship":0.97}.get(goal, 0.98)
                    m *= goal_penalty
                if d_iso in RETRO_DAYS:
                    m *= 0.98; tags.append("Saturn Retro")
                if d_iso in ASHTAMA_DAYS or d_iso in KANTAKA_DAYS:
                    m *= 0.97
                    if d_iso in ASHTAMA_DAYS: tags.append("Ashtama (Saturn)")
                    if d_iso in KANTAKA_DAYS: tags.append("Kantaka (Saturn)")
                if d_iso in SAT_SUPPORT_DAYS:
                    m *= 1.04; tags.append("Saturn Support")
                if d_iso in SAT_STRESS_DAYS:
                    m *= 0.96; tags.append("Saturn Stress")
                return m, tags

            # ------- utilities (windowing/formatting) -------
            def best_day_within(days: List[Dict], start_iso: str, end_iso: str) -> Optional[Dict]:
                slice_days = [d for d in days if start_iso <= d["date"] <= end_iso]
                if not slice_days:
                    return None
                bd = max(slice_days, key=lambda x: x["score"])
                md = bd.get("meta", {}).get("dasha", {}).get("md")
                ad = bd.get("meta", {}).get("dasha", {}).get("ad")
                tags = bd.get("meta", {}).get("tags", [])
                tags_t = bd.get("meta", {}).get("tags_t", [])
                # add MD/AD as tags & tags_t as well
                if md:
                    tags.append(f"MD:{md}")
                    tags_t.append(self._dasha_tag_t("MD", md))
                if ad:
                    tags.append(f"AD:{ad}")
                    tags_t.append(self._dasha_tag_t("AD", ad))
                return {
                    "date": bd["date"],
                    "score": bd["score"],
                    "tags": tags,
                    "tags_t": tags_t,  # NEW
                }

            def _cap_dates(dates_list: List[str], n: int = 10) -> tuple[List[str], int]:
                return (dates_list[:n], max(0, len(dates_list) - n))

            def make_caution_line(iso_list: List[str]) -> str:
                if not iso_list:
                    return ""
                def fmt(s: str) -> str:
                    y, m, d = [int(x) for x in s.split("-")]
                    return datetime(y, m, d).strftime("%d %b %Y")
                shown = [fmt(s) for s in iso_list]
                return f"Please don't finalize deals or make large transactions on: {', '.join(shown)}; use another recommended day."

            # ============ sweep goal: with Dasha + Saturn multipliers ============
            def sweep_goal(goal: str, days_count: int) -> List[Dict]:
                out = []
                for i in range(days_count):
                    d = today_local + timedelta(days=i)
                    raw, meta = day_score_base(d)

                    # mild downweight if no personal benefic tag
                    def has_personal_benefic(tags: List[str]) -> bool:
                        return any((t.split(" ")[0] in {"Jupiter","Venus","Moon"}) for t in tags)
                    if not has_personal_benefic(meta.get("tags", [])):
                        raw *= 0.8

                    md_lord = meta.get("dasha", {}).get("md")
                    ad_lord = meta.get("dasha", {}).get("ad")
                    dasha_mult = dasha_multiplier(goal, md_lord, ad_lord)

                    d_iso = d.isoformat()
                    sat_mult, sat_tags = saturn_multiplier_for(goal, d_iso)

                    meta_tags = (meta.get("tags") or []) + sat_tags
                    meta["tags"] = list(dict.fromkeys(meta_tags))[:5]

                    out.append({"date": d_iso, "raw": raw * dasha_mult * sat_mult, "meta": meta})
                # local, wider normalization
                self._normalize_scores_wide(out, raw_key="raw", out_key="score")
                return out

            results: List[Dict] = []

            # ------------------ Promotion (tighter windows) ------------------
            if "promotion" in goals:
                promo_days = sweep_goal("promotion", H_PROMO)
                promo_win = []
                seed = best_window(promo_days, span=7)
                if seed:
                    si, ei = grow_window(promo_days, seed["si"], seed["ei"], cutoff=60.0, patience=3)
                    a_iso, b_iso = promo_days[si]["date"], promo_days[ei]["date"]
                    promo_win = [{"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)}]
                promo_win = dedupe_windows(promo_win, limit=1)
                headline = f"Best windows: {fmt_start_end_duration(promo_win[0]['start'], promo_win[0]['end'])}" if promo_win else "Best windows: n/a"
                headline_t = self._headline_t(promo_win)

                top_date_line: List[Dict] = []
                if promo_win:
                    bd = best_day_within(promo_days, promo_win[0]["start"], promo_win[0]["end"])
                    if bd: top_date_line = [bd]

                # Saturn station cautions (capped)
                caution_days = []
                for w in promo_win:
                    for d in dates_in_range(promo_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                cautions = ["Avoid 16:30-17:15 (Rahu Kaal)"] + ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = [self._t("sd.caution.rahukaal", {"start": "16:30", "end": "17:15"})]
                if shown:
                    cautions_t.append(self._no_big_txn_t(shown, more))

                results.append({
                    "goal": "promotion",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(top_date_line[0]["score"]) if top_date_line else int(max((d["score"] for d in promo_days), default=0)),
                    "confidence": "medium" if promo_win else "low",
                    "dates": top_date_line,
                    "windows": promo_win,
                    "explain": ["Transit + dasha support career houses (10th/6th)."] +
                               ([f"Leverage appraisal talks near {top_date_line[0]['date']}." ] if top_date_line else []),
                    "explain_t": [self._t("sd.explain.career_houses")] + (
                        [self._t("sd.explain.leverage_date", {"date": top_date_line[0]["date"]})] if top_date_line else []
                    ),  # NEW
                    "cautions": cautions,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ Job change (tighter) ------------------
            if "job_change" in goals:
                job_days = sweep_goal("job_change", H_JOB)
                picked = non_overlapping_top_windows(job_days, span=7, k=2)
                job_wins = []
                for w in picked:
                    si, ei = grow_window(job_days, w["si_orig"], w["ei_orig"], cutoff=60.0, patience=3)
                    a_iso, b_iso = job_days[si]["date"], job_days[ei]["date"]
                    job_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                job_wins = dedupe_windows(job_wins, limit=2)
                headline = ("Best windows: " + ", ".join(fmt_start_end_duration(w["start"], w["end"]) for w in job_wins)) if job_wins else "Best windows: n/a"
                headline_t = self._headline_t(job_wins)

                top_date_line: List[Dict] = []
                if job_wins:
                    bd = best_day_within(job_days, job_wins[0]["start"], job_wins[0]["end"])
                    if bd: top_date_line = [bd]

                caution_days = []
                for w in job_wins:
                    for d in dates_in_range(job_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                cautions = ["Watch Mercury combust days for clarity"] + ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = [self._t("sd.caution.watch_combust")]
                if shown:
                    cautions_t.append(self._no_big_txn_t(shown, more))

                results.append({
                    "goal": "job_change",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(top_date_line[0]["score"]) if top_date_line else int(max((d["score"] for d in job_days), default=0)),
                    "confidence": "medium" if job_wins else "low",
                    "dates": top_date_line,
                    "windows": job_wins,
                    "explain": ["Mercury + Jupiter favor offers/interviews; Mars gives momentum (with supportive MD/AD)."],
                    "explain_t": [self._t("sd.explain.jobchange_core")],  # NEW (add in dictionaries)
                    "cautions": cautions,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ Startup (tighter) ------------------
            if "startup" in goals:
                startup_days = sweep_goal("startup", H_STARTUP)
                startup_wins = []
                best_line: List[Dict] = []
                if startup_days:
                    span = min(45, len(startup_days))
                    seed = best_window(startup_days, span=span)
                    if seed:
                        si, ei = grow_window(startup_days, seed["si"], seed["ei"], cutoff=62.0, patience=4)
                        a_iso, b_iso = startup_days[si]["date"], startup_days[ei]["date"]
                        startup_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                startup_wins = dedupe_windows(startup_wins, limit=1)
                headline = f"Best windows: {fmt_start_end_duration(startup_wins[0]['start'], startup_wins[0]['end'])}" if startup_wins else "Best windows: n/a"
                headline_t = self._headline_t(startup_wins)

                if startup_wins:
                    bd = best_day_within(startup_days, startup_wins[0]["start"], startup_wins[0]["end"])
                    if bd: best_line = [bd]

                shown, more = _cap_dates([], n=10)  # currently only no-big-transaction when Saturn station; none assembled here
                caution_text = []  # keep legacy empty unless you add days
                cautions_t = []    # i18n parallel empty

                explain = ["Jupiter trine to your natal Sun/Asc with supportive dasha signals green light."]
                explain_t = [self._t("sd.explain.startup_green")]
                if best_line:
                    explain.append(f"Incorporate near {best_line[0]['date']} (strong Moon/Nakshatra).")
                    explain_t.append(self._t("sd.explain.incop_near", {"date": best_line[0]["date"]}))

                results.append({
                    "goal": "startup",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(best_line[0]["score"]) if best_line else int(max((d["score"] for d in startup_days), default=0)),
                    "confidence": "medium" if startup_wins else "low",
                    "dates": best_line,
                    "windows": startup_wins,
                    "explain": explain,
                    "explain_t": explain_t,  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": []
                })

            # ------------------ Property (tighter) ------------------
            if "property" in goals:
                prop_days = sweep_goal("property", H_PROP)
                picked_prop = non_overlapping_top_windows(prop_days, span=3, k=3)
                prop_wins = []
                for w in picked_prop:
                    si, ei = grow_window(prop_days, w["si_orig"], w["ei_orig"], cutoff=60.0, patience=2)
                    a_iso, b_iso = prop_days[si]["date"], prop_days[ei]["date"]
                    prop_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                prop_wins = dedupe_windows(prop_wins, limit=3)
                headline = ("Best windows: " + ", ".join(fmt_start_end_duration(w["start"], w["end"]) for w in prop_wins)) if prop_wins else "Best windows: n/a"
                headline_t = self._headline_t(prop_wins)

                top_date_line: List[Dict] = []
                if prop_wins:
                    bd = best_day_within(prop_days, prop_wins[0]["start"], prop_wins[0]["end"])
                    if bd: top_date_line = [bd]

                caution_days = []
                for w in prop_wins:
                    for d in dates_in_range(prop_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                caution_text = ["Skip Rahu/Gulika windows"] + ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = [self._t("sd.caution.skip_rahukaal_gulika")]
                if shown:
                    cautions_t.append(self._no_big_txn_t(shown, more))

                results.append({
                    "goal": "property",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(top_date_line[0]["score"]) if top_date_line else int(max((d["score"] for d in prop_days), default=0)),
                    "confidence": "high" if prop_wins else "low",
                    "dates": top_date_line,
                    "windows": prop_wins,
                    "explain": ["Venus + Moon auspicious; Saturn steady for paperwork (dasha-boosted where applicable)."],
                    "explain_t": [self._t("sd.explain.property_core")],  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ Marriage (tighter) ------------------
            if "marriage" in goals:
                marr_days = sweep_goal("marriage", H_MARR)
                marr_wins = []
                if marr_days:
                    seed = best_window(marr_days, span=24)
                    if seed:
                        si, ei = grow_window(marr_days, seed["si"], seed["ei"], cutoff=60.0, patience=4)
                        a_iso, b_iso = marr_days[si]["date"], marr_days[ei]["date"]
                        marr_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                marr_wins = dedupe_windows(marr_wins, limit=1)
                headline = f"Best windows: {fmt_start_end_duration(marr_wins[0]['start'], marr_wins[0]['end'])}" if marr_wins else "Best windows: n/a"
                headline_t = self._headline_t(marr_wins)

                best_line: List[Dict] = []
                if marr_wins:
                    bd = best_day_within(marr_days, marr_wins[0]["start"], marr_wins[0]["end"])
                    if bd: best_line = [bd]

                caution_days = []
                for w in marr_wins:
                    for d in dates_in_range(marr_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                caution_text = ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = ([self._no_big_txn_t(shown, more)] if shown else [])

                explain = ["Venus/Moon strengthened; benefic aspect to 7th lord (dasha-aligned)."]
                explain_t = [self._t("sd.explain.marriage_core")]
                if best_line:
                    explain.append(f"{best_line[0]['date']} is particularly good.")
                    explain_t.append(self._t("sd.explain.particularly_good", {"date": best_line[0]["date"]}))

                results.append({
                    "goal": "marriage",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(best_line[0]["score"]) if best_line else int(max((d["score"] for d in marr_days), default=0)),
                    "confidence": "medium" if marr_wins else "low",
                    "dates": best_line,
                    "windows": marr_wins,
                    "explain": explain,
                    "explain_t": explain_t,  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ Business: Expand (tighter) ------------------
            if "business_expand" in goals:
                expand_days = sweep_goal("business_expand", H_EXPAND)
                picked_exp = non_overlapping_top_windows(expand_days, span=21, k=2)
                expand_wins = []
                for w in picked_exp:
                    si, ei = grow_window(expand_days, w["si_orig"], w["ei_orig"], cutoff=62.0, patience=4)
                    a_iso, b_iso = expand_days[si]["date"], expand_days[ei]["date"]
                    expand_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                expand_wins = dedupe_windows(expand_wins, limit=2)
                headline = ("Best windows: " + ", ".join(fmt_start_end_duration(w["start"], w["end"]) for w in expand_wins)) if expand_wins else "Best windows: n/a"
                headline_t = self._headline_t(expand_wins)

                top_date_line: List[Dict] = []
                if expand_wins:
                    bd = best_day_within(expand_days, expand_wins[0]["start"], expand_wins[0]["end"])
                    if bd: top_date_line = [bd]

                # cautions: combustion + Saturn station
                caution_days = []
                for w in expand_wins:
                    for d in dates_in_range(expand_days, w["start"], w["end"]):
                        if d.get("meta", {}).get("flags", {}).get("combust"):
                            caution_days.append(d["date"])
                for w in expand_wins:
                    for d in dates_in_range(expand_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                caution_text = ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = ([self._no_big_txn_t(shown, more)] if shown else [])

                explain = [
                    "Jupiter (growth) + Mercury (sales/ops) supportive; Venus aids customer appeal.",
                    "Use these spans for launches, partnerships, and opening new locations (dasha-aligned)."
                ]
                explain_t = [
                    self._t("sd.explain.expand_core"),
                    self._t("sd.explain.use_spans_launches")
                ]

                results.append({
                    "goal": "business_expand",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(top_date_line[0]["score"]) if top_date_line else int(max((d["score"] for d in expand_days), default=0)),
                    "confidence": "medium" if expand_wins else "low",
                    "dates": top_date_line,
                    "windows": expand_wins,
                    "explain": explain,
                    "explain_t": explain_t,  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ Business: Start (tighter) ------------------
            if "business_start" in goals:
                start_days = sweep_goal("business_start", H_STARTUP)
                span_by_type = {
                    "tech": 45, "ecom": 40, "retail": 28, "services": 40,
                    "manufacturing": 60, "real_estate": 50, "other": 40
                }
                base_span = span_by_type.get(business_type, 40)
                span = min(base_span, len(start_days)) if start_days else 0

                start_wins = []
                if span >= 1:
                    seeds = non_overlapping_top_windows(start_days, span=span, k=2)
                    for s in seeds:
                        si, ei = grow_window(start_days, s["si_orig"], s["ei_orig"], cutoff=62.0, patience=4)
                        a_iso, b_iso = start_days[si]["date"], start_days[ei]["date"]
                        start_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                start_wins = dedupe_windows(start_wins, limit=2)
                headline = ("Best windows: " + ", ".join(fmt_start_end_duration(w["start"], w["end"]) for w in start_wins)) if start_wins else "Best windows: n/a"
                headline_t = self._headline_t(start_wins)

                best_line: List[Dict] = []
                if start_wins:
                    bd = best_day_within(start_days, start_wins[0]["start"], start_wins[0]["end"])
                    if bd: best_line = [bd]

                # cautions: combustion + Saturn station
                caution_days = []
                for w in start_wins:
                    for d in dates_in_range(start_days, w["start"], w["end"]):
                        if d.get("meta", {}).get("flags", {}).get("combust"):
                            caution_days.append(d["date"])
                for w in start_wins:
                    for d in dates_in_range(start_days, w["start"], w["end"]):
                        if d["date"] in SS_STATION_DAYS:
                            caution_days.append(d["date"])
                caution_days = sorted(set(caution_days))
                shown, more = _cap_dates(caution_days, n=10)
                caution_text = ([make_caution_line(shown) + (f" (+{more} more)" if more else "")] if shown else [])
                cautions_t = ([self._no_big_txn_t(shown, more)] if shown else [])

                type_nice = {
                    "tech": "Tech / SaaS",
                    "ecom": "E-commerce",
                    "retail": "Retail",
                    "services": "Services",
                    "manufacturing": "Manufacturing",
                    "real_estate": "Real Estate"
                }.get(business_type, "Business")

                expl = [f"{type_nice}: Jupiter (expansion) + Mercury (ops/legal) supportive; Venus aids brand/UX (dasha-aligned)."]
                expl_t = [self._t("sd.explain.start_core_typed", {"type": business_type})]
                if best_line:
                    expl.append(f"Incorporate/commence near {best_line[0]['date']} for a strong lunar/nakshatra tone.")
                    expl_t.append(self._t("sd.explain.incop_commence_near", {"date": best_line[0]["date"]}))

                results.append({
                    "goal": "business_start",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(best_line[0]["score"]) if best_line else int(max((d["score"] for d in start_days), default=0)),
                    "confidence": "medium" if start_wins else "low",
                    "dates": best_line,
                    "windows": start_wins,
                    "explain": expl,
                    "explain_t": expl_t,  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            # ------------------ New Relationship (tighter + bugfix) ------------------
            if "new_relationship" in goals:
                rel_days = sweep_goal("new_relationship", H_REL)
                seeds = non_overlapping_top_windows(rel_days, span=10, k=2)
                rel_wins = []
                for s in seeds:
                    si, ei = grow_window(rel_days, s["si_orig"], s["ei_orig"], cutoff=58.0, patience=4)  # FIXED: use ei_orig
                    a_iso, b_iso = rel_days[si]["date"], rel_days[ei]["date"]
                    rel_wins.append({"start": a_iso, "end": b_iso, "duration_days": duration_days(a_iso, b_iso)})
                rel_wins = dedupe_windows(rel_wins, limit=2)
                headline = ("Best windows: " + ", ".join(fmt_start_end_duration(w["start"], w["end"]) for w in rel_wins)) if rel_wins else "Best windows: n/a"
                headline_t = self._headline_t(rel_wins)

                best_line: List[Dict] = []
                if rel_wins:
                    bd = best_day_within(rel_days, rel_wins[0]["start"], rel_wins[0]["end"])
                    if bd: best_line = [bd]

                # Optional extra caution collection already omitted for brevity; we keep none here
                caution_days: List[str] = []
                shown, more = _cap_dates(caution_days, n=10)
                caution_text = []
                cautions_t = []

                results.append({
                    "goal": "new_relationship",
                    "headline": headline,
                    "headline_t": headline_t,  # NEW
                    "score": int(best_line[0]["score"]) if best_line else int(max((d["score"] for d in rel_days), default=0)),
                    "confidence": "medium" if rel_wins else "low",
                    "dates": best_line,
                    "windows": rel_wins,
                    "explain": [
                        "Venus/Moon benefic patterns boost connection and openness (dasha-aligned).",
                        "Use these spans for first meets, dates, and social events."
                    ],
                    "explain_t": [
                        self._t("sd.explain.relationship_core"),
                        self._t("sd.explain.use_spans_social")
                    ],  # NEW
                    "cautions": caution_text,
                    "cautions_t": cautions_t,  # NEW
                    "caution_days": caution_days
                })

            return Response({
                "query_id": "qd_shubhdin_v1",
                "generated_at": datetime.utcnow().replace(tzinfo=timezone.utc).isoformat(),
                "tz": tz_str,
                "horizon_months": hm,
                "confidence_overall": "medium",
                "results": results
            }, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
