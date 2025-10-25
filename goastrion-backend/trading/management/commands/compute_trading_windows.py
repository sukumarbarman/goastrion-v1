
from __future__ import annotations
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from trading.models import TradingAsset
from trading.services.engine import compute_daily_bands

class Command(BaseCommand):
    help = "Precompute trading daily bands for today + next N days (default 5)."
    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=5)
    def handle(self, *args, **opts):
        days = int(opts.get("days") or 5)
        today = date.today()
        assets = TradingAsset.objects.filter(status="active").order_by("id")
        for a in assets:
            for i in range(days + 1):
                compute_daily_bands(a, today + timedelta(days=i), force=True)
        self.stdout.write(self.style.SUCCESS(f"Computed for {assets.count()} assets, {days+1} days."))
