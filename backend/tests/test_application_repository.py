from app.core.security import normalize_email
from app.models import Application, ApplicationStatus
from app.schemas.applications import ApplicationCreate
from app.services.application_service import ApplicationService


def test_application_submit_persists_row(db_session):
    payload = ApplicationCreate(
        name="Ada",
        email="Ada@Example.com",
        question="What does it mean to read well?",
        intent="I want to join a serious and thoughtful circle.",
    )

    service = ApplicationService(db_session)
    response = service.submit(payload)

    assert response.status == "received"
    assert response.data["email"] == "ada@example.com"

    stored = db_session.query(Application).filter_by(email="ada@example.com").one()
    assert stored.status is ApplicationStatus.received
    assert normalize_email(payload.email) == stored.email


def test_list_paginated_orders_newest_first(db_session):
    service = ApplicationService(db_session)
    for i in range(3):
        payload = ApplicationCreate(
            name=f"User {i}",
            email=f"user{i}@example.org",
            question=f"q {i}",
            intent="intent content long enough",
        )
        service.submit(payload)

    rows = service.list_paginated(limit=10, offset=0)
    assert len(rows) == 3
    # Latest should be user2
    assert rows[0].email == "user2@example.org"
    assert rows[-1].email == "user0@example.org"


def test_list_filtered_by_status(db_session):
    service = ApplicationService(db_session)
    payload = ApplicationCreate(
        name="Ada",
        email="ada@example.org",
        question="q",
        intent="intent content long enough",
    )
    service.submit(payload)
    target = service.list_paginated(limit=10)[0]
    service.set_status(target.id, ApplicationStatus.accepted)

    received_rows = service.list_paginated(limit=10, status=ApplicationStatus.received)
    accepted_rows = service.list_paginated(limit=10, status=ApplicationStatus.accepted)
    assert len(received_rows) == 0
    assert len(accepted_rows) == 1
