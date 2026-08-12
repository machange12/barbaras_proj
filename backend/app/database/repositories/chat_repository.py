from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select

from app.database.repositories.base import BaseRepository
from app.models import Channel, Message


class ChannelRepository(BaseRepository[Channel]):
    model = Channel

    def list_ordered(self) -> Sequence[Channel]:
        stmt = select(Channel).order_by(Channel.position.asc(), Channel.name.asc())
        return self._session.execute(stmt).scalars().all()

    def get_by_slug(self, slug: str) -> Channel | None:
        stmt = select(Channel).where(Channel.slug == slug)
        return self._session.execute(stmt).scalar_one_or_none()


class MessageRepository(BaseRepository[Message]):
    model = Message

    def list_before(
        self,
        channel_id: UUID,
        *,
        limit: int,
        before: datetime | None = None,
    ) -> Sequence[Message]:
        """Returns the newest `limit` non-deleted messages, newest-first.

        Rows come back descending; callers reverse into ascending order.
        """
        stmt = (
            select(Message)
            .where(Message.channel_id == channel_id)
            .where(Message.deleted_at.is_(None))
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(limit)
        )
        if before is not None:
            stmt = stmt.where(Message.created_at < before)
        return self._session.execute(stmt).scalars().all()

    def soft_delete(self, message: Message, *, at: datetime | None = None) -> Message:
        message.deleted_at = at or datetime.now(UTC)
        self._session.flush()
        return message