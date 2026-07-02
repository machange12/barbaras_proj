from __future__ import annotations

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any, Final

import jwt

from app.core.config import Settings, get_settings

# Type alias for token "subject": a user identifier in our system.
Subject = str

_ACCESS_TYPE: Final[str] = "access"
_REFRESH_TYPE: Final[str] = "refresh"


def _now() -> datetime:
    return datetime.now(UTC)


def _ensure_settings(
    settings: Settings | None,
    *,
    access_expires: timedelta | None,
    refresh_expires: timedelta | None,
) -> Settings:
    if settings is not None:
        return settings
    cfg = get_settings()
    return cfg


def create_access_token(
    subject: Subject,
    *,
    settings: Settings | None = None,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, datetime]:
    cfg = _ensure_settings(settings, access_expires=None, refresh_expires=None)
    issued_at = _now()
    expires_at = issued_at + (
        expires_delta or timedelta(minutes=cfg.access_token_expire_minutes)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "type": _ACCESS_TYPE,
        "iat": issued_at,
        "exp": expires_at,
        "iss": cfg.jwt_issuer,
        "aud": cfg.jwt_audience,
        "jti": secrets.token_urlsafe(16),
    }
    if extra_claims:
        payload.update(extra_claims)
    token = jwt.encode(payload, cfg.jwt_secret_key, algorithm=cfg.jwt_algorithm)
    return token, expires_at


def create_refresh_token(
    subject: Subject,
    *,
    settings: Settings | None = None,
    expires_delta: timedelta | None = None,
) -> tuple[str, datetime, str]:
    """Returns (token, expires_at, jti)."""
    cfg = _ensure_settings(settings, access_expires=None, refresh_expires=None)
    issued_at = _now()
    expires_at = issued_at + (
        expires_delta
        or timedelta(minutes=cfg.refresh_token_expire_minutes)
    )
    jti = secrets.token_urlsafe(24)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": _REFRESH_TYPE,
        "iat": issued_at,
        "exp": expires_at,
        "iss": cfg.jwt_issuer,
        "aud": cfg.jwt_audience,
        "jti": jti,
    }
    token = jwt.encode(payload, cfg.jwt_secret_key, algorithm=cfg.jwt_algorithm)
    return token, expires_at, jti


class TokenError(Exception):
    """Raised when token validation fails (signature/audience/issuer/expired)."""


def decode_token(token: str, *, settings: Settings | None = None) -> dict[str, Any]:
    cfg = _ensure_settings(settings, access_expires=None, refresh_expires=None)
    try:
        return jwt.decode(
            token,
            cfg.jwt_secret_key,
            algorithms=[cfg.jwt_algorithm],
            audience=cfg.jwt_audience,
            issuer=cfg.jwt_issuer,
        )
    except jwt.PyJWTError as exc:
        raise TokenError(str(exc)) from exc


def token_type(payload: dict[str, Any], expected: str) -> bool:
    return payload.get("type") == expected
