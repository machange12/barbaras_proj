from collections.abc import Iterable
from functools import lru_cache
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.jwt_tokens import TokenError, decode_token, token_type
from app.database.session import get_db
from app.models import User, UserRole

SettingsDep = Annotated[Settings, Depends(get_settings)]
DatabaseSession = Annotated[Session, Depends(get_db)]


@lru_cache
def _bootstrap_curator_id_cache() -> dict[str, str]:
    return {}


def set_bootstrap_curator(email: str | None) -> None:
    """Phase 1: hand the curator email to the runtime so `require_curator` can resolve it.

    Removed in Phase 2 in favour of JWT-based identity.
    """
    if email:
        _bootstrap_curator_id_cache()["email"] = email.lower()


def _clear_bootstrap_cache() -> None:
    _bootstrap_curator_id_cache.cache_clear()


def get_current_user(
    request: Request,
    db: DatabaseSession,
) -> User | None:
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return None

    try:
        payload = decode_token(token)
    except TokenError:
        return None

    if not token_type(payload, "access"):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user_uuid = UUID(str(user_id))
    except ValueError:
        return None

    from app.services.user_service import UserService

    service = UserService(db)
    return service.get(user_uuid)


def require_curator(user: Annotated[User | None, Depends(get_current_user)]) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.role is not UserRole.curator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Curator privileges required",
        )
    return user


def allowed_roles(roles: Iterable[UserRole]):
    allowed = set(roles)

    def _checker(user: Annotated[User | None, Depends(get_current_user)]) -> User:
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role",
            )
        return user

    return _checker
