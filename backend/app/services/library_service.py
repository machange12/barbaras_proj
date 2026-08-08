from collections.abc import Sequence
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.repositories.library_repository import LibraryRepository
from app.models import LibraryMaterial, MaterialType
from app.schemas.library import LibraryMaterialCreate

ALLOWED_EXTENSIONS = {".pdf", ".epub", ".txt", ".md", ".doc", ".docx"}
_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024


def infer_material_type(filename: str) -> MaterialType:
    suffix = Path(filename or "").suffix.lower()
    if suffix == ".pdf":
        return MaterialType.pdf
    if suffix == ".epub":
        return MaterialType.epub
    if suffix in {".txt", ".md"}:
        return MaterialType.text
    return MaterialType.other


class LibraryStorage:
    """Thin disk-backed storage. Swap this class for object storage (S3/R2/Supabase)
    without touching the rest of the service."""

    def __init__(self, root: Path) -> None:
        self._root = root

    def ensure_dir(self) -> None:
        self._root.mkdir(parents=True, exist_ok=True)

    def save(self, stored_name: str, contents: bytes) -> Path:
        self.ensure_dir()
        path = self._root / stored_name
        path.write_bytes(contents)
        return path

    def delete(self, file_path: str) -> None:
        try:
            Path(file_path).unlink(missing_ok=True)
        except OSError:
            pass


class LibraryService:
    def __init__(self, session: Session, upload_dir: str | None = None) -> None:
        self._session = session
        self._repo = LibraryRepository(session)
        root = Path(upload_dir or get_settings().library_upload_dir)
        self._storage = LibraryStorage(root)

    def list_materials(self, *, limit: int = 50, offset: int = 0) -> Sequence[LibraryMaterial]:
        return self._repo.list_all(limit=min(max(limit, 1), 100), offset=max(offset, 0))

    def get_material(self, material_id: UUID) -> LibraryMaterial | None:
        return self._repo.get(material_id)

    async def upload_material(
        self,
        meta: LibraryMaterialCreate,
        file: UploadFile,
        uploaded_by_id: UUID,
    ) -> LibraryMaterial:
        filename = file.filename or "upload"
        contents = await file.read()
        if not contents:
            raise ValueError("Uploaded file is empty")
        if len(contents) > _MAX_FILE_SIZE_BYTES:
            raise ValueError("File exceeds the 50 MB limit")

        stem = Path(filename).stem
        safe_stem = "".join(ch for ch in stem if ch.isalnum() or ch in "._- ").strip() or "file"
        stored_name = f"{uuid4().hex}_{safe_stem}{Path(filename).suffix.lower()}"

        path = self._storage.save(stored_name, contents)
        material = LibraryMaterial(
            title=meta.title,
            author=meta.author,
            description=meta.description,
            file_path=str(path),
            file_name=filename,
            file_size_bytes=len(contents),
            material_type=infer_material_type(filename),
            uploaded_by_id=uploaded_by_id,
        )
        self._repo.add(material)
        self._session.commit()
        return material

    def delete_material(self, material_id: UUID) -> bool:
        material = self._repo.get(material_id)
        if material is None:
            return False
        self._storage.delete(material.file_path)
        self._repo.delete(material)
        self._session.commit()
        return True
