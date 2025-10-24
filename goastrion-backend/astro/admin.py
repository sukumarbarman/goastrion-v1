from django.contrib import admin
from .models import  Chart



@admin.register(Chart)
class ChartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "birth_datetime", "place", "created_at")
    list_filter = ("timezone", "created_at")
    search_fields = ("name", "place", "user__username", "user__email")

