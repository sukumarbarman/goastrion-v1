from django.urls import path
from .api_views import ChartView, GeocodeView, InsightsView

urlpatterns = [
    path('chart', ChartView.as_view(), name='chart'),
    path('geocode', GeocodeView.as_view(), name='geocode'),
    path('insights', InsightsView.as_view(), name='insights'),
]