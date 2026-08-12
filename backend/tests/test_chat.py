from uuid import uuid4

import pytest
from starlette.websockets import WebSocketDisconnect

from app.models import Channel


@pytest.fixture
def channels(db_session):
    foyer = Channel(
        slug="foyer",
        name="Foyer",
        description=None,
        position=1,
        curator_only_posting=False,
    )
    announcements = Channel(
        slug="announcements",
        name="Announcements",
        description=None,
        position=4,
        curator_only_posting=True,
    )
    db_session.add_all([foyer, announcements])
    db_session.commit()
    return {"foyer": foyer, "announcements": announcements}


def _token(client, user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": "Sup3r-Secret!"},
    )
    return response.json()["tokens"]["access_token"]


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_chat_requires_authentication(client, channels):
    response = client.get("/api/v1/chat/channels")
    assert response.status_code == 401


def test_member_lists_channels_in_order(client, seeded_member, channels):
    response = client.get(
        "/api/v1/chat/channels",
        headers=_headers(_token(client, seeded_member)),
    )
    assert response.status_code == 200
    slugs = [channel["slug"] for channel in response.json()]
    assert slugs[:2] == ["foyer", "announcements"]


def test_member_posts_and_reads_messages(client, seeded_member, channels):
    token = _token(client, seeded_member)
    response = client.post(
        f"/api/v1/chat/channels/{channels['foyer'].id}/messages",
        headers=_headers(token),
        json={"body": "Good evening, salon."},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["author_name"] == "Member"
    assert body["author_role"] == "member"
    assert body["body"] == "Good evening, salon."

    history = client.get(
        f"/api/v1/chat/channels/{channels['foyer'].id}/messages",
        headers=_headers(token),
    )
    assert history.status_code == 200
    payload = history.json()
    assert payload["has_more"] is False
    assert [message["body"] for message in payload["items"]] == ["Good evening, salon."]


def test_member_cannot_post_to_curator_channel(client, seeded_member, channels):
    response = client.post(
        f"/api/v1/chat/channels/{channels['announcements'].id}/messages",
        headers=_headers(_token(client, seeded_member)),
        json={"body": "Hello"},
    )
    assert response.status_code == 403


def test_curator_posts_to_announcements(client, seeded_curator, channels):
    response = client.post(
        f"/api/v1/chat/channels/{channels['announcements'].id}/messages",
        headers=_headers(_token(client, seeded_curator)),
        json={"body": "A quiet notice."},
    )
    assert response.status_code == 201


def test_unknown_channel_is_404(client, seeded_member):
    response = client.post(
        f"/api/v1/chat/channels/{uuid4()}/messages",
        headers=_headers(_token(client, seeded_member)),
        json={"body": "Hello"},
    )
    assert response.status_code == 404


def test_empty_message_rejected(client, seeded_member, channels):
    response = client.post(
        f"/api/v1/chat/channels/{channels['foyer'].id}/messages",
        headers=_headers(_token(client, seeded_member)),
        json={"body": "   "},
    )
    assert response.status_code == 422


def _post_message(client, token, channel_id, body):
    return client.post(
        f"/api/v1/chat/channels/{channel_id}/messages",
        headers=_headers(token),
        json={"body": body},
    )


def test_message_pagination(client, seeded_member, channels):
    token = _token(client, seeded_member)
    channel_id = channels["foyer"].id
    for i in range(3):
        _post_message(client, token, channel_id, f"note {i}")

    first = client.get(
        f"/api/v1/chat/channels/{channel_id}/messages?limit=2",
        headers=_headers(token),
    )
    assert first.status_code == 200
    payload = first.json()
    assert payload["has_more"] is True
    assert [message["body"] for message in payload["items"]] == ["note 1", "note 2"]

    before = payload["items"][0]["created_at"]
    second = client.get(
        f"/api/v1/chat/channels/{channel_id}/messages?limit=10&before={before}",
        headers=_headers(token),
    )
    second_payload = second.json()
    assert [message["body"] for message in second_payload["items"]] == ["note 0"]


def test_member_deletes_own_message(client, seeded_member, channels):
    token = _token(client, seeded_member)
    message = _post_message(client, token, channels["foyer"].id, "self note").json()
    response = client.delete(
        f"/api/v1/chat/messages/{message['id']}",
        headers=_headers(token),
    )
    assert response.status_code == 204

    history = client.get(
        f"/api/v1/chat/channels/{channels['foyer'].id}/messages",
        headers=_headers(token),
    )
    assert history.json()["items"] == []


def test_member_cannot_delete_curator_message(client, seeded_member, seeded_curator, channels):
    curator_token = _token(client, seeded_curator)
    message = _post_message(client, curator_token, channels["foyer"].id, "curator note").json()

    response = client.delete(
        f"/api/v1/chat/messages/{message['id']}",
        headers=_headers(_token(client, seeded_member)),
    )
    assert response.status_code == 403


def test_curator_deletes_member_message(client, seeded_curator, seeded_member, channels):
    member_token = _token(client, seeded_member)
    message = _post_message(client, member_token, channels["foyer"].id, "another note").json()

    response = client.delete(
        f"/api/v1/chat/messages/{message['id']}",
        headers=_headers(_token(client, seeded_curator)),
    )
    assert response.status_code == 204


def test_delete_unknown_message_404(client, seeded_member):
    response = client.delete(
        f"/api/v1/chat/messages/{uuid4()}",
        headers=_headers(_token(client, seeded_member)),
    )
    assert response.status_code == 404


def test_websocket_rejects_missing_token(client, channels):
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/api/v1/chat/ws") as ws:
            ws.receive_json()


def _next_event(ws, expected_type):
    while True:
        event = ws.receive_json()
        if event.get("type") == expected_type:
            return event


def test_websocket_broadcasts_message(client, seeded_member, seeded_curator, channels):
    member_token = _token(client, seeded_member)
    curator_token = _token(client, seeded_curator)

    with client.websocket_connect(f"/api/v1/chat/ws?token={member_token}") as member_ws:
        with client.websocket_connect(f"/api/v1/chat/ws?token={curator_token}") as curator_ws:
            _next_event(member_ws, "welcome")
            _next_event(curator_ws, "welcome")

            foyer_id = str(channels["foyer"].id)
            member_ws.send_json({"type": "message", "channel": foyer_id, "body": "hello salon"})

            member_seen = _next_event(member_ws, "message")
            curator_seen = _next_event(curator_ws, "message")
            assert member_seen["channel"] == foyer_id
            assert member_seen["data"]["body"] == "hello salon"
            assert curator_seen["data"]["body"] == "hello salon"


def test_websocket_presence_reports_both_users(client, seeded_member, seeded_curator):
    member_token = _token(client, seeded_member)
    curator_token = _token(client, seeded_curator)

    with client.websocket_connect(f"/api/v1/chat/ws?token={member_token}") as member_ws:
        _next_event(member_ws, "welcome")
        with client.websocket_connect(f"/api/v1/chat/ws?token={curator_token}") as curator_ws:
            _next_event(curator_ws, "welcome")
            names: set[str] | None = None
            for _ in range(5):
                event = _next_event(member_ws, "presence")
                current = {member["name"] for member in event["online"]}
                if current == {"Member", "Curator"}:
                    names = current
                    break
            assert names == {"Member", "Curator"}


def test_websocket_member_cannot_post_to_announcements(client, seeded_member, channels):
    token = _token(client, seeded_member)
    with client.websocket_connect(f"/api/v1/chat/ws?token={token}") as ws:
        _next_event(ws, "welcome")
        ws.send_json(
            {
                "type": "message",
                "channel": str(channels["announcements"].id),
                "body": "Should fail",
            }
        )
        error = _next_event(ws, "error")
        assert "curator" in error["message"].lower()


def test_websocket_delete_broadcasts(client, seeded_member, seeded_curator, channels):
    member_token = _token(client, seeded_member)

    with client.websocket_connect(f"/api/v1/chat/ws?token={member_token}") as member_ws:
        with client.websocket_connect(
            f"/api/v1/chat/ws?token={_token(client, seeded_curator)}"
        ) as curator_ws:
            _next_event(member_ws, "welcome")
            _next_event(curator_ws, "welcome")

            foyer_id = str(channels["foyer"].id)
            member_ws.send_json({"type": "message", "channel": foyer_id, "body": "delete me"})
            created = _next_event(member_ws, "message")["data"]
            _next_event(curator_ws, "message")

            member_ws.send_json({"type": "delete", "message_id": created["id"]})
            deleted_member = _next_event(member_ws, "message_deleted")
            deleted_curator = _next_event(curator_ws, "message_deleted")
            assert deleted_member["message_id"] == created["id"]
            assert deleted_curator["message_id"] == created["id"]