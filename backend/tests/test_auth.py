from app.models import UserRole
from app.services.user_service import UserService


def test_login_and_me_endpoints_work_with_bearer_token(client, db_session):
    service = UserService(db_session)
    service.create_user(
        email="curator@example.org",
        name="Curator",
        password="Sup3r-Secret!",  # noqa: S106 - test credential only
        role=UserRole.curator,
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "curator@example.org", "password": "Sup3r-Secret!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "curator@example.org"
    assert body["tokens"]["access_token"]
    assert response.cookies.get("refresh_token")

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['tokens']['access_token']}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "curator@example.org"


def test_curator_route_requires_curator_role(client, db_session):
    service = UserService(db_session)
    service.create_user(
        email="member@example.org",
        name="Member",
        password="Sup3r-Secret!",  # noqa: S106 - test credential only
        role=UserRole.member,
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "member@example.org", "password": "Sup3r-Secret!"},
    )
    access_token = login_response.json()["tokens"]["access_token"]

    response = client.get(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 403


def test_refresh_endpoint_issues_new_access_token(client, db_session):
    service = UserService(db_session)
    service.create_user(
        email="curator@example.org",
        name="Curator",
        password="Sup3r-Secret!",  # noqa: S106 - test credential only
        role=UserRole.curator,
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "curator@example.org", "password": "Sup3r-Secret!"},
    )
    refresh_cookie = login_response.cookies.get("refresh_token")
    assert refresh_cookie

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        cookies={"refresh_token": refresh_cookie},
    )

    assert refresh_response.status_code == 200
    body = refresh_response.json()
    assert body["tokens"]["access_token"]
    assert body["user"]["email"] == "curator@example.org"


def test_member_registration_requires_curator_approval_before_login(client, db_session):
    service = UserService(db_session)
    service.create_user(
        email="curator@example.org",
        name="Curator",
        password="Sup3r-Secret!",  # noqa: S106 - test credential only
        role=UserRole.curator,
    )

    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "reader@example.org",
            "name": "Reader",
            "password": "Sup3r-Secret!",
        },
    )

    assert register_response.status_code == 201
    pending_user = register_response.json()
    assert pending_user["email"] == "reader@example.org"
    assert pending_user["role"] == "member"
    assert pending_user["is_active"] is False

    blocked_login = client.post(
        "/api/v1/auth/login",
        json={"email": "reader@example.org", "password": "Sup3r-Secret!"},
    )
    assert blocked_login.status_code == 401

    curator_login = client.post(
        "/api/v1/auth/login",
        json={"email": "curator@example.org", "password": "Sup3r-Secret!"},
    )
    access_token = curator_login.json()["tokens"]["access_token"]

    pending_response = client.get(
        "/api/v1/auth/pending-users",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert pending_response.status_code == 200
    assert [user["email"] for user in pending_response.json()] == ["reader@example.org"]

    approve_response = client.post(
        f"/api/v1/auth/pending-users/{pending_user['id']}/approve",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert approve_response.status_code == 200
    assert approve_response.json()["is_active"] is True

    approved_login = client.post(
        "/api/v1/auth/login",
        json={"email": "reader@example.org", "password": "Sup3r-Secret!"},
    )
    assert approved_login.status_code == 200
