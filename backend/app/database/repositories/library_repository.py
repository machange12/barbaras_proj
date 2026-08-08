from collections.abc import Sequence

from sqlalchemy import select

from app.database.repositories.base import BaseRepository
from app.models import LibraryMaterial


class LibraryRepository(BaseRepository[LibraryMaterial]):
    model = LibraryMaterial

    def list_all(self, *, limit: int = 50, offset: int = 0) -> Sequence[LibraryMaterial]:
        stmt = (
            select(LibraryMaterial)
            .order_by(LibraryMaterial.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = self._session.execute(stmt)
        return result.scalars().all()
