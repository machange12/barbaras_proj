from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

MAX_MESSAGE_LENGTH = 4000


class ChannelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str
    description: str | None
    position: int
    curator_only_posting: bool


class MessageCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    body: str = Field(min_length=1, max_length=MAX_MESSAGE_LENGTH)


class MessageOut(BaseModel):
    id: UUID
    channel_id: UUID
    author_id: UUID
    author_name: str
    author_role: str
    body: str
    created_at: datetime
    edited_at: datetime | None = None


class MessageList(BaseModel):
    items: list[MessageOut]
    has_more: bool