
from django.contrib import admin
from django.http import HttpResponse
import csv
from .models import SessionRules, TradingAsset, TradingDaily, AssetNatal
from .services.engine import compute_daily_bands

@admin.register(SessionRules)
class SessionRulesAdmin(admin.ModelAdmin):
    list_display = ("name","tz_str","open_1","close_1","open_2","close_2")

@admin.register(TradingAsset)
class TradingAssetAdmin(admin.ModelAdmin):
    list_display = ("id","name","kind","exchange","session_rules","status")
    search_fields = ("id","name","symbol")

@admin.action(description="Recompute selected days")
def recompute_days(modeladmin, request, queryset):
    for td in queryset:
        compute_daily_bands(td.asset, td.date, force=True)

@admin.action(description="Export CSV (bands)")
def export_csv(modeladmin, request, queryset):
    resp = HttpResponse(content_type="text/csv")
    resp["Content-Disposition"] = 'attachment; filename="trading_bands.csv"'
    w = csv.writer(resp)
    w.writerow(["asset","date","start","end","bias","confidence","volatility","reasons","caution","engine_version"])
    for td in queryset:
        for b in td.bands:
            w.writerow([td.asset_id, td.date, b.get("start"), b.get("end"), b.get("bias"),
                        b.get("confidence"), b.get("volatility"), ";".join(b.get("reasons",[])),
                        b.get("caution", False), td.engine_version])
    return resp

@admin.register(TradingDaily)
class TradingDailyAdmin(admin.ModelAdmin):
    list_display = ("asset","date","session_start","session_end","engine_version","generated_at")
    date_hierarchy = "date"
    actions = [recompute_days, export_csv]

@admin.register(AssetNatal)
class AssetNatalAdmin(admin.ModelAdmin):
    list_display = ("asset","location_name","datetime_utc","include_overlay","overlay_weight_preset")
