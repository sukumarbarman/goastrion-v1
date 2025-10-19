"""
Django settings for goastrion_backend project.
"""


import os
from pathlib import Path
from dotenv import load_dotenv
from decouple import config, Csv
import dj_database_url
from datetime import timedelta

# ----------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment file:
#  1) Prefer project-local .env (for local dev)
#  2) Fallback to /srv/goastrion/backend/.env (production)
dotenv_path = BASE_DIR / ".env"
if not dotenv_path.exists():
    dotenv_path = Path("/srv/goastrion/backend/.env")
load_dotenv(dotenv_path, override=True)

# Ensure ZoneInfo has a tz database even inside slim containers/Windows
try:
    import tzdata  # type: ignore
    os.environ.setdefault("PYTHONTZPATH", tzdata.zoneinfo.__path__[0])
except Exception:
    # tzdata not installed: system tzdb must exist (e.g., /usr/share/zoneinfo)
    pass

# ----------------------------------------------------------------------
# Security
# ----------------------------------------------------------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe-dev-key")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())


# ----------------------------------------------------------------------
# CORS / CSRF
# ----------------------------------------------------------------------
# Support either naming convention in your .env:
# - CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS (typical)
# - DJANGO_CORS_ORIGINS / DJANGO_CSRF_TRUSTED (your earlier keys)
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=False, cast=bool)

_cors_from_new = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
_cors_from_old = config("DJANGO_CORS_ORIGINS", default="", cast=Csv())
CORS_ALLOWED_ORIGINS = _cors_from_new or _cors_from_old

_csrf_from_new = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())
_csrf_from_old = config("DJANGO_CSRF_TRUSTED", default="", cast=Csv())
CSRF_TRUSTED_ORIGINS = _csrf_from_new or _csrf_from_old

# ----------------------------------------------------------------------
# App-level config directory (for Aspect/Domain JSON etc.)
# ----------------------------------------------------------------------
GOASTRION_CONFIG_DIR = config("GOASTRION_CONFIG_DIR", default=str(BASE_DIR / "config"))

# Ensure submodules that read directly from os.getenv see it:
os.environ.setdefault("GOASTRION_CONFIG_DIR", GOASTRION_CONFIG_DIR)



# ------------------------------------------------------------------------------
# Applications
# ------------------------------------------------------------------------------
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
    "rest_framework_simplejwt.token_blacklist",
    "accounts",
]

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["astro.renderers.UTF8JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

DEFAULT_CHARSET = "utf-8"
# Use our custom user before first migrate
AUTH_USER_MODEL = "accounts.User"

# Allow login with username OR email (fallback to default ModelBackend)
AUTHENTICATION_BACKENDS = [
    "accounts.backends.UsernameOrEmailBackend",
    "django.contrib.auth.backends.ModelBackend",
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
CORS_ALLOW_CREDENTIALS = True
# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------
DATABASE_URL = config("DATABASE_URL", default="")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is required. Set it in your .env (local) or prod EnvironmentFile."
    )

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=config("DB_CONN_MAX_AGE", default=120, cast=int),  # keep-alive
        ssl_require=config("DB_SSL_REQUIRE", default=False, cast=bool),  # set True if your PG needs SSL
    )
}
# Auto-recycle bad/stale connections
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

# --- Email (Hostinger/Titan), same keys for local & prod ---
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")

EMAIL_HOST = config("EMAIL_HOST", default="smtp.hostinger.com")   # Titan: smtp.titan.email
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)          # 587 (TLS) or 465 (SSL)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)  # if 465 -> set TLS False and SSL True
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=False, cast=bool)

EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="support@yourdomain.com")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)
SERVER_EMAIL = config("SERVER_EMAIL", default=DEFAULT_FROM_EMAIL)  # for error emails
EMAIL_SUBJECT_PREFIX = config("EMAIL_SUBJECT_PREFIX", default="[GoAstrion] ")
EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=20, cast=int)

# Link used inside password reset emails (set per environment)
FRONTEND_RESET_URL = config("FRONTEND_RESET_URL", default="https://goastrion.com/reset-password")

AUTH_USER_MODEL = "accounts.User"


# ------------------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 4},
    },
]




# ------------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TZ", "UTC")
USE_I18N = True
USE_TZ = True
DEFAULT_CHARSET = "utf-8"  # explicit, Django default anyway


# ------------------------------------------------------------------------------
# Static files
# ------------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ------------------------------------------------------------------------------
# Default primary key field type
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


