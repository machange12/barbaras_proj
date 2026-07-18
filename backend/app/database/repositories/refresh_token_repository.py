from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import RefreshToken


class RefreshTokenRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(
        self,
        *,
        jti: str,
        user_id: UUID,
        expires_at: datetime,
        user_agent: str | None = None,
    ) -> RefreshToken:
        record = RefreshToken(
            jti=jti,
            user_id=user_id,
            expires_at=expires_at,
            user_agent=user_agent,
        )
        self._session.add(record)
        self._session.flush()
        return record

    def get_active(self, jti: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(
            RefreshToken.jti == jti,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > func.now(),
        )
        return self._session.execute(stmt).scalar_one_or_none()

    def revoke(self, jti: str) -> None:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.jti == jti)
            .values(revoked_at=func.now())
        )
        self._session.execute(stmt)

    def revoke_all_for_user(self, user_id: UUID) -> int:
        stmt = (
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=func.now())
        )
        return self._session.execute(stmt).rowcount or 0

    def list_for_user(self, user_id: UUID) -> Sequence[RefreshToken]:
        stmt = (
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .order_by(RefreshToken.created_at.desc())
        )
        return self._session.execute(stmt).scalars().all()
