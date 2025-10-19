# goastrion-backend/astro/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class Chart(models.Model):
    """Stores user's birth details (used for chart generation)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="charts",
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    birth_datetime = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    timezone = models.CharField(max_length=64)
    place = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        name = self.name or "Unnamed Chart"
        return f"{name} ({self.user.username})"


class Planet(models.Model):
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10, blank=True)
    ruler = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Horoscope(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="horoscopes")
    ascendant = models.CharField(max_length=50)
    moon_sign = models.CharField(max_length=50)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Horoscope"


class DailyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_reports")
    date = models.DateField()
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date")

    def __str__(self):
        return f"{self.user.username} - {self.date}"
