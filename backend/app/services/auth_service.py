from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.jwt_tokens import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    token_type,
)
from app.database.repositories.refresh_token_repository import RefreshTokenRepository
from app.database.repositories.user_repository import UserRepository
from app.models import User
from app.core.security import normalize_email, verify_password


class AuthService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._users = UserRepository(session)
        self._refresh_tokens = RefreshTokenRepository(session)

    def authenticate(self, *, email: str, password: str) -> User | None:
        user = self._users.get_by_email(normalize_email(email))
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def issue_tokens(self, user: User, *, user_agent: str | None = None) -> tuple[User, str, object, str]:
        access_token, access_expires_at = create_access_token(
            str(user.id),
            extra_claims={"role": user.role.value},
        )
        refresh_token, refresh_expires_at, jti = create_refresh_token(str(user.id))
        self._refresh_tokens.create(
            jti=jti,
            user_id=user.id,
            expires_at=refresh_expires_at,
            user_agent=user_agent,
        )
        self._session.commit()
        return user, access_token, access_expires_at, refresh_token

    def refresh(self, refresh_token_value: str, *, user_agent: str | None = None) -> tuple[User, str, object, str]:
        if not refresh_token_value:
            raise ValueError("Refresh token required")
        try:
            payload = decode_token(refresh_token_value)
        except TokenError as exc:
            raise ValueError("Invalid refresh token") from exc

        if not token_type(payload, "refresh"):
            raise ValueError("Invalid refresh token type")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid refresh token")

        user = self._users.get(UUID(str(user_id)))
        if user is None or not user.is_active:
            raise ValueError("User not found")

        record = self._refresh_tokens.get_active(payload["jti"])
        if record is None:
            raise ValueError("Refresh token is no longer active")

        self._refresh_tokens.revoke(payload["jti"])
        access_token, access_expires_at = create_access_token(
            str(user.id),
            extra_claims={"role": user.role.value},
        )
        new_refresh_token, new_refresh_expires_at, new_jti = create_refresh_token(str(user.id))
        self._refresh_tokens.create(
            jti=new_jti,
            user_id=user.id,
            expires_at=new_refresh_expires_at,
            user_agent=user_agent,
        )
        self._session.commit()
        return user, access_token, access_expires_at, new_refresh_token

    def logout(self, *, user_id: UUID | None = None, refresh_token_value: str | None = None) -> int:
        if refresh_token_value:
            try:
                payload = decode_token(refresh_token_value)
            except TokenError:
                return 0
            if token_type(payload, "refresh"):
                self._refresh_tokens.revoke(payload["jti"])
                self._session.commit()
                return 1
            return 0

        if user_id is None:
            return 0

        revoked = self._refresh_tokens.revoke_all_for_user(user_id)
        self._session.commit()
        return revoked
