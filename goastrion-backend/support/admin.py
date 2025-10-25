# support/admin.py
from django.contrib import admin
from django.utils import timezone
from .models import ContactMessage

@admin.action(description="Mark selected messages as handled")
def mark_handled(modeladmin, request, queryset):
    # Record who handled and when
    count = queryset.update(
        handled=True,
        handled_at=timezone.now(),
        handled_by=request.user if request.user.is_authenticated else None,
    )
    modeladmin.message_user(request, f"Marked {count} message(s) as handled.")

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = (
        "created_at", "kind", "email", "subject",
        "handled", "handled_by", "handled_at",
    )
    list_filter   = ("kind", "handled", "created_at")
    search_fields = ("email", "name", "subject", "message", "path", "user_agent", "ip_address")
    readonly_fields = ("created_at", "updated_at", "user_agent", "ip_address")
    actions = [mark_handled]
