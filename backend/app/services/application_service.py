from collections.abc import Sequence
from datetime import UTC, datetime
from html import escape

from sqlalchemy.orm import Session

from app.core.security import normalize_email
from app.database.repositories.application_repository import ApplicationRepository
from app.models import Application, ApplicationStatus
from app.schemas.applications import ApplicationCreate, ApplicationResponse
from app.services.notifications import send_curator_notification


class ApplicationService:
    """Persists application submissions and exposes curator lookup helpers."""

    def __init__(self, session: Session) -> None:
        self._session = session
        self._repo = ApplicationRepository(session)

    def submit(self, payload: ApplicationCreate) -> ApplicationResponse:
        application = Application(
            name=escape(payload.name.strip()),
            email=normalize_email(payload.email),
            question=escape(payload.question.strip()),
            intent=escape(payload.intent.strip()),
            status=ApplicationStatus.received,
        )
        self._repo.add(application)
        self._session.commit()
        send_curator_notification(
            subject="New membership application",
            body=(
                f"A new application arrived at The Reading Salon.\n\n"
                f"Name: {application.name}\n"
                f"Email: {application.email}\n\n"
                f"Question: {application.question}\n\n"
                f"Intent: {application.intent}\n\n"
                f"Review it in the curator dashboard."
            ),
        )
        return ApplicationResponse(
            status=application.status.value,
            message="Application stored",
            received_at=application.created_at or datetime.now(UTC),
            data={
                "name": application.name,
                "email": application.email,
                "question": application.question,
                "intent": application.intent,
            },
        )

    def list_paginated(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        status: ApplicationStatus | None = None,
    ) -> Sequence[Application]:
        return self._repo.list_recent(
            status=status,
            limit=min(max(limit, 1), 100),
            offset=max(offset, 0),
        )

    def get_by_id(self, application_id):
        return self._repo.get(application_id)

    def set_status(self, application_id, status: ApplicationStatus) -> Application | None:
        updated = self._repo.set_status(application_id, status)
        if updated is not None:
            self._session.commit()
        return updated
