#goastrion-backend/astro/urls.py

from django.urls import path
from .views import ChartListCreateView, ChartDeleteView

urlpatterns = [
    path("charts/", ChartListCreateView.as_view()),  # GET + POST
    path("charts/<int:pk>/", ChartDeleteView.as_view()),  # DELETE
]
