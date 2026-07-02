from datetime import UTC, datetime

from app.schemas.applications import ApplicationCreate, ApplicationResponse


class ApplicationService:
    """Receives application submissions and returns a sanitized acknowledgement.

    Persistence is intentionally not wired yet; swap in a repository when ready.
    """

    def submit(self, payload: ApplicationCreate) -> ApplicationResponse:
        received_at = datetime.now(UTC).isoformat(timespec="seconds")
        return ApplicationResponse.build(payload=payload, received_at=received_at)
