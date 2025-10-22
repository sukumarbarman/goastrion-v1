#goastrion-backend/astro/views.py
from rest_framework import generics, permissions
from .models import Chart
from .serializers import ChartSerializer

class ChartListCreateView(generics.ListCreateAPIView):
    serializer_class = ChartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chart.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChartDeleteView(generics.DestroyAPIView):
    serializer_class = ChartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chart.objects.filter(user=self.request.user)
