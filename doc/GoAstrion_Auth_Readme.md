# 🪐 GoAstrion Authentication Module

A secure Django REST Framework–based authentication system using JWT (JSON Web Tokens) via **SimpleJWT**.  
Supports registration, login, logout, password reset (via Hostinger email), and token-based authentication for the GoAstrion backend.

---

## 🚀 Features

| Feature | Description |
|----------|--------------|
| **Register** | Create new users with username, email, and password |
| **Login** | Authenticate using either username or email |
| **Logout** | Blacklist JWT refresh tokens |
| **Me** | Retrieve the authenticated user’s profile |
| **Forgot Password** | Send password reset link via Hostinger (Titan Mail) |
| **Reset Password** | Set a new password using the reset token |
| **JWT Authentication** | Stateless tokens using `djangorestframework-simplejwt` |

---

## 🧰 Tech Stack

- **Django 5.x**
- **Django REST Framework (DRF)**
- **SimpleJWT** for access/refresh tokens
- **PostgreSQL**
- **Hostinger Email (SMTP)** for password reset

---

## ⚙️ Environment Variables (`.env`)

Your `.env` file should contain the following keys:

```ini
DJANGO_SECRET_KEY=django-insecure-your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DATABASE_URL=postgresql://ga_user:GoAstrion%400@127.0.0.1:5432/goastrion

# CORS / CSRF (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email (Hostinger/Titan)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=info@goastrion.com
EMAIL_HOST_PASSWORD=Kadugodi@0
DEFAULT_FROM_EMAIL=info@goastrion.com

# Frontend link for password reset
FRONTEND_RESET_URL=https://goastrion.com/reset-password
```

---

## 🧩 Installation & Setup

```bash
git clone https://github.com/yourname/goastrion-backend.git
cd goastrion-backend
python -m venv .venv
.\.venv\Scripts\activate   # (Windows)
pip install -r requirements.txt
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 🔑 Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|-----------|-------------|----------------|
| `POST` | `/api/auth/register/` | Register new user | ❌ |
| `POST` | `/api/auth/login/` | Login via email or username | ❌ |
| `GET`  | `/api/auth/me/` | Get logged-in user info | ✅ |
| `POST` | `/api/auth/logout/` | Blacklist refresh token | ✅ |
| `POST` | `/api/auth/forgot-password/` | Send password reset email | ❌ |
| `POST` | `/api/auth/reset-password/` | Confirm new password | ❌ |
| `POST` | `/api/auth/token/refresh/` | Refresh access token | ❌ |

---

## 🧪 Testing via cURL

### Register
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/   -H "Content-Type: application/json"   -d '{"username":"demo","email":"demo@example.com","password":"Demo@1234"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/   -H "Content-Type: application/json"   -d '{"identifier":"demo@example.com","password":"Demo@1234"}'
```

### Get Profile
```bash
curl -X GET http://127.0.0.1:8000/api/auth/me/   -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Logout
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/   -H "Content-Type: application/json"   -H "Authorization: Bearer <ACCESS_TOKEN>"   -d '{"refresh":"<REFRESH_TOKEN>"}'
```

---

## 📬 Password Reset Flow

1. User submits email → `/api/auth/forgot-password/`
2. Email sent via **Hostinger SMTP** with reset link:
   ```
   https://goastrion.com/reset-password?uid=<uid>&token=<token>
   ```
3. Frontend calls `/api/auth/reset-password/` with:
   ```json
   {
     "uid": "<uid>",
     "token": "<token>",
     "new_password": "NewPass@123"
   }
   ```

---

## ✅ Example Successful Register Response
```json
{
  "user": {
    "id": 4,
    "username": "demo2",
    "email": "demo2@example.com"
  },
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1...",
    "access": "eyJhbGciOiJIUzI1..."
  },
  "message": "User registered successfully"
}
```
