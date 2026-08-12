from __future__ import annotations

import asyncio
from collections.abc import Sequence
from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import DatabaseSession, require_authenticated
from app.core.jwt_tokens import TokenError, decode_token, token_type
from app.models import User
from app.schemas.chat import MAX_MESSAGE_LENGTH, ChannelOut, MessageCreate, MessageList, MessageOut
from app.services.chat_service import ChatService
from app.services.user_service import UserService

router = APIRouter(prefix="/chat", tags=["chat"])


def get_chat_service(db: DatabaseSession) -> ChatService:
    return ChatService(db)


ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
AuthenticatedUserDep = Annotated[User, Depends(require_authenticated)]


def _to_channel(channel) -> ChannelOut:
    return ChannelOut.model_validate(channel)


@router.get("/channels", response_model=list[ChannelOut])
def list_channels(
    service: ChatServiceDep,
    _: AuthenticatedUserDep,
) -> list[ChannelOut]:
    return [_to_channel(channel) for channel in service.list_channels()]


@router.get("/channels/{channel_id}/messages", response_model=MessageList)
def list_messages(
    channel_id: UUID,
    service: ChatServiceDep,
    _: AuthenticatedUserDep,
    limit: int = Query(default=50, ge=1, le=100),
    before: datetime | None = Query(default=None),  # noqa: B008
) -> MessageList:
    messages, has_more = service.list_messages(channel_id, limit=limit, before=before)
    authors = service.authors_for(messages)
    items = [service.to_out(message, authors[message.author_id]) for message in messages]
    return MessageList(items=items, has_more=has_more)


@router.post(
    "/channels/{channel_id}/messages",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    channel_id: UUID,
    payload: MessageCreate,
    service: ChatServiceDep,
    user: AuthenticatedUserDep,
) -> MessageOut:
    channel = service.get_channel(channel_id)
    if channel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found")
    try:
        message = service.post_message(channel=channel, author=user, body=payload.body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc

    event = {
        "type": "message",
        "channel": str(channel.id),
        "data": service.to_out(message, user).model_dump(mode="json"),
    }
    await connection_manager.broadcast(event)
    return service.to_out(message, user)


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: UUID,
    service: ChatServiceDep,
    user: AuthenticatedUserDep,
) -> Response:
    try:
        deleted = service.delete_message(message_id, actor=user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    await connection_manager.broadcast(
        {
            "type": "message_deleted",
            "channel": str(deleted.channel_id),
            "message_id": str(deleted.id),
        }
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


class ConnectionManager:
    """Tracks live websocket sessions per user and broadcasts chat events."""

    def __init__(self) -> None:
        self._sessions: dict[UUID, list[WebSocket]] = {}
        self._users: dict[UUID, User] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user: User, websocket: WebSocket) -> None:
        async with self._lock:
            self._sessions.setdefault(user.id, []).append(websocket)
            self._users[user.id] = user

    async def disconnect(self, user: User, websocket: WebSocket) -> None:
        async with self._lock:
            sockets = self._sessions.get(user.id)
            if sockets:
                try:
                    sockets.remove(websocket)
                except ValueError:
                    pass
            if not sockets:
                self._sessions.pop(user.id, None)
                self._users.pop(user.id, None)

    def online_users(self) -> list[User]:
        return list(self._users.values())

    async def broadcast(self, payload: dict) -> None:
        snapshot = [
            (user_id, websocket)
            for user_id, sockets in list(self._sessions.items())
            for websocket in list(sockets)
        ]
        for user_id, websocket in snapshot:
            try:
                await websocket.send_json(payload)
            except Exception:
                user = self._users.get(user_id)
                if user is not None:
                    await self.disconnect(user, websocket)


connection_manager = ConnectionManager()


def _presence_payload(users: Sequence[User]) -> dict:
    return {
        "type": "presence",
        "online": [
            {"user_id": str(user.id), "name": user.name, "role": user.role.value}
            for user in users
        ],
    }


def _parse_message_frame(raw: dict) -> tuple[UUID, str] | None:
    channel_id = raw.get("channel")
    body = raw.get("body")
    if not isinstance(channel_id, str) or not isinstance(body, str):
        return None
    if not channel_id.strip() or not body.strip():
        return None
    if len(body) > MAX_MESSAGE_LENGTH:
        return None
    try:
        return UUID(channel_id), body
    except ValueError:
        return None


def _parse_delete_frame(raw: dict) -> UUID | None:
    message_id = raw.get("message_id")
    if not isinstance(message_id, str) or not message_id.strip():
        return None
    try:
        return UUID(message_id)
    except ValueError:
        return None


async def _authenticate_ws(websocket: WebSocket, db: Session) -> User | None:
    token = websocket.query_params.get("token", "")
    if not token:
        return None
    try:
        payload = decode_token(token)
    except TokenError:
        return None
    if not token_type(payload, "access"):
        return None
    subject = payload.get("sub")
    if not subject:
        return None
    try:
        user_id = UUID(str(subject))
    except ValueError:
        return None
    user = UserService(db).get(user_id)
    if user is None or not user.is_active:
        return None
    return user


@router.websocket("/ws")
async def chat_ws(websocket: WebSocket, db: DatabaseSession) -> None:
    user = await _authenticate_ws(websocket, db)
    if user is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    service = ChatService(db)
    await connection_manager.connect(user, websocket)
    try:
        await websocket.send_json(
            {"type": "welcome", "user": _presence_user(user)}
        )
        await connection_manager.broadcast(_presence_payload(connection_manager.online_users()))

        while True:
            raw = await websocket.receive_json()
            frame = raw.get("type")

            if frame == "message":
                parsed = _parse_message_frame(raw)
                if parsed is None:
                    await websocket.send_json({"type": "error", "message": "Invalid message frame"})
                    continue
                channel_id, body = parsed
                channel = service.get_channel(channel_id)
                if channel is None:
                    await websocket.send_json({"type": "error", "message": "Channel not found"})
                    continue
                try:
                    message = service.post_message(channel=channel, author=user, body=body)
                except (ValueError, PermissionError) as exc:
                    await websocket.send_json({"type": "error", "message": str(exc)})
                    continue
                await connection_manager.broadcast(
                    {
                        "type": "message",
                        "channel": str(channel.id),
                        "data": service.to_out(message, user).model_dump(mode="json"),
                    }
                )
                continue

            if frame == "delete":
                message_id = _parse_delete_frame(raw)
                if message_id is None:
                    await websocket.send_json({"type": "error", "message": "Invalid delete frame"})
                    continue
                try:
                    deleted = service.delete_message(message_id, actor=user)
                except PermissionError as exc:
                    await websocket.send_json({"type": "error", "message": str(exc)})
                    continue
                if deleted is not None:
                    await connection_manager.broadcast(
                        {
                            "type": "message_deleted",
                            "channel": str(deleted.channel_id),
                            "message_id": str(deleted.id),
                        }
                    )
                else:
                    await websocket.send_json({"type": "error", "message": "Message not found"})
                continue

            await websocket.send_json(
                {"type": "error", "message": f"Unknown frame type: {frame!r}"}
            )
    except WebSocketDisconnect:
        pass
    finally:
        await connection_manager.disconnect(user, websocket)
        await connection_manager.broadcast(_presence_payload(connection_manager.online_users()))


def _presence_user(user: User) -> dict:
    return {"user_id": str(user.id), "name": user.name, "role": user.role.value}


__all__ = ["router"]