"""
Django settings for goastrion_backend project.
"""
"""
Django settings for goastrion_backend project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from decouple import config, Csv
import dj_database_url

# ----------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment file:
#  1. Prefer repo-local .env.backend (for local dev)
#  2. Otherwise fall back to /srv/goastrion/.env.backend (production)
dotenv_path = BASE_DIR / ".env.backend"
if not dotenv_path.exists():
    dotenv_path = Path("/srv/goastrion/.env.backend")

load_dotenv(dotenv_path, override=True)

# ----------------------------------------------------------------------
# Security
# ----------------------------------------------------------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe-dev-key")
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

# ----------------------------------------------------------------------
# CORS / CSRF
# ----------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=False, cast=bool)
CORS_ALLOWED_ORIGINS = config("DJANGO_CORS_ORIGINS", default="", cast=Csv())
CSRF_TRUSTED_ORIGINS = config("DJANGO_CSRF_TRUSTED", default="", cast=Csv())



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

# ------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ------------------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------------------------
# Internationalization
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("TZ", "UTC")
USE_I18N = True
USE_TZ = True

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


