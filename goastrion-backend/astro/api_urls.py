from django.urls import path
from .api_views import ChartView, GeocodeView

urlpatterns = [
    path('chart', ChartView.as_view(), name='chart'),
    path('geocode', GeocodeView.as_view(), name='geocode'),
]