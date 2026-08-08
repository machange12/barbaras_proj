from __future__ import annotations

import enum
from uuid import UUID, uuid4

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin


class ApplicationStatus(enum.StrEnum):
    received = "received"
    reviewed = "reviewed"
    accepted = "accepted"
    declined = "declined"


class Application(TimestampMixin, Base):
    __tablename__ = "applications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    question: Mapped[str] = mapped_column(String(500), nullable=False)
    intent: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.received,
        nullable=False,
        index=True,
    )
    curator_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    whatsapp_invite_sent: Mapped[bool] = mapped_column(default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<Application {self.email} status={self.status.value}>"
