"""
Django settings for goastrion_backend project.
Environment-driven (12-factor) so the same repo works for local & prod.
"""

from pathlib import Path
import os
from decouple import config, Csv

# Optional: DATABASE_URL support (Postgres, etc.)
try:
    import dj_database_url
except Exception:
    dj_database_url = None

# --------------------------------------------------------------------------------------
# Base paths
# --------------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------------------
# Core settings (env-driven)
# --------------------------------------------------------------------------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="dev-insecure-key")  # set in prod
DEBUG = config("DJANGO_DEBUG", default=True, cast=bool)

# Comma-separated list, e.g. "goastrion.com,api.goastrion.com,localhost,127.0.0.1"
ALLOWED_HOSTS = list(
    filter(None, [h.strip() for h in config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1").split(",")])
)

# Full-origin list, comma-separated (must include scheme), e.g.
# "https://goastrion.com,https://api.goastrion.com,http://localhost:3000"
CSRF_TRUSTED_ORIGINS = list(
    filter(None, [o.strip() for o in config("DJANGO_CSRF_TRUSTED", default="").split(",")])
)

# CORS (for browser calls from the frontend)
CORS_ALLOWED_ORIGINS = list(
    filter(
        None,
        [o.strip() for o in config("DJANGO_CORS_ORIGINS", default="http://localhost:3000,http://127.0.0.1:3000").split(",")],
    )
)
CORS_ALLOW_CREDENTIALS = config("DJANGO_CORS_CREDENTIALS", default=False, cast=bool)

# If running behind a reverse proxy (nginx), trust X-Forwarded-Proto for HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --------------------------------------------------------------------------------------
# Apps & middleware
# --------------------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "astro",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
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

# --------------------------------------------------------------------------------------
# Database
# - Default: SQLite (local)
# - If DATABASE_URL is set (e.g. postgres://...), use it.
# --------------------------------------------------------------------------------------
if dj_database_url and (db_url := os.getenv("DATABASE_URL")):
    DATABASES = {
        "default": dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            ssl_require=config("DB_SSL_REQUIRE", default=False, cast=bool),
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --------------------------------------------------------------------------------------
# Password validation
# --------------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------------------
# I18N / TZ
# --------------------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------------------
# Static files
# --------------------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------------------------------------------
# Caching (simple in-memory default; swap via env if needed)
# --------------------------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-goastrion_backend-cache",
    }
}

# --------------------------------------------------------------------------------------
# Extra security in production
# --------------------------------------------------------------------------------------
if not DEBUG:
    # Clickjacking:
    X_FRAME_OPTIONS = "DENY"
    # HSTS (handled by nginx too; duplicating here is fine)
    SECURE_HSTS_SECONDS = config("DJANGO_SECURE_HSTS_SECONDS", default=31536000, cast=int)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = False  # flip to True when you’re confident
    # Redirect HTTP→HTTPS if Django ever serves traffic directly
    SECURE_SSL_REDIRECT = config("DJANGO_SSL_REDIRECT", default=False, cast=bool)
    # Other hardening:
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
