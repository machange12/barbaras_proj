import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

PAYLOAD = {
    "name": "Ada",
    "email": "ada@example.com",
    "question": "What does it mean to read well?",
    "intent": "I want to join a serious and thoughtful circle.",
}


@pytest.fixture
def reset_app_state():
    yield
    # no-op placeholder; future tests may reset DB here


def test_health_live_returns_ok() -> None:
    response = client.get("/api/v1/health/live")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "service" in body and "environment" in body


def test_application_submission_accepts_payload(reset_app_state) -> None:
    response = client.post("/api/v1/applications", json=PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "received"
    assert body["data"]["name"] == "Ada"


def test_application_rejects_invalid_email() -> None:
    bad = PAYLOAD | {"email": "not-an-email"}
    response = client.post("/api/v1/applications", json=bad)
    assert response.status_code == 422


def test_application_rejects_unknown_field() -> None:
    bad = PAYLOAD | {"unexpected": "value"}
    response = client.post("/api/v1/applications", json=bad)
    assert response.status_code == 422


def test_application_rejects_overlong_text() -> None:
    bad = PAYLOAD | {"intent": "x" * 5000}
    response = client.post("/api/v1/applications", json=bad)
    assert response.status_code == 422


def test_application_sanitizes_payload(reset_app_state) -> None:
    malicious = PAYLOAD | {
        "name": "<script>x</script>",
        "email": "ada+tag@example.com",
    }
    response = client.post("/api/v1/applications", json=malicious)
    assert response.status_code in (201, 422)
    if response.status_code == 201:
        body = response.json()
        assert "<script>" not in body["data"]["name"]
