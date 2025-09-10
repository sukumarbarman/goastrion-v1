from __future__ import annotations
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from typing import Any, Dict, List

from .charts.north_indian import render_north_indian_chart_svg
from .utils.astro import assign_planets_to_houses, build_summary, NAKSHATRAS
from .ephem.swiss import compute_all_planets, get_sign_name

# ...existing imports...
from rest_framework.permissions import AllowAny
from .utils.astro import geocode_place



# NEW: Vimśottarī
from .dasha.vimshottari import compute_vimshottari_full, Period, DashaTimeline


class GeocodeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        place = request.query_params.get("place", "").strip()
        if not place:
            return Response({"error": "Query parameter 'place' is required"}, status=400)

        address, lat, lon = geocode_place(place)
        if not (address and lat and lon):
            return Response({"error": "Location not found"}, status=404)

        return Response({
            "place": place,
            "address": address,
            "lat": lat,
            "lon": lon,
        })


# --- helpers for Vimśottarī serialization -----------------------------------

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
        ads = tl.antardashas.get(key, [])
        ad_map[key] = [_serialize_period(p) for p in ads]
    return {"mahadashas": md_list, "antardashas": ad_map}



def _ser_period(p):
    return {
        "lord": p.lord,
        "start": p.start.replace(tzinfo=timezone.utc).isoformat(),
        "end": p.end.replace(tzinfo=timezone.utc).isoformat(),
        "years": float(p.years),
    }



class ChartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data: Dict[str, Any] = request.data or {}
            dt_str = (data.get("datetime") or "").strip()
            lat_raw, lon_raw = data.get("lat"), data.get("lon")
            client_tz_off = data.get("tz_offset_hours", 0.0)

            # --------- validate inputs ---------
            if not dt_str:
                return Response({"error": "datetime required"}, status=400)
            try:
                lat = float(lat_raw)
                lon = float(lon_raw)
            except Exception:
                return Response({"error": "lat/lon must be numbers"}, status=400)
            if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
                return Response({"error": "lat/lon out of range"}, status=400)

            # --------- normalize datetime to aware UTC ---------
            # Accept 'Z', '+05:30', or naive. If naive → assume it's already UTC.
            try:
                # Replace trailing 'Z' with +00:00 for fromisoformat compatibility
                iso = dt_str.replace("Z", "+00:00")
                dt_aw = datetime.fromisoformat(iso)
            except Exception as e:
                return Response({"error": f"invalid datetime: {e}"}, status=400)

            if dt_aw.tzinfo is None:
                # Treat naive as UTC to be safe and deterministic
                dt_aw = dt_aw.replace(tzinfo=timezone.utc)
            else:
                dt_aw = dt_aw.astimezone(timezone.utc)

            # For Swiss Ephemeris we keep a *naive* UTC (Julian day uses UT)
            dt_utc_naive = dt_aw.replace(tzinfo=None)

            # --------- BULLETPROOF TZ: always 0.0 for astronomy ---------
            # We do NOT let client's tz_offset alter UT computations.
            tz_off_for_chart = 0.0
            tz_off_for_dasha = 0.0

            # Optional: collect warnings for debugging
            warnings: List[str] = []
            try:
                client_off = float(client_tz_off)
                if abs(client_off) > 1e-9:
                    warnings.append(
                        f"Client tz_offset_hours={client_off} ignored; astronomy uses UTC."
                    )
            except Exception:
                warnings.append("Client tz_offset_hours malformed; ignored (using 0.0).")

            # ---------- CHART (Ayanamsa = default/None to match legacy) ----------
            lagna_deg, planets = compute_all_planets(
                dt_utc_naive, lat, lon, tz_off_for_chart, ayanamsa=None
            )
            lagna_sign = get_sign_name(lagna_deg)
            bins = assign_planets_to_houses(lagna_deg, planets)

            svg = render_north_indian_chart_svg(
                lagna_deg=lagna_deg,
                lagna_sign=lagna_sign,
                planets_in_houses=bins,
                size=420,
            )
            summary = build_summary(dt_utc_naive, lat, lon, tz_off_for_chart)

            # ---------- DASHA (UTC + Lahiri; stable & explicit) ----------
            tl = compute_vimshottari_full(
                dt_aw, lat, lon, tz_off_for_dasha, horizon_years=120.0
            )

            def _ser_period(p):
                return {
                    "lord": p.lord,
                    "start": p.start.replace(tzinfo=timezone.utc).isoformat(),
                    "end": p.end.replace(tzinfo=timezone.utc).isoformat(),
                    "years": p.years,
                }

            md_list = [_ser_period(p) for p in tl.mahadashas]
            ad_map: Dict[str, List[Dict[str, Any]]] = {}
            for md in tl.mahadashas:
                key = f"{md.lord}@{md.start.replace(tzinfo=timezone.utc).isoformat()}"
                ad_map[key] = [_ser_period(p) for p in tl.antardashas.get(key, [])]

            # ---------- Debug blob (Moon/Nakshatra under Lahiri) ----------
            _, pos_dbg = compute_all_planets(
                dt_utc_naive, lat, lon, tz_off_for_chart, ayanamsa="lahiri"
            )
            moon_lon = pos_dbg["Moon"]
            seg = 360.0 / 27.0
            idx = int(moon_lon // seg) % 27
            within = moon_lon - (idx * seg)
            frac = within / seg
            start_lords = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"] * 3
            start_lord = start_lords[idx]
            lord_years = {
                "Ketu":7,"Venus":20,"Sun":6,"Moon":10,"Mars":7,"Rahu":18,"Jupiter":16,"Saturn":19,"Mercury":17
            }[start_lord]
            balance = lord_years * (1.0 - frac)

            vim_debug = {
                "utc_iso": dt_aw.isoformat(),
                "ayanamsa": "lahiri",
                "tz_offset_for_dasha": tz_off_for_dasha,
                "moon_lon_deg": round(moon_lon, 5),
                "nakshatra": f"{NAKSHATRAS[idx]} (index {idx})",
                "fraction_elapsed_pct": round(frac * 100, 3),
                "start_md_lord": start_lord,
                "start_md_balance_years": round(balance, 5),
            }

            meta: Dict[str, Any] = {
                "lagna_deg": lagna_deg,
                "lagna_sign": lagna_sign,
                "planets": planets,
                "planets_in_houses": bins,
                "vimshottari": {"mahadashas": md_list, "antardashas": ad_map},
                "vimshottari_debug": vim_debug,
            }
            if warnings:
                meta["warnings"] = warnings

            return Response({
                "svg": svg,
                "summary": summary,
                "meta": meta,
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
