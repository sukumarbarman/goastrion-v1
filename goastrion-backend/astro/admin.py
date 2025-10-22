from django.contrib import admin
from .models import Planet, Horoscope, DailyReport, Chart

@admin.register(Planet)
class PlanetAdmin(admin.ModelAdmin):
    list_display = ("name", "ruler", "created_at")
    search_fields = ("name", "ruler")


@admin.register(Horoscope)
class HoroscopeAdmin(admin.ModelAdmin):
    list_display = ("user", "ascendant", "moon_sign", "date_created")
    search_fields = ("user__username", "ascendant", "moon_sign")
    list_filter = ("ascendant", "moon_sign")


@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "summary", "created_at")
    search_fields = ("user__username", "summary")
    list_filter = ("date",)


@admin.register(Chart)
class ChartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "birth_datetime", "place", "created_at")
    list_filter = ("timezone", "created_at")
    search_fields = ("name", "place", "user__username", "user__email")

