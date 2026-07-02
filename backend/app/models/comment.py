# ruff: noqa: F821 - SQLAlchemy resolves forward references via mapper configuration.
from __future__ import annotations

from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin


class Comment(TimestampMixin, Base):
    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    author_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    essay_id: Mapped[UUID] = mapped_column(
        ForeignKey("essays.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    depth: Mapped[int] = mapped_column(default=0, nullable=False)

    author: Mapped[User] = relationship(back_populates="comments")
    essay: Mapped[Essay] = relationship(back_populates="comments")
    parent: Mapped[Comment | None] = relationship(
        remote_side="Comment.id",
        back_populates="replies",
    )
    replies: Mapped[list[Comment]] = relationship(
        back_populates="parent",
    )

    __table_args__ = (
        # Service layer also enforces this; DB constraint is defense in depth.
        {"comment": "Service rejects depth > 1"},
    )
