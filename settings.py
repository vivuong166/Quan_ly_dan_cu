import os
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env đúng vị trí
load_dotenv(dotenv_path="/Users/mac/Downloads/KTPM-Back-end-main-2/.env")

raw_url = os.getenv("DATABASE_URL")
if not raw_url:
    raise RuntimeError("DATABASE_URL not found in .env")
parsed = urlparse(raw_url)
options = dict(parse_qsl(parsed.query))

# ÉP sslmode=require nếu chưa có
options.setdefault("sslmode", "require")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/"),
        "USER": parsed.username,
        "PASSWORD": parsed.password,
        "HOST": parsed.hostname,
        "PORT": parsed.port or 5432,
        "OPTIONS": options,
    }
}
