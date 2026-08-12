from app.core.rate_limit import reset_rate_limits

APPLICATION_PAYLOAD = {
    "name": "Ada Lovelace",
    "email": "ada@example.org",
    "question": "What is the current reading?",
    "intent": "intent content long enough to pass validation",
}
LOGIN_PAYLOAD = {"email": "member@example.org", "password": "wrong-password"}


def test_login_rejected_after_limit(client, seeded_member):
    statuses = [
        client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD).status_code
        for _ in range(11)
    ]
    assert statuses[:10] == [401] * 10
    assert statuses[10] == 429


def test_applications_rejected_after_limit(client, monkeypatch):
    monkeypatch.setattr(
        "app.services.application_service.send_curator_notification",
        lambda **kwargs: False,
    )
    statuses = [
        client.post("/api/v1/applications", json=APPLICATION_PAYLOAD).status_code
        for _ in range(11)
    ]
    assert statuses[:10] == [201] * 10
    assert statuses[10] == 429


def test_scopes_are_independent(client, seeded_member, monkeypatch):
    monkeypatch.setattr(
        "app.services.application_service.send_curator_notification",
        lambda **kwargs: False,
    )
    for _ in range(11):
        client.post("/api/v1/applications", json=APPLICATION_PAYLOAD)

    response = client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)
    assert response.status_code == 401


def test_reset_allows_requests_again(client, monkeypatch):
    monkeypatch.setattr(
        "app.services.application_service.send_curator_notification",
        lambda **kwargs: False,
    )
    for _ in range(10):
        assert client.post("/api/v1/applications", json=APPLICATION_PAYLOAD).status_code == 201
    assert client.post("/api/v1/applications", json=APPLICATION_PAYLOAD).status_code == 429

    reset_rate_limits()

    response = client.post("/api/v1/applications", json=APPLICATION_PAYLOAD)
    assert response.status_code == 201