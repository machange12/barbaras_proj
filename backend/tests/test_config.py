from app.core.config import Settings


def test_database_url_rewrites_render_postgres_scheme() -> None:
    settings = Settings(database_url="postgres://salon:salon@localhost:5432/salon")

    assert settings.database_url == "postgresql+psycopg://salon:salon@localhost:5432/salon"


def test_database_url_rewrites_postgresql_scheme_for_psycopg3() -> None:
    settings = Settings(database_url="postgresql://salon:salon@localhost:5432/salon")

    assert settings.database_url == "postgresql+psycopg://salon:salon@localhost:5432/salon"


def test_database_url_keeps_existing_psycopg3_scheme() -> None:
    settings = Settings(database_url="postgresql+psycopg://salon:salon@localhost:5432/salon")

    assert settings.database_url == "postgresql+psycopg://salon:salon@localhost:5432/salon"
