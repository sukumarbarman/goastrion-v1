
from __future__ import annotations
from django.db import models
from django.utils import timezone

class SessionRules(models.Model):
    name = models.CharField(max_length=64, unique=True)
    tz_str = models.CharField(max_length=64, default="Asia/Kolkata")
    open_1 = models.CharField(max_length=5, help_text="HH:MM")
    close_1 = models.CharField(max_length=5, help_text="HH:MM")
    open_2 = models.CharField(max_length=5, blank=True, default="")
    close_2 = models.CharField(max_length=5, blank=True, default="")
    holidays_calendar_key = models.CharField(max_length=64, blank=True, default="")
    pre_open_handling = models.CharField(
        max_length=16, choices=[("ignore", "ignore"), ("clip", "clip")], default="ignore"
    )
    def __str__(self):
        return f"{self.name} ({self.tz_str})"

class TradingAsset(models.Model):
    KIND_CHOICES = [("index","Index"),("sector","Sector"),("commodity","Commodity"),("crypto","Crypto")]
    id = models.CharField(max_length=40, primary_key=True)
    name = models.CharField(max_length=80)
    kind = models.CharField(max_length=12, choices=KIND_CHOICES)
    symbol = models.CharField(max_length=80, blank=True, default="")
    exchange = models.CharField(max_length=16, default="NSE")
    tz = models.CharField(max_length=64, default="Asia/Kolkata")
    session_rules = models.ForeignKey(SessionRules, on_delete=models.PROTECT)
    status = models.CharField(max_length=12, default="active")
    def __str__(self):
        return f"{self.id} — {self.name}"

class TradingDaily(models.Model):
    asset = models.ForeignKey(TradingAsset, on_delete=models.CASCADE)
    date = models.DateField()
    tz = models.CharField(max_length=64, default="Asia/Kolkata")
    session_start = models.CharField(max_length=5)
    session_end = models.CharField(max_length=5)
    bands = models.JSONField(default=list)
    engine_version = models.CharField(max_length=16, default="1.0.0")
    generated_at = models.DateTimeField(default=timezone.now)
    class Meta:
        unique_together = ("asset","date")
        indexes = [models.Index(fields=["asset","date"])]
    def __str__(self):
        return f"{self.asset_id} {self.date}"

class AssetNatal(models.Model):
    asset = models.OneToOneField(TradingAsset, on_delete=models.CASCADE)
    datetime_utc = models.DateTimeField()
    tz = models.CharField(max_length=64, default="UTC")
    lat = models.FloatField(default=19.0760)
    lon = models.FloatField(default=72.8777)
    location_name = models.CharField(max_length=80, default="Mumbai")
    source_note = models.TextField(blank=True, default="")
    accuracy = models.CharField(max_length=12, choices=[("exact","exact"),("noon","noon"),("day","day")], default="day")
    include_overlay = models.BooleanField(default=False)
    overlay_weight_preset = models.CharField(max_length=16, choices=[("conservative","conservative"),("standard","standard"),("aggressive","aggressive")], default="conservative")
