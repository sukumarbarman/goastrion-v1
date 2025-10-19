from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_password(self, value):
        """
        Run Django's built-in password validators and return readable errors.
        """
        # Create a temporary user instance so validators can compare username/email
        user = User(
            username=self.initial_data.get("username"),
            email=self.initial_data.get("email")
        )
        try:
            validate_password(value, user)
        except Exception as e:
            # Convert validator errors into a clean serializer.ValidationError
            raise serializers.ValidationError(e.messages if hasattr(e, "messages") else [str(e)])
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        user = self.context.get("user")  # optional context for advanced checks
        try:
            validate_password(value, user)
        except Exception as e:
            raise serializers.ValidationError(e.messages if hasattr(e, "messages") else [str(e)])
        return value
