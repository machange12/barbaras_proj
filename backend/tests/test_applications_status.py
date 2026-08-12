from uuid import uuid4

from app.models import Application
from app.schemas.applications import ApplicationCreate
from app.services.application_service import ApplicationService


def _curator_token(client, seeded_curator):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seeded_curator.email, "password": "Sup3r-Secret!"},
    )
    return response.json()["tokens"]["access_token"]


def _submit(client, db_session, name="Ada"):
    service = ApplicationService(db_session)
    service.submit(
        ApplicationCreate(
            name=name,
            email=f"{name.lower()}@example.org",
            question="q",
            intent="intent content long enough",
        )
    )
    return db_session.query(Application).filter_by(email=f"{name.lower()}@example.org").one()


def test_accept_status(client, seeded_curator, db_session):
    token = _curator_token(client, seeded_curator)
    application = _submit(client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.patch(
        f"/api/v1/applications/{application.id}/status",
        json={"status": "accepted"},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "accepted"
    assert "whatsapp_invite_sent" not in body


def test_accept_status_rejects_invalid_status(client, seeded_curator, db_session):
    token = _curator_token(client, seeded_curator)
    application = _submit(client, db_session)
    response = client.patch(
        f"/api/v1/applications/{application.id}/status",
        json={"status": "enthusiastic"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_accept_status_unknown_application_404(client, seeded_curator):
    token = _curator_token(client, seeded_curator)
    response = client.patch(
        f"/api/v1/applications/{uuid4()}/status",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404