#goastrion-backend/goastrion_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('astro.api_urls')),
    path('api/auth/', include('accounts.urls')),
    path("api/astro/", include("astro.urls")),
]

