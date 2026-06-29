from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.database.session import get_db
from app.schemas.health import HealthCheckResponse, ReadinessResponse
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])

SettingsDependency = Annotated[Settings, Depends(get_settings)]
DatabaseSession = Annotated[Session, Depends(get_db)]


def get_health_service(settings: SettingsDependency) -> HealthService:
    return HealthService(settings)


HealthServiceDependency = Annotated[HealthService, Depends(get_health_service)]


@router.get("/live", response_model=HealthCheckResponse)
def live(service: HealthServiceDependency) -> HealthCheckResponse:
    return service.live()


@router.get("/ready", response_model=ReadinessResponse)
def ready(
    db: DatabaseSession,
    service: HealthServiceDependency,
) -> ReadinessResponse:
    return service.ready(db)
