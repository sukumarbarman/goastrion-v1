
# Trading Backend (DRF) — Quick Start

## Install
```bash
pip install Django djangorestframework astral django-redis
```

## settings.py
```python
INSTALLED_APPS += ["trading", "rest_framework"]
REST_FRAMEWORK = {
  "DEFAULT_THROTTLE_CLASSES": ["trading.views.TradingAnonBurstThrottle"],
  "DEFAULT_THROTTLE_RATES": {"trading_anon_burst": "60/min"},
}
# Optional cache (Redis)
# CACHES = {
#   "default": {
#     "BACKEND": "django_redis.cache.RedisCache",
#     "LOCATION": "redis://127.0.0.1:6379/1",
#     "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
#   }
# }
```

## urls.py
```python
path("api/trading/", include("trading.urls"))
```

## DB & seed
```bash
python manage.py makemigrations trading && python manage.py migrate
python manage.py loaddata trading/fixtures/seed_assets.json
```

## Precompute (optional)
```bash
python manage.py compute_trading_windows --days 5
```

## Endpoints
- `/api/trading/intraday-top?asset=NIFTY_50&date=2025-10-25`
- `/api/trading/sectors?date=2025-10-25`
- `/api/trading/week?asset=NIFTY_50&start=2025-10-25`

Location/timezone: **Mumbai / Asia/Kolkata**. English-only. Read-only.
