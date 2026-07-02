import json
import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-secret-that-is-long-enough-to-pass-validators-1234",
)
os.environ.setdefault(
    "BACKEND_CORS_ORIGINS",
    json.dumps(["http://localhost:5173"]),
)
