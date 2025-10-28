"""
Django settings for goastrion_backend project.
"""

from __future__ import annotations

import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
from decouple import config, Csv
import dj_database_url
# from corsheaders.defaults import default_headers  # <- only needed if you add custom headers

# ------------------------------------------------------------------------------
# Paths & .env loading
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Prefer project-local .env; fall back to prod path used on the server
dotenv_path = BASE_DIR / ".env"
if not dotenv_path.exists():
    dotenv_path = Path("/srv/goastrion/backend/.env")
load_dotenv(dotenv_path, override=True)

# Give ZoneInfo a tz database on Windows/slim containers if tzdata is present
try:
    import tzdata  # type: ignore
    os.environ.setdefault("PYTHONTZPATH", tzdata.zoneinfo.__path__[0])
except Exception:
    pass

# ------------------------------------------------------------------------------
# Core / Security
# ------------------------------------------------------------------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe-dev-key")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

# Security toggles (auto-on when not DEBUG unless overridden)
DJANGO_SECURE = config("DJANGO_SECURE", default=not DEBUG, cast=bool)
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=DJANGO_SECURE, cast=bool)
SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=DJANGO_SECURE, cast=bool)
CSRF_COOKIE_SECURE = config("CSRF_COOKIE_SECURE", default=DJANGO_SECURE, cast=bool)
SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=(31536000 if DJANGO_SECURE else 0), cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False, cast=bool)
SECURE_HSTS_PRELOAD = config("SECURE_HSTS_PRELOAD", default=False, cast=bool)

# When running behind nginx/proxy that sets X-Forwarded-Proto
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Sensible cookie defaults
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"

# ------------------------------------------------------------------------------
# CORS / CSRF
# ------------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=False, cast=bool)

# Allow reading either key name (new vs old)
_cors_from_new = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
_cors_from_old = config("DJANGO_CORS_ORIGINS", default="", cast=Csv())
CORS_ALLOWED_ORIGINS = _cors_from_new or _cors_from_old

_csrf_from_new = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())
_csrf_from_old = config("DJANGO_CSRF_TRUSTED", default="", cast=Csv())
CSRF_TRUSTED_ORIGINS = _csrf_from_new or _csrf_from_old

CORS_ALLOW_CREDENTIALS = True

# If you ever send a custom header (e.g., Accept-Language) from the frontend,
# uncomment the import at top and the block below.
# CORS_ALLOW_HEADERS = list(default_headers) + ["accept-language"]

# ------------------------------------------------------------------------------
# App-level config dir (your Aspect/Domain JSON, etc.)
# ------------------------------------------------------------------------------
GOASTRION_CONFIG_DIR = config("GOASTRION_CONFIG_DIR", default=str(BASE_DIR / "config"))
os.environ.setdefault("GOASTRION_CONFIG_DIR", GOASTRION_CONFIG_DIR)

# ------------------------------------------------------------------------------
# Applications
# ------------------------------------------------------------------------------
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",

    # Local apps
    "accounts",
    "astro",
    "support",
    "trading",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must stay first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "goastrion_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "goastrion_backend.wsgi.application"

# ------------------------------------------------------------------------------
# DRF / Auth
# ------------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        ["astro.renderers.UTF8JSONRenderer"] if not DEBUG else [
            "astro.renderers.UTF8JSONRenderer",
            # "rest_framework.renderers.BrowsableAPIRenderer",
        ]
    ),
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "contact_submit": "10/hour",
        "trading_intraday": "60/min",
        "trading_sectors":  "30/min",
        "trading_week":     "30/min",
        "trading_day_summary": "60/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("JWT_ACCESS_MIN", default=60, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=config("JWT_REFRESH_DAYS", default=7, cast=int)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

AUTH_USER_MODEL = "accounts.User"
AUTHENTICATION_BACKENDS = [
    "accounts.backends.UsernameOrEmailBackend",
    "django.contrib.auth.backends.ModelBackend",
]

DEFAULT_CHARSET = "utf-8"
APPEND_SLASH = True

# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------
DATABASE_URL = config("DATABASE_URL", default="")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Set it in your .env")

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=config("DB_CONN_MAX_AGE", default=120, cast=int),
        ssl_require=config("DB_SSL_REQUIRE", default=False, cast=bool),
    )
}
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True
DATABASES["default"]["ATOMIC_REQUESTS"] = config("DB_ATOMIC_REQUESTS", default=False, cast=bool)

# ------------------------------------------------------------------------------
# Email
# ------------------------------------------------------------------------------
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="smtp.hostinger.com")   # Titan: smtp.titan.email
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=False, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="support@yourdomain.com")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)
SERVER_EMAIL = config("SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)
EMAIL_SUBJECT_PREFIX = config("EMAIL_SUBJECT_PREFIX", default="[GoAstrion] ")
EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=20, cast=int)
CONTACT_NOTIFY_TO = config("CONTACT_NOTIFY_TO", default="support@goastrion.com")
DEFAULT_SUPPORT_EMAIL = config("DEFAULT_SUPPORT_EMAIL", default="support@goastrion.com")

# Link used inside password reset emails
FRONTEND_RESET_URL = config("FRONTEND_RESET_URL", default="https://goastrion.com/reset-password")

# ------------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TZ", "UTC")
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------------------
# Static / Media
# ------------------------------------------------------------------------------
STATIC_URL = "/static/"      # absolute URL path
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ------------------------------------------------------------------------------
# Default primary key
# ------------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------------------
# Cache
# ------------------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-goastrion_backend-cache",
    }
}

# ------------------------------------------------------------------------------
# Logging (human-readable in dev, tighter in prod)
# ------------------------------------------------------------------------------
LOG_LEVEL = config("DJANGO_LOG_LEVEL", default=("DEBUG" if DEBUG else "INFO"))
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "dev": {"format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s"},
        "prod": {"format": "%(levelname)s %(asctime)s %(name)s %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "dev" if DEBUG else "prod",
        },
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
}
