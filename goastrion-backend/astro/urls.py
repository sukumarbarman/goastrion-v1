# astro/urls.py
from django.urls import path
from .views import ChartListCreateView, ChartDeleteView

urlpatterns = [
    path("charts/", ChartListCreateView.as_view(), name="charts-list-create"),
    path("charts/<int:pk>/", ChartDeleteView.as_view(), name="charts-delete"),
]
