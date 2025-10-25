
from datetime import date, timedelta
try:
    from celery import shared_task
except Exception:  # Celery not installed
    shared_task = lambda *a, **k: (lambda f: f)

from .models import TradingAsset
from .services.engine import compute_daily_bands

@shared_task(name="trading.precompute")
def precompute(days: int = 5):
    today = date.today()
    assets = TradingAsset.objects.filter(status="active").order_by("id")
    for a in assets:
        for i in range(days + 1):
            compute_daily_bands(a, today + timedelta(days=i), force=True)
