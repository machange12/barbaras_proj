from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.repositories.chat_repository import ChannelRepository, MessageRepository
from app.models import Channel, Message, User, UserRole
from app.schemas.chat import MAX_MESSAGE_LENGTH, MessageOut


class ChatService:
    """Persistence and rules for the salon chat."""

    def __init__(self, session: Session) -> None:
        self._session = session
        self._channels = ChannelRepository(session)
        self._messages = MessageRepository(session)

    def list_channels(self) -> Sequence[Channel]:
        return self._channels.list_ordered()

    def get_channel(self, channel_id: UUID) -> Channel | None:
        return self._channels.get(channel_id)

    def list_messages(
        self,
        channel_id: UUID,
        *,
        limit: int = 50,
        before: datetime | None = None,
    ) -> tuple[Sequence[Message], bool]:
        """Returns (oldest→newest messages, has_more)."""
        rows = self._messages.list_before(channel_id, limit=limit + 1, before=before)
        has_more = len(rows) > limit
        rows = list(reversed(rows[:limit]))
        return rows, has_more

    def post_message(self, *, channel: Channel, author: User, body: str) -> Message:
        body = body.strip()
        if not body:
            raise ValueError("Message cannot be empty")
        if len(body) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message exceeds {MAX_MESSAGE_LENGTH} characters")
        if channel.curator_only_posting and author.role is not UserRole.curator:
            raise PermissionError("Only the curator can post in this channel")

        message = Message(
            channel_id=channel.id,
            author_id=author.id,
            body=body,
            created_at=datetime.now(UTC),
        )
        self._messages.add(message)
        self._session.commit()
        return message

    def delete_message(self, message_id: UUID, *, actor: User) -> Message | None:
        message = self._messages.get(message_id)
        if message is None:
            return None
        if message.author_id != actor.id and actor.role is not UserRole.curator:
            raise PermissionError("Only the author or the curator can delete a message")
        self._messages.soft_delete(message)
        self._session.commit()
        return message

    def authors_for(self, messages: Sequence[Message]) -> dict[UUID, User]:
        ids = {message.author_id for message in messages}
        if not ids:
            return {}
        stmt = select(User).where(User.id.in_(ids))
        return {user.id: user for user in self._session.execute(stmt).scalars().all()}

    def to_out(self, message: Message, author: User) -> MessageOut:
        return MessageOut(
            id=message.id,
            channel_id=message.channel_id,
            author_id=message.author_id,
            author_name=author.name,
            author_role=author.role.value,
            body=message.body,
            created_at=message.created_at or datetime.now(UTC),
            edited_at=message.edited_at,
        )