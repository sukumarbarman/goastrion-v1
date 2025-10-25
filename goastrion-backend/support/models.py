#support/models.py
from __future__ import annotations
from django.db import models
from django.conf import settings

class ContactMessage(models.Model):
    class Kind(models.TextChoices):
        GENERAL = "general", "General"
        FEEDBACK = "feedback", "Feedback"
        BUG = "bug", "Bug report"
        FEATURE = "feature", "Feature request"

    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    kind         = models.CharField(max_length=20, choices=Kind.choices, default=Kind.GENERAL)
    name         = models.CharField(max_length=120, blank=True)
    email        = models.EmailField()
    subject      = models.CharField(max_length=200, blank=True)
    message      = models.TextField()

    path         = models.CharField(max_length=300, blank=True)        # frontend page
    user_agent   = models.TextField(blank=True)
    ip_address   = models.GenericIPAddressField(blank=True, null=True)

    handled      = models.BooleanField(default=False)
    handled_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="handled_contact"
    )
    handled_at   = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"[{self.kind}] {self.email} – {self.subject or self.message[:40]}"
