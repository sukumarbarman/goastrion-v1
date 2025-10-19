#goastrion-backend/accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, LoginView, MeView, LogoutView,
    PasswordResetRequestView, PasswordResetConfirmView, ChangePasswordView, DeleteAccountView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/",    LoginView.as_view()),
    path("me/",       MeView.as_view()),
    path("logout/",   LogoutView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),

    path("forgot-password/", PasswordResetRequestView.as_view()),
    path("reset-password/",  PasswordResetConfirmView.as_view()),

    path("change-password/", ChangePasswordView.as_view()),
    path("delete-account/", DeleteAccountView.as_view()),

]
