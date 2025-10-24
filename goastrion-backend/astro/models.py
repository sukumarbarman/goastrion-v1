# goastrion-backend/astro/models.py
from django.db import models
from django.conf import settings


class Chart(models.Model):
    """Stores user's birth details (used for chart generation)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="charts",
        db_index=True,  # harmless redundancy; FK gets an index by default
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
        indexes = [
            models.Index(
                fields=["user", "created_at"],
                name="astro_chart_user_id_d020fe_idx",  # match migration 0003
            ),
        ]

    def __str__(self):
        return f"{self.name or 'Unnamed Chart'} ({self.user.username})"
