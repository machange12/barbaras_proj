from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DatabaseSession, require_curator
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
        whatsapp_invite_sent=application.whatsapp_invite_sent,
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


@router.post("/{application_id}/send-whatsapp", response_model=ApplicationResponse)
def send_whatsapp_invite(
    application_id: UUID,
    service: ApplicationServiceDep,
    _: CurrentUserDep,
) -> ApplicationResponse:
    application = service.get_by_id(application_id)
    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    if application.whatsapp_invite_sent:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="WhatsApp invite was already sent",
        )

    application = service.mark_whatsapp_sent(application_id)
    return _to_response(application)


__all__: list[str] = ["router", "get_application_service"]
