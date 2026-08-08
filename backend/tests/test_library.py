from pathlib import Path
from uuid import UUID, uuid4

from app.api.v1.library import get_library_service
from app.models import LibraryMaterial
from app.services.library_service import LibraryService


def _token(client, user, password="Sup3r-Secret!"):  # noqa: S107 - test fixture only
    response = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": password},
    )
    return response.json()["tokens"]["access_token"]


def _override_storage(client, db_session, tmp_path):
    client.app.dependency_overrides[get_library_service] = lambda: LibraryService(
        db_session, upload_dir=str(tmp_path)
    )


def test_list_requires_authentication(client):
    assert client.get("/api/v1/library").status_code == 401


def test_member_can_list_empty_library(client, seeded_member):
    token = _token(client, seeded_member)
    response = client.get(
        "/api/v1/library",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_upload_requires_curator(client, seeded_member):
    token = _token(client, seeded_member)
    response = client.post(
        "/api/v1/library",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("a.pdf", b"%PDF", "application/pdf")},
        data={"title": "Nope"},
    )
    assert response.status_code == 403


def test_upload_rejects_unsupported_extension(client, seeded_curator, db_session, tmp_path):
    _override_storage(client, db_session, tmp_path)
    token = _token(client, seeded_curator)
    response = client.post(
        "/api/v1/library",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("malware.exe", b"x", "application/octet-stream")},
        data={"title": "Nope"},
    )
    assert response.status_code == 422


def test_upload_download_and_delete_flow(client, seeded_curator, db_session, tmp_path):
    _override_storage(client, db_session, tmp_path)
    curator_token = _token(client, seeded_curator)
    curator_headers = {"Authorization": f"Bearer {curator_token}"}

    content = b"%PDF-1.4 test content"
    response = client.post(
        "/api/v1/library",
        headers=curator_headers,
        files={"file": ("A Study.pdf", content, "application/pdf")},
        data={
            "title": "A Study",
            "author": "Ada Lovelace",
            "description": "A short note",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "A Study"
    assert body["author"] == "Ada Lovelace"
    assert body["material_type"] == "pdf"
    assert body["file_name"] == "A Study.pdf"
    assert body["file_size_bytes"] == len(content)
    material_id = body["id"]

    stored = db_session.get(LibraryMaterial, UUID(material_id))
    assert stored is not None
    assert Path(stored.file_path).exists()

    list_response = client.get(
        "/api/v1/library",
        headers=curator_headers,
    )
    assert list_response.status_code == 200
    assert [row["id"] for row in list_response.json()] == [material_id]

    download_response = client.get(
        f"/api/v1/library/{material_id}/download",
        headers=curator_headers,
    )
    assert download_response.status_code == 200
    assert download_response.content == content
    assert download_response.headers["content-disposition"].startswith("attachment")

    delete_response = client.delete(
        f"/api/v1/library/{material_id}",
        headers=curator_headers,
    )
    assert delete_response.status_code == 204

    assert (
        client.get(
            f"/api/v1/library/{material_id}/download",
            headers=curator_headers,
        ).status_code
        == 404
    )
    assert (
        client.delete(
            f"/api/v1/library/{material_id}",
            headers=curator_headers,
        ).status_code
        == 404
    )
    assert not Path(stored.file_path).exists()


def test_member_can_download(client, seeded_member, seeded_curator, db_session, tmp_path):
    _override_storage(client, db_session, tmp_path)
    curator_headers = {"Authorization": f"Bearer {_token(client, seeded_curator)}"}

    response = client.post(
        "/api/v1/library",
        headers=curator_headers,
        files={"file": ("notes.md", b"# Notes", "text/markdown")},
        data={"title": "Notes"},
    )
    material_id = response.json()["id"]

    member_headers = {"Authorization": f"Bearer {_token(client, seeded_member)}"}
    assert (
        client.get(
            f"/api/v1/library/{material_id}/download",
            headers=member_headers,
        ).status_code
        == 200
    )
    assert (
        client.delete(
            f"/api/v1/library/{material_id}",
            headers=member_headers,
        ).status_code
        == 403
    )


def test_delete_unknown_material_404(client, seeded_curator, db_session, tmp_path):
    _override_storage(client, db_session, tmp_path)
    token = _token(client, seeded_curator)
    response = client.delete(
        f"/api/v1/library/{uuid4()}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
