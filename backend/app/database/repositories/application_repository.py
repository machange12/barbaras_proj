from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.repositories.base import BaseRepository
from app.models import Application, ApplicationStatus


class ApplicationRepository(BaseRepository[Application]):
    model = Application

    def list_recent(
        self,
        *,
        status: ApplicationStatus | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[Application]:
        stmt = (
            select(Application)
            .order_by(Application.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if status is not None:
            stmt = stmt.where(Application.status == status)
        result = self._session.execute(stmt)
        return result.scalars().all()

    def get_by_email(self, email: str) -> Application | None:
        stmt = select(Application).where(Application.email == email.lower())
        return self._session.execute(stmt).scalar_one_or_none()

    def set_status(self, application_id: UUID, status: ApplicationStatus) -> Application | None:
        instance = self.get(application_id)
        if instance is not None:
            instance.status = status
            self._session.flush()
        return instance

    @staticmethod
    def new_session_for(session: Session) -> "ApplicationRepository":
        return ApplicationRepository(session)
