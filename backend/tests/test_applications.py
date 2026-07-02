from app.schemas.applications import ApplicationCreate
from app.services.application_service import ApplicationService


def test_application_submission_accepts_payload(db_session):
    payload = ApplicationCreate(
        name="Ada",
        email="ada@example.org",
        question="What does it mean to read well?",
        intent="I want to join a serious and thoughtful circle.",
    )

    service = ApplicationService(db_session)
    response = service.submit(payload)

    assert response.status == "received"
    assert response.data["name"] == "Ada"
