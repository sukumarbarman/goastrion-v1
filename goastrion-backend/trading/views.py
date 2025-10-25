# goastrion-backend/trading/views.py
from __future__ import annotations

from datetime import date as date_cls, datetime, timedelta
from typing import Optional

from django.utils import timezone
from django.utils.dateparse import parse_date
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle

from .models import TradingAsset, TradingDaily
from .services.engine import compute_daily_bands, ENGINE_VERSION
from .services.selector import pick_big_move_windows, extract_directional_windows


# ----------------------------- scoring helpers -----------------------------


VOL_BONUS = {"low": 0, "med": 5, "high": 10}


def _window_score(w: dict) -> int:
    """
    Composite score: confidence + peak_score + volatility bonus - caution - uncertain penalty.
    """
    conf = int(w.get("confidence") or 0)
    peak = int(w.get("peak_score") or 0)
    vol = (w.get("volatility") or "").lower()
    vol_bonus = VOL_BONUS.get(vol, 0)
    caution_penalty = -10 if w.get("caution") else 0
    label = (w.get("label") or "")
    dir_penalty = 0 if ("Up" in label or "Down" in label) else -4
    return conf + peak + vol_bonus + caution_penalty + dir_penalty


def _parse_date(s: Optional[str]) -> date_cls:
    """
    Accepts YYYY-MM-DD or DD-MM-YYYY; defaults to local 'today' (IST).
    """
    if not s:
        return timezone.localdate()
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        try:
            return datetime.strptime(s, "%d-%m-%Y").date()
        except ValueError:
            return timezone.localdate()


def _get_asset_or_400(request) -> Optional[TradingAsset]:
    aid = request.GET.get("asset") or "NIFTY_50"
    try:
        return TradingAsset.objects.get(pk=aid)
    except TradingAsset.DoesNotExist:
        return None


SCOPE_TO_KINDS = {
    "all": None,
    "indices": ("index",),
    "sectors": ("sector",),
    "commodities": ("commodity",),
    "crypto": ("crypto",),
}


# --------------------------------- views -----------------------------------

@method_decorator(cache_page(60 * 5), name="dispatch")
class IntradayTopView(APIView):
    """
    GET /api/trading/intraday-top/?asset=:ID&date=YYYY-MM-DD
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "trading_intraday"

    def get(self, request):
        asset = _get_asset_or_400(request)
        if asset is None:
            return Response({"error": "Unknown asset"}, status=400)

        d = _parse_date(request.GET.get("date"))
        daily = TradingDaily.objects.filter(asset=asset, date=d).first() or compute_daily_bands(asset, d)
        windows = pick_big_move_windows(daily.bands) or []

        payload = dict(
            asset=asset.id,
            tz=asset.tz,
            session={"start": daily.session_start, "end": daily.session_end},
            windows=windows,
            engine_version=daily.engine_version or ENGINE_VERSION,
        )
        return Response(payload)


@method_decorator(cache_page(60 * 10), name="dispatch")
class SectorsTodayView(APIView):
    """
    GET /api/trading/sectors/?date=YYYY-MM-DD
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "trading_sectors"

    def get(self, request):
        d = _parse_date(request.GET.get("date"))
        sectors = TradingAsset.objects.filter(kind="sector", status="active").order_by("id")

        out = []
        for asset in sectors:
            daily = TradingDaily.objects.filter(asset=asset, date=d).first() or compute_daily_bands(asset, d)
            up = extract_directional_windows(daily.bands, direction="up", limit=3)
            down = extract_directional_windows(daily.bands, direction="down", limit=3)
            out.append({"asset": asset.id, "up": up, "down": down})

        return Response({"date": d.isoformat(), "tz": "Asia/Kolkata", "sectors": out})


@method_decorator(cache_page(60 * 10), name="dispatch")
class WeekView(APIView):
    """
    GET /api/trading/week/?asset=:ID&start=YYYY-MM-DD
    Returns days + best_day (strongest single window across the range).
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "trading_week"

    def get(self, request):
        asset = _get_asset_or_400(request)
        if asset is None:
            return Response({"error": "Unknown asset"}, status=400)

        start_d = _parse_date(request.GET.get("start"))
        days = []
        cur = start_d
        target = 7 if asset.kind == "crypto" else 5

        best = None  # {"date": "...", "score": int, "window": {...}}

        while len(days) < target:
            # Skip weekends for non-crypto
            if asset.kind != "crypto" and cur.weekday() >= 5:
                cur += timedelta(days=1)
                continue

            daily = TradingDaily.objects.filter(asset=asset, date=cur).first() or compute_daily_bands(asset, cur)
            windows = pick_big_move_windows(daily.bands) or []
            days.append({"date": cur.isoformat(), "windows": windows})

            if windows:
                topw = max(windows, key=_window_score)
                sc = _window_score(topw)
                cand = {"date": cur.isoformat(), "score": sc, "window": topw}
                if (best is None) or (sc > best["score"]):
                    best = cand

            cur += timedelta(days=1)

        return Response({
            "asset": asset.id,
            "tz": asset.tz,
            "best_day": best,
            "days": days,
        })


@method_decorator(cache_page(60 * 5), name="dispatch")
class DaySummaryView(APIView):
    """
    GET /api/trading/day-summary/?date=YYYY-MM-DD&scope=all|indices|sectors|commodities|crypto&limit=5
    Ranks the most 'important' assets for a given date across the selected scope.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "trading_day_summary"

    def get(self, request):
        day = _parse_date(request.query_params.get("date"))
        scope = (request.query_params.get("scope") or "all").lower()
        try:
            limit = int(request.query_params.get("limit", "5"))
        except ValueError:
            limit = 5

        kind_filter = SCOPE_TO_KINDS.get(scope)
        assets_qs = TradingAsset.objects.filter(status="active")
        if kind_filter:
            assets_qs = assets_qs.filter(kind__in=kind_filter)

        ranked = []
        for asset in assets_qs:
            daily = TradingDaily.objects.filter(asset=asset, date=day).first() or compute_daily_bands(asset, day)
            windows = pick_big_move_windows(daily.bands) or []
            if not windows:
                continue

            topw = max(windows, key=_window_score)
            sc = _window_score(topw)

            ranked.append({
                "asset": asset.id,  # string PK like "NIFTY_50"
                "score": sc,
                "start": topw.get("start"),
                "end": topw.get("end"),
                "label": topw.get("label"),
                "confidence": topw.get("confidence"),
                "volatility": topw.get("volatility"),
                "reasons": topw.get("reasons") or [],
                "caution": bool(topw.get("caution")),
                "peak_score": topw.get("peak_score"),
            })

        ranked.sort(key=lambda x: x["score"], reverse=True)
        top_asset = ranked[0] if ranked else None

        return Response({
            "date": day.isoformat(),
            "tz": "Asia/Kolkata",
            "scope": scope,
            "top_asset": top_asset,
            "ranked": ranked[:limit],
        })
