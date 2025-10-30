# goastrion-backend/astro/api_urls.py
from django.urls import path
from .api_views import ChartView, GeocodeView, InsightsView, ShubhDinRunView, SaturnOverviewView
from .api_daily import DailyRemediesView

# ✅ extra imports
from .views import ChartListCreateView, ChartDeleteView

urlpatterns = [
    # Core APIs
    path('chart', ChartView.as_view(), name='chart'),
    path('geocode', GeocodeView.as_view(), name='geocode'),
    path('v1/geocode', GeocodeView.as_view(), name='geocode_v1'),   # ✅ new alias
    path('insights', InsightsView.as_view(), name='insights'),

    # v1 endpoints
    path('v1/shubhdin/run', ShubhDinRunView.as_view(), name='shubhdin_run'),
    path('v1/saturn/overview', SaturnOverviewView.as_view(), name='saturn_overview'),
    path('v1/daily', DailyRemediesView.as_view(), name='daily'),

    # Astro CRUD
    path('astro/charts/', ChartListCreateView.as_view(), name='astro_charts'),
    path('astro/charts/<int:pk>/', ChartDeleteView.as_view(), name='astro_chart_delete'),
]
