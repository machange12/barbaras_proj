from typing import Literal

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.schemas.health import HealthCheckResponse, ReadinessResponse

Status = Literal["ok", "degraded"]


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
        database_status: Status = "ok"
        try:
            db.execute(text("SELECT 1"))
        except SQLAlchemyError:
            database_status = "degraded"

        return ReadinessResponse(
            status=database_status,
            service=self._settings.app_name,
            environment=self._settings.environment,
            database=database_status,
        )
