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
#  1) Prefer project-local .env (for local dev)
#  2) Fallback to /srv/goastrion/backend/.env (production)
dotenv_path = BASE_DIR / ".env"
if not dotenv_path.exists():
    dotenv_path = Path("/srv/goastrion/backend/.env")
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
]

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
}


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


