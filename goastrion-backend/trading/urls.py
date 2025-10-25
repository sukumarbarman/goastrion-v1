
from django.urls import path
from .views import IntradayTopView, SectorsTodayView, WeekView, DaySummaryView

urlpatterns = [
    path("intraday-top/", IntradayTopView.as_view(), name="trading-intraday-top"),
    path("sectors/", SectorsTodayView.as_view(), name="trading-sectors"),
    path("week/", WeekView.as_view(), name="trading-week"),
    path("day-summary/", DaySummaryView.as_view(), name="trading-day-summary"),  # NEW
]
