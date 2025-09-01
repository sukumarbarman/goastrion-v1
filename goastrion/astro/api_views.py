from __future__ import annotations
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from typing import Any, Dict

from .charts.north_indian import render_north_indian_chart_svg
from .utils.astro import assign_planets_to_houses, build_summary
from .ephem.swiss import compute_all_planets, get_sign_name

# ...existing imports...
from rest_framework.permissions import AllowAny
from .utils.astro import geocode_place

class GeocodeView(APIView):
    """
    GET /api/geocode?place=Kolkata
    Returns:
      {
        "place": "Kolkata",
        "address": "Kolkata, Kolkata District, ...",
        "lat": 22.5726,
        "lon": 88.3639
      }
    """
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






class ChartView(APIView):
    """
    POST /api/chart
    Body: {"datetime":"2024-06-14T07:42:00Z","lat":22.5726,"lon":88.3639,"tz_offset_hours":5.5}
    """
    def post(self, request):
        try:
            data: Dict[str, Any] = request.data
            dt_str = data.get("datetime")
            lat = float(data.get("lat"))
            lon = float(data.get("lon"))
            tz_off = float(data.get("tz_offset_hours", 0.0))
            if not dt_str:
                return Response({"error":"datetime required"}, status=400)

            dt = datetime.fromisoformat(dt_str.replace("Z","+00:00")).astimezone(timezone.utc).replace(tzinfo=None)

            lagna_deg, planets = compute_all_planets(dt, lat, lon, tz_off)
            lagna_sign = get_sign_name(lagna_deg)
            bins = assign_planets_to_houses(lagna_deg, planets)
            svg = render_north_indian_chart_svg(lagna_deg=lagna_deg, lagna_sign=lagna_sign, planets_in_houses=bins, size=420)
            summary = build_summary(dt, lat, lon, tz_off)

            return Response({
                "svg": svg,
                "summary": summary,
                "meta": {
                    "lagna_deg": lagna_deg,
                    "lagna_sign": lagna_sign,
                    "planets": planets,
                    "planets_in_houses": bins,
                }
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
