from __future__ import annotations

from typing import Final

import bcrypt

from app.core.config import Settings

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
    rounds = settings.bcrypt_rounds if settings is not None else 12
    salt = bcrypt.gensalt(rounds=rounds)
    return bcrypt.hashpw(_truncate_for_bcrypt(plain_password), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            _truncate_for_bcrypt(plain_password),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def normalize_email(value: str) -> str:
    return value.strip().lower()


# Re-exported for backward compatibility with Phase 1 imports/tests.
from app.core.jwt_tokens import (  # noqa: E402,F401  (re-exports)
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    token_type,
)
