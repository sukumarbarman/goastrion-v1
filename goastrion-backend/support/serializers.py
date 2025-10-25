#support/serializers.py
from __future__ import annotations
from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = [
            "id", "created_at", "kind", "name", "email", "subject", "message",
            "path", "user_agent", "ip_address",
        ]
        read_only_fields = ["id", "created_at", "user_agent", "ip_address"]

    def validate_message(self, v: str) -> str:
        if len(v.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return v
