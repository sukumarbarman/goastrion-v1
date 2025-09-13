from __future__ import annotations

from datetime import datetime, timezone


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
from .domain.insights import build_domain_insights, build_skill_insights



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

            # 4) Compute Ascendant & planetary longitudes (sidereal)
            #    Use Lahiri for insights to be consistent with Vedic rules
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

            # Optional: add MC to aspects if your environment supports it.
            # We won't compute MC here to avoid coupling with Swiss internals.
            # (If you later expose MC, just add: planets_deg["MC"] = <mc_longitude>)

            # 8) Aspects (natal-style, deterministic)
            aspects = compute_aspects(planets_deg, aspect_cfg)

            # 9) Evaluate domains — returns already normalized {key, score 0..100, tier, chips...}
            domains_list: List[dict] = evaluate_domains_v11(
                domain_rules_json=domain_rules,
                aspect_cfg=aspect_cfg,
                planets_in_houses=bins,
                chart_lords=chart_lords,
                aspects=aspects,
            )

            # 10) (Optional) Build a lightweight "skills" list placeholder
            # Frontend can render empty [] gracefully until you wire a real engine
            skills_list: List[dict] = evaluate_skills_v11(
                aspect_cfg=aspect_cfg,
                planets_in_houses={str(k): v for k, v in bins.items()},
                aspects=aspects,
            )

            # 11) Prepare context payload for FE debugging/visualization
            # Convert aspects to plain dicts
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

            # 12) Final response
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
                        "skills": skills_list,
                    },
                },
                status=200,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=500)


