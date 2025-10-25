
from rest_framework import serializers

class WindowSerializer(serializers.Serializer):
    start = serializers.CharField()
    end = serializers.CharField()
    label = serializers.CharField()
    confidence = serializers.IntegerField()
    volatility = serializers.CharField()
    reasons = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    caution = serializers.BooleanField(default=False)
    peak_score = serializers.IntegerField(required=False)

class IntradayTopResponseSerializer(serializers.Serializer):
    asset = serializers.CharField()
    tz = serializers.CharField()
    session = serializers.DictField()
    windows = WindowSerializer(many=True)
    engine_version = serializers.CharField()

class SectorCardSerializer(serializers.Serializer):
    asset = serializers.CharField()
    up = WindowSerializer(many=True)
    down = WindowSerializer(many=True)

class SectorsResponseSerializer(serializers.Serializer):
    date = serializers.DateField()
    tz = serializers.CharField()
    sectors = SectorCardSerializer(many=True)

class WeekPillSerializer(serializers.Serializer):
    date = serializers.DateField()
    windows = WindowSerializer(many=True)

class WeekResponseSerializer(serializers.Serializer):
    asset = serializers.CharField()
    tz = serializers.CharField()
    days = WeekPillSerializer(many=True)
