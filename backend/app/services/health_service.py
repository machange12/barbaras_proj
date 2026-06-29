from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.schemas.health import HealthCheckResponse, ReadinessResponse


class HealthService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def live(self) -> HealthCheckResponse:
        return HealthCheckResponse(
            status="ok",
            service=self._settings.app_name,
            environment=self._settings.environment,
        )

    def ready(self, db: Session) -> ReadinessResponse:
        db.execute(text("SELECT 1"))
        return ReadinessResponse(
            status="ok",
            service=self._settings.app_name,
            environment=self._settings.environment,
            database="ok",
        )
