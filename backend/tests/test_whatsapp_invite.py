from app.models import Application
from app.schemas.applications import ApplicationCreate
from app.services.application_service import ApplicationService


def _curator_token(client, seeded_curator):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seeded_curator.email, "password": "Sup3r-Secret!"},
    )
    return response.json()["tokens"]["access_token"]


def _member_token(client, seeded_member):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": seeded_member.email, "password": "Sup3r-Secret!"},
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


def test_accept_status_and_send_whatsapp(client, seeded_curator, db_session):
    token = _curator_token(client, seeded_curator)
    application = _submit(client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.patch(
        f"/api/v1/applications/{application.id}/status",
        json={"status": "accepted"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert response.json()["whatsapp_invite_sent"] is False

    response = client.post(
        f"/api/v1/applications/{application.id}/send-whatsapp",
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["whatsapp_invite_sent"] is True

    db_session.refresh(application)
    assert application.whatsapp_invite_sent is True


def test_send_whatsapp_twice_is_conflict(client, seeded_curator, db_session):
    token = _curator_token(client, seeded_curator)
    application = _submit(client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    client.patch(
        f"/api/v1/applications/{application.id}/status",
        json={"status": "accepted"},
        headers=headers,
    )
    assert (
        client.post(
            f"/api/v1/applications/{application.id}/send-whatsapp",
            headers=headers,
        ).status_code
        == 200
    )
    assert (
        client.post(
            f"/api/v1/applications/{application.id}/send-whatsapp",
            headers=headers,
        ).status_code
        == 409
    )


def test_send_whatsapp_unknown_application_404(client, seeded_curator):
    from uuid import uuid4

    token = _curator_token(client, seeded_curator)
    response = client.post(
        f"/api/v1/applications/{uuid4()}/send-whatsapp",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_send_whatsapp_requires_curator(client, seeded_member, db_session):
    from uuid import uuid4

    token = _member_token(client, seeded_member)
    application = _submit(client, db_session)
    response = client.post(
        f"/api/v1/applications/{application.id}/send-whatsapp",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert client.post(
        f"/api/v1/applications/{uuid4()}/send-whatsapp",
        headers={"Authorization": f"Bearer {token}"},
    ).status_code == 403


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
    from uuid import uuid4

    token = _curator_token(client, seeded_curator)
    response = client.patch(
        f"/api/v1/applications/{uuid4()}/status",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
