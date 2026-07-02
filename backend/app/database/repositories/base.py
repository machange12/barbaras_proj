# ruff: noqa: UP046 - Generic[] used instead of PEP 695 syntax for Py3.12 compat.
from collections.abc import Sequence
from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: Session) -> None:
        self._session = session

    def get(self, id_: UUID) -> ModelT | None:
        return self._session.get(self.model, id_)

    def list(self, *, limit: int = 50, offset: int = 0) -> Sequence[ModelT]:
        stmt = self._session.query(self.model).offset(offset).limit(limit)
        return stmt.all()

    def add(self, instance: ModelT) -> ModelT:
        self._session.add(instance)
        self._session.flush()
        return instance

    def delete(self, instance: ModelT) -> None:
        self._session.delete(instance)
        self._session.flush()
