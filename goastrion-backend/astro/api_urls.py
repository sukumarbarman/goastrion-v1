#goastrion-backend/astro/api_urls.py
from django.urls import path
from .api_views import ChartView, GeocodeView, InsightsView, ShubhDinRunView, SaturnOverviewView
from .api_daily import DailyRemediesView  # ← NEW import

urlpatterns = [
    path('chart', ChartView.as_view(), name='chart'),
    path('geocode', GeocodeView.as_view(), name='geocode'),
    path('insights', InsightsView.as_view(), name='insights'),

    path('v1/shubhdin/run', ShubhDinRunView.as_view(), name='shubhdin_run'),
    path('v1/saturn/overview', SaturnOverviewView.as_view(), name='saturn_overview'),

    path('v1/daily', DailyRemediesView.as_view(), name='daily'),  # NEW
]
