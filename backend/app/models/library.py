# ruff: noqa: F821 - SQLAlchemy resolves forward references at mapper configuration.
from __future__ import annotations

import enum
from uuid import UUID, uuid4

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin


class MaterialType(enum.StrEnum):
    pdf = "pdf"
    epub = "epub"
    text = "text"
    other = "other"


class LibraryMaterial(TimestampMixin, Base):
    __tablename__ = "library_materials"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    material_type: Mapped[MaterialType] = mapped_column(
        SAEnum(MaterialType, name="material_type"),
        default=MaterialType.other,
        nullable=False,
    )
    uploaded_by_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
