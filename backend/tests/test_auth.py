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
