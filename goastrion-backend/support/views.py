# support/views.py
from __future__ import annotations
from typing import Iterable, List
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from .serializers import ContactMessageSerializer
from .models import ContactMessage

def _client_ip(request) -> str | None:
    # Respect common proxy headers but fall back to REMOTE_ADDR
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        # take first (original client)
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")

def _notify_to_list() -> List[str]:
    # 1) CONTACT_NOTIFY_TO="a@x.com,b@y.com" (env) → list
    raw = getattr(settings, "CONTACT_NOTIFY_TO", "")
    if isinstance(raw, str) and raw.strip():
        return [e.strip() for e in raw.split(",") if e.strip()]
    # 2) ADMINS in settings
    admins = getattr(settings, "ADMINS", ())
    if admins:
        return [email for _, email in admins if email]
    # 3) fallback (optional)
    default = getattr(settings, "DEFAULT_SUPPORT_EMAIL", "")
    return [default] if default else []

def _send_email(instance: ContactMessage) -> None:
    recipients = _notify_to_list()
    if not recipients:
        return  # nothing configured; silently skip

    subject = instance.subject or f"{instance.get_kind_display()} via Contact"
    lines: Iterable[str] = [
        f"New {instance.get_kind_display()} message",
        "",
        f"From: {instance.name or '(no name)'} <{instance.email}>",
        f"Kind: {instance.kind}",
        f"Subject: {instance.subject or '(none)'}",
        "",
        "Message:",
        instance.message,
        "",
        f"Path: {instance.path or '-'}",
        f"User-Agent: {instance.user_agent or '-'}",
        f"IP: {instance.ip_address or '-'}",
        f"Received at: {timezone.localtime(instance.created_at).isoformat()}",
    ]
    body = "\n".join(lines)

    from_addr = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@goastrion.com")
    email = EmailMessage(subject=subject, body=body, from_email=from_addr, to=recipients)
    try:
        email.send(fail_silently=True)
    except Exception:  # noqa
        # keep API resilient even if email fails
        pass

class ContactSubmitView(APIView):
    permission_classes = [AllowAny]
    throttle_classes   = [ScopedRateThrottle]
    throttle_scope     = "contact_submit"

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data["user_agent"] = request.META.get("HTTP_USER_AGENT", "")
        data["ip_address"] = _client_ip(request)

        serializer = ContactMessageSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance: ContactMessage = serializer.save()

        _send_email(instance)

        return Response({"ok": True, "id": instance.id}, status=201)
