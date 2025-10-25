# goastrion-backend/goastrion_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from astro.api_views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('astro.api_urls')),
    path('api/auth/', include('accounts.urls')),
    path("api/astro/", include("astro.urls")),
    path("api/v1/health", health),
    path("api/contact/", include("support.urls")),
]

