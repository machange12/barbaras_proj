# ruff: noqa: F821 - SQLAlchemy resolves forward refs at mapper configuration.
from __future__ import annotations

import enum
from uuid import UUID, uuid4

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin


class UserRole(enum.StrEnum):
    member = "member"
    curator = "curator"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"),
        default=UserRole.member,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    comments: Mapped[list[Comment]] = relationship(  # noqa: F821 - forward reference
        back_populates="author",
        cascade="save-update, merge",
    )
    essays: Mapped[list[Essay]] = relationship(  # noqa: F821 - forward reference
        back_populates="author",
        cascade="save-update, merge",
    )
    messages: Mapped[list[Message]] = relationship(  # noqa: F821 - forward reference
        back_populates="author",
        cascade="save-update, merge",
    )
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(  # noqa: F821
        back_populates="user",
        cascade="all, delete-orphan",
    )
