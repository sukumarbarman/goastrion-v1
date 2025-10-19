# astro/serializers.py
from rest_framework import serializers
from .models import Chart

class ChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chart
        fields = ["id", "name", "birth_datetime", "latitude", "longitude", "timezone", "created_at"]
