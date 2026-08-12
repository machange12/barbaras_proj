# ruff: noqa: F821 - SQLAlchemy resolves forward references at mapper configuration.
from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin


class Channel(TimestampMixin, Base):
    __tablename__ = "channels"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)
    curator_only_posting: Mapped[bool] = mapped_column(default=False, nullable=False)

    messages: Mapped[list[Message]] = relationship(  # noqa: F821
        back_populates="channel",
        cascade="all, delete-orphan",
    )


class Message(TimestampMixin, Base):
    __tablename__ = "messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    channel_id: Mapped[UUID] = mapped_column(
        ForeignKey("channels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    channel: Mapped[Channel] = relationship(back_populates="messages")
    author: Mapped[User] = relationship(back_populates="messages")  # noqa: F821

    __table_args__ = (
        Index("ix_messages_channel_created_at", "channel_id", "created_at"),
    )