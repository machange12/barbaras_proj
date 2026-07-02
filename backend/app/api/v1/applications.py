from typing import Annotated

from fastapi import APIRouter, Depends

from app.schemas.applications import ApplicationCreate, ApplicationResponse
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["applications"])


def get_application_service() -> ApplicationService:
    return ApplicationService()


ApplicationServiceDep = Annotated[ApplicationService, Depends(get_application_service)]


@router.post("", response_model=ApplicationResponse, status_code=201)
def create_application(
    payload: ApplicationCreate,
    service: ApplicationServiceDep,
) -> ApplicationResponse:
    return service.submit(payload)
