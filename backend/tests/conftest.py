"""Test fixtures.

No live Postgres required for the core service unit tests — repositories, services,
and schemas are exercised against an in-memory SQLite database with `Base.metadata.create_all`.

Live-Postgres integration tests (which exercise the SQL dialect) are gated behind
the `REQUIRE_LIVE_POSTGRES` env var; if not set, they are skipped.

Tests that don't need any DB (pydantic schema validation, pure helpers) use no fixture.
"""
from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("TESTING", "1")
os.environ.setdefault(
    "JWT_SECRET_KEY",
    "test-secret-that-is-long-enough-to-pass-validators-1234",
)



def pytest_collection_modifyitems(config, items):
    marker = pytest.mark.skip(
        reason=(
            "Live Postgres not configured. Set REQUIRE_LIVE_POSTGRES=1 "
            "and ensure DATABASE_URL reaches a live Postgres."
        ),
    )
    skip_live = not os.environ.get("REQUIRE_LIVE_POSTGRES") == "1"
    if not skip_live:
        return
    for item in items:
        if "live_postgres" in item.keywords:
            item.add_marker(marker)


@pytest.fixture
def sqlite_memory_engine():
    """Per-test SQLite engine; all tables created via Base.metadata.create_all."""


    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool

    from app import models  # noqa: F401 - register all tables
    from app.core.config import get_settings as _get_settings
    from app.database.base import Base

    settings = _get_settings()
    if not settings.testing:
        pytest.skip("sqlite_memory_engine requires TESTING=1")

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def db_session(sqlite_memory_engine):
    from sqlalchemy.orm import sessionmaker

    SessionLocal = sessionmaker(bind=sqlite_memory_engine, autoflush=False, autocommit=False)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def app(sqlite_memory_engine):
    """Create a FastAPI app whose repository/service layer writes against the SQLite engine."""
    from app.api.deps import get_db as _get_db
    from app.main import create_app

    real_app = create_app()

    from sqlalchemy.orm import sessionmaker

    SessionLocal = sessionmaker(bind=sqlite_memory_engine, autoflush=False, autocommit=False)

    def _override_db():
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    real_app.dependency_overrides[_get_db] = _override_db
    yield real_app


@pytest.fixture
def client(app):
    return TestClient(app)


@pytest.fixture
def seeded_curator(db_session):
    from app.api.deps import set_bootstrap_curator
    from app.services.user_service import UserService

    service = UserService(db_session)
    curator = service.create_user(
        email="curator@example.org",
        name="Curator",
        password="Sup3r-Secret!",  # noqa: S106 - test fixture only
        role="curator",
    )
    set_bootstrap_curator(curator.email)
    db_session.commit()
    return curator


@pytest.fixture
def seeded_member(db_session):
    from app.services.user_service import UserService

    service = UserService(db_session)
    member = service.create_user(
        email="member@example.org",
        name="Member",
        password="Sup3r-Secret!",  # noqa: S106 - test fixture only
        role="member",
        is_active=True,
    )
    db_session.commit()
    return member


@pytest.fixture
def require_live_postgres():
    """Marker alias: tests that need live Postgres opt in via THIS mark."""
    if os.environ.get("REQUIRE_LIVE_POSTGRES") != "1":
        pytest.skip("REQUIRE_LIVE_POSTGRES not set")


# Mark live-postgres tests so they get skipped automatically.
live_postgres = pytest.mark.live_postgres
