from rest_framework import serializers
from .models import Chart

class ChartSerializer(serializers.ModelSerializer):
    # write-only flag used only for duplicate override
    force = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Chart
        fields = [
            "id", "name", "birth_datetime", "latitude", "longitude",
            "timezone", "place", "created_at", "force"
        ]
        read_only_fields = ("id", "created_at")

    def create(self, validated_data):
        # remove non-model field before creating
        validated_data.pop("force", None)
        return Chart.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # remove non-model field before updating
        validated_data.pop("force", None)
        return super().update(instance, validated_data)
