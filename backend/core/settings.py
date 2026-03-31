from datetime import timedelta
from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
parent_env = BASE_DIR.parent / ".env"
if parent_env.exists():
    load_dotenv(parent_env)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
EMAIL_LOGO_URL = os.getenv("EMAIL_LOGO_URL") or f"{FRONTEND_URL.rstrip('/')}/favicon_deepmind.png"

SECRET_KEY = "change-me"
DEBUG = os.getenv("DEBUG") == "True"
ALLOWED_HOSTS = ["dev.deepmind.tn", "localhost", "127.0.0.1"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "rest_framework",
    "corsheaders",
    # local
    "accounts",
    "assessments",
    "talent_matching",
    "department_reporting",
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

ROOT_URLCONF = "core.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

WSGI_APPLICATION = "core.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB"),
        "USER": os.environ.get("POSTGRES_USER"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "HOST": os.environ.get("POSTGRES_HOST"),
        "PORT": os.environ.get("POSTGRES_PORT", 5432),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---- Custom user
AUTH_USER_MODEL = "accounts.User"

# ---- DRF + JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",   # HR / Employees
        "accounts.authentication.CandidateTokenAuthentication",        # Candidates
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ---- CORS
CORS_ALLOW_ALL_ORIGINS = True

# Allow custom candidate header
from corsheaders.defaults import default_headers

CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-candidate-token",
]

# OpenAI API Key
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# ---- Email Configuration (SMTP)
EMAIL_BACKEND = "core.email_ssl.UnverifiedEmailBackend"

EMAIL_HOST = os.environ.get("MAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
EMAIL_HOST_USER = os.environ.get("MAIL_USERNAME")

# Normalize credentials loaded from docker/.env files.
# This avoids auth failures when values are wrapped in quotes or Gmail app passwords include spaces.
_raw_mail_password = os.environ.get("MAIL_PASSWORD", "")
EMAIL_HOST_PASSWORD = _raw_mail_password.strip().strip('"').strip("'").replace(" ", "")

DEFAULT_FROM_EMAIL = os.environ.get("MAIL_FROM_ADDRESS")

_mail_encryption = (os.environ.get("MAIL_ENCRYPTION") or "tls").strip().lower()
EMAIL_USE_TLS = _mail_encryption in ("", "tls", "starttls")
EMAIL_USE_SSL = _mail_encryption in ("ssl", "smtps")

# Do not enable both at the same time.
if EMAIL_USE_SSL:
    EMAIL_USE_TLS = False


MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
