from datetime import UTC, datetime, timedelta
from typing import Any, Final

import bcrypt
import jwt

from app.core.config import Settings, get_settings

_BCRYPT_MAX_BYTES: Final[int] = 72


def _truncate_for_bcrypt(value: str) -> bytes:
    encoded = value.encode("utf-8")
    return encoded[:_BCRYPT_MAX_BYTES]


def validate_password_strength(password: str) -> None:
    if len(password.encode("utf-8")) < 8:
        raise ValueError("password must be at least 8 bytes")
    if not any(c.isupper() for c in password) or not any(c.islower() for c in password):
        raise ValueError("password must contain upper and lower case characters")


def hash_password(plain_password: str, settings: Settings | None = None) -> str:
    validate_password_strength(plain_password)
    return bcrypt.hashpw(_truncate_for_bcrypt(plain_password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_truncate_for_bcrypt(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(
    subject: str,
    *,
    settings: Settings | None = None,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    cfg = settings or get_settings()
    issued_at = datetime.now(UTC)
    expires_at = issued_at + (
        expires_delta or timedelta(minutes=cfg.access_token_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": issued_at,
        "exp": expires_at,
        "iss": cfg.jwt_issuer,
        "aud": cfg.jwt_audience,
        "jti": f"{subject}-{int(issued_at.timestamp())}",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, cfg.jwt_secret_key, algorithm=cfg.jwt_algorithm)


def decode_access_token(token: str, *, settings: Settings | None = None) -> dict[str, Any]:
    cfg = settings or get_settings()
    return jwt.decode(
        token,
        cfg.jwt_secret_key,
        algorithms=[cfg.jwt_algorithm],
        audience=cfg.jwt_audience,
        issuer=cfg.jwt_issuer,
    )


def normalize_email(value: str) -> str:
    return value.strip().lower()
