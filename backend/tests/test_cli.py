"""Smoke test for the create-curator Typer command."""
import os

from sqlalchemy import create_engine
from typer.testing import CliRunner

os.environ.setdefault("TESTING", "1")
os.environ.setdefault(
    "JWT_SECRET_KEY", "test-secret-that-is-long-enough-to-pass-validators-1234"
)
os.environ["SALON_CLI_NONINTERACTIVE"] = "1"

from app.cli import app as cli_app  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.database.base import Base  # noqa: E402
from app.database.session import reset_engine_cache  # noqa: E402


def test_create_curator_cli(tmp_path):
    db_path = tmp_path / "cli.db"
    target_url = f"sqlite:///{db_path}"
    os.environ["DATABASE_URL"] = target_url
    get_settings.cache_clear()
    reset_engine_cache()

    engine = create_engine(target_url)
    Base.metadata.create_all(engine)
    engine.dispose()

    runner = CliRunner()
    result = runner.invoke(
        cli_app,
        [
            "--email",
            "admin@example.org",
            "--name",
            "Admin",
            "--password",
            "Str0ng-Pwd!",
        ],
    )
    assert result.exit_code == 0, (
        f"CLI failed: stdout={result.stdout!r} exc={result.exception!r}"
    )

    # Idempotency: second run promotes the same user.
    result2 = runner.invoke(
        cli_app,
        [
            "--email",
            "admin@example.org",
            "--name",
            "Admin",
            "--password",
            "Str0ng-Pwd!",
        ],
    )
    assert result2.exit_code == 0, f"second run: {result2.stdout}"
    assert "promoted" in result2.stdout.lower() or "curator" in result2.stdout.lower()
