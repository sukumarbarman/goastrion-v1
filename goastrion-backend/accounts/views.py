#goastrion-backend/accounts/views.py
import os
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.db.models import Q

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------
# Helper: create refresh + access token for a user
# ---------------------------------------------------------------------
def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ---------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = _tokens_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "tokens": tokens,
            "message": "User registered successfully"
        }
        return Response({
            "success": True,
            "user": UserSerializer(user).data,
            "access": str(tokens["access"]),
            "refresh": str(tokens["refresh"]),
            "message": "User authenticated successfully"
        })


# ---------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(Q(username__iexact=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        tokens = _tokens_for_user(user)
        return Response({
            "success": True,
            "user": UserSerializer(user).data,
            "access": str(tokens["access"]),
            "refresh": str(tokens["refresh"]),
            "message": "User authenticated successfully"
        })


# ---------------------------------------------------------------------
# Current user (“/me”)
# ---------------------------------------------------------------------
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------
# Logout (blacklist refresh token)
# ---------------------------------------------------------------------
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({"ok": True, "message": "Logged out successfully"})


# ---------------------------------------------------------------------
# Password reset — request
# ---------------------------------------------------------------------
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not reveal whether the email exists
            return Response({"ok": True})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        reset_url = f"{getattr(settings, 'FRONTEND_RESET_URL', '')}?uid={uid}&token={token}"

        subject = "Reset your GoAstrion password"
        template_path = os.path.join(os.path.dirname(__file__), "emails", "password_reset_email.txt")
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                message = f.read().format(username=user.username or user.email, reset_url=reset_url)
        else:
            message = f"Hi {user.username or user.email},\n\nUse this link to reset your GoAstrion password:\n{reset_url}\n"

        send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", None),
            [user.email],
            fail_silently=False,
        )
        return Response({"ok": True, "message": "Password reset link sent if the email exists."})


# ---------------------------------------------------------------------
# Password reset — confirm
# ---------------------------------------------------------------------
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid_int = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_int)
        except Exception:
            return Response({"detail": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"ok": True, "message": "Password has been reset successfully"})

from rest_framework.permissions import IsAuthenticated

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old = request.data.get("old_password")
        new = request.data.get("new_password")
        if not user.check_password(old):
            return Response({"detail": "Incorrect old password."}, status=400)
        user.set_password(new)
        user.save()
        return Response({"ok": True})

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.delete()
        return Response({"ok": True, "message": "Account deleted successfully"})

