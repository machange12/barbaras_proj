from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, require_curator
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.models import Application, ApplicationStatus, User
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationSummary,
)
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["applications"])


def get_application_service(session: DatabaseSession) -> ApplicationService:
    return ApplicationService(session)


ApplicationServiceDep = Annotated[ApplicationService, Depends(get_application_service)]
CurrentUserDep = Annotated[User, Depends(require_curator)]


def _to_summary(application: Application) -> ApplicationSummary:
    return ApplicationSummary(
        id=str(application.id),
        status=application.status.value,
        received_at=application.created_at,  # type: ignore[arg-type]
        name=application.name,
        email=application.email,
    )


def _to_response(application: Application) -> ApplicationResponse:
    return ApplicationResponse(
        status=application.status.value,
        message="Application stored",
        received_at=application.created_at,  # type: ignore[arg-type]
        data={
            "name": application.name,
            "email": application.email,
            "question": application.question,
            "intent": application.intent,
        },
    )


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    service: ApplicationServiceDep,
    _: Annotated[
        None,
        Depends(
            rate_limit(
                "applications:create",
                limit=get_settings().applications_rate_limit,
                window_seconds=get_settings().applications_rate_window_seconds,
            )
        ),
    ],
) -> ApplicationResponse:
    return service.submit(payload)


@router.get("", response_model=list[ApplicationSummary])
def list_applications(
    service: ApplicationServiceDep,
    _: CurrentUserDep,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status_filter: ApplicationStatus | None = Query(default=None, alias="status"),  # noqa: B008
) -> list[ApplicationSummary]:
    items = service.list_paginated(
        limit=limit,
        offset=offset,
        status=status_filter,
    )
    return [_to_summary(item) for item in items]


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id,
    service: ApplicationServiceDep,
    _: CurrentUserDep,
) -> ApplicationResponse:
    application = service.get_by_id(application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    return _to_response(application)


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: UUID,
    payload: ApplicationStatusUpdate,
    service: ApplicationServiceDep,
    _: CurrentUserDep,
) -> ApplicationResponse:
    try:
        new_status = ApplicationStatus(payload.status)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid application status",
        ) from exc

    application = service.set_status(application_id, new_status)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    return _to_response(application)


__all__: list[str] = ["router", "get_application_service"]
