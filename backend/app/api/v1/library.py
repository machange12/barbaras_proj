from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from app.api.deps import DatabaseSession, require_authenticated, require_curator
from app.models import User
from app.schemas.library import LibraryMaterialCreate, LibraryMaterialOut
from app.services.library_service import ALLOWED_EXTENSIONS, LibraryService

router = APIRouter(prefix="/library", tags=["library"])


def get_library_service(session: DatabaseSession) -> LibraryService:
    return LibraryService(session)


LibraryServiceDep = Annotated[LibraryService, Depends(get_library_service)]
AuthenticatedUserDep = Annotated[User, Depends(require_authenticated)]
CuratorUserDep = Annotated[User, Depends(require_curator)]


def _to_out(material) -> LibraryMaterialOut:
    return LibraryMaterialOut(
        id=material.id,
        title=material.title,
        author=material.author,
        description=material.description,
        file_name=material.file_name,
        file_size_bytes=material.file_size_bytes,
        material_type=material.material_type.value,
        created_at=material.created_at,  # type: ignore[arg-type]
    )


@router.get("", response_model=list[LibraryMaterialOut])
def list_materials(
    service: LibraryServiceDep,
    _: AuthenticatedUserDep,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> list[LibraryMaterialOut]:
    items = service.list_materials(limit=limit, offset=offset)
    return [_to_out(item) for item in items]


@router.post(
    "",
    response_model=LibraryMaterialOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_material(
    service: LibraryServiceDep,
    curator: CuratorUserDep,
    file: UploadFile = File(...),  # noqa: B008 - FastAPI multipart parsing
    title: str = Form(...),  # noqa: B008 - FastAPI multipart parsing
    author: str | None = Form(default=None),  # noqa: B008 - FastAPI multipart parsing
    description: str | None = Form(default=None),  # noqa: B008 - FastAPI multipart parsing
) -> LibraryMaterialOut:
    filename = file.filename or ""
    if Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    meta = LibraryMaterialCreate(title=title, author=author, description=description)
    try:
        material = await service.upload_material(
            meta=meta,
            file=file,
            uploaded_by_id=curator.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    return _to_out(material)


@router.get("/{material_id}/download")
def download_material(
    material_id: UUID,
    service: LibraryServiceDep,
    _: AuthenticatedUserDep,
) -> FileResponse:
    material = service.get_material(material_id)
    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )
    return FileResponse(
        material.file_path,
        media_type="application/octet-stream",
        filename=material.file_name,
    )


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: UUID,
    service: LibraryServiceDep,
    _: CuratorUserDep,
) -> None:
    if not service.delete_material(material_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found",
        )


__all__ = ["router", "get_library_service"]
