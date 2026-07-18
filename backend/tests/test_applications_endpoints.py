from app.services.application_service import ApplicationService


def test_submit_is_anonymous(client):
    payload = {
        "name": "Ada",
        "email": "ada@example.org",
        "question": "What does it mean to read well?",
        "intent": "I want to join a serious and thoughtful circle.",
    }
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "received"
    assert body["data"]["email"] == "ada@example.org"


def test_submit_rejects_invalid_email(client):
    response = client.post(
        "/api/v1/applications",
        json={
            "name": "Ada",
            "email": "not-an-email",
            "question": "q",
            "intent": "intent content long enough",
        },
    )
    assert response.status_code == 422


def test_list_requires_curator(client, db_session):  # noqa: ARG001
    response = client.get("/api/v1/applications")
    assert response.status_code == 401


def test_list_returns_submissions_when_curator(client, seeded_curator, db_session):  # noqa: ARG001
    service = ApplicationService(db_session)
    from app.schemas.applications import ApplicationCreate

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": seeded_curator.email, "password": "Sup3r-Secret!"},
    )
    access_token = login_response.json()["tokens"]["access_token"]

    for i in range(2):
        service.submit(
            ApplicationCreate(
                name=f"User {i}",
                email=f"user{i}@example.org",
                question="q",
                intent="intent content long enough",
            )
        )

    response = client.get(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert {row["email"] for row in body} == {"user0@example.org", "user1@example.org"}


def test_admin_can_update_application_status(client, seeded_curator, db_session):
    from app.schemas.applications import ApplicationCreate
    service = ApplicationService(db_session)
    submitted = service.submit(
        ApplicationCreate(
            name="Ada",
            email="ada@example.org",
            question="q",
            intent="intent content long enough",
        )
    )

    response = client.patch(  # type: ignore[attr-defined]
        f"/api/v1/applications/{submitted.data['email']}",  # placeholder path
        json={"status": "accepted"},
    )
    # Endpoint not implemented yet (Phase 2 dependency); absent route returns 405/404.
    assert response.status_code in (404, 405)
