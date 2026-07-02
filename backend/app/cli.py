from __future__ import annotations

import os
import sys

import typer

from app.api.deps import set_bootstrap_curator
from app.core.config import get_settings
from app.database.session import _get_session_factory, reset_engine_cache
from app.models import UserRole
from app.services.user_service import UserService

app = typer.Typer(
    help="Operations for The Reading Salon backend.",
    no_args_is_help=True,
    add_completion=False,
)


@app.command()
def create_curator(
    email: str = typer.Option(..., "--email", "-e", help="Email address for the curator."),
    name: str = typer.Option(..., "--name", "-n", help="Display name for the curator."),
    password: str | None = typer.Option(
        None,
        "--password",
        "-p",
        hide_input=True,
        prompt=not os.environ.get("SALON_CLI_NONINTERACTIVE"),
        confirmation_prompt=not os.environ.get("SALON_CLI_NONINTERACTIVE"),
        help="Curator password (prompted if not provided; set SALON_CLI_NONINTERACTIVE=1 to skip).",
    ),
    as_bootstrap: bool = typer.Option(
        True,
        "--bootstrap/--no-bootstrap",
        help="When set, register this curator as the dev bootstrap identity used by backend stubs.",
    ),
) -> None:
    """Create a curator account. Idempotent: if the email exists, the role is updated."""
    reset_engine_cache()
    settings = get_settings()
    if settings.is_production:
        typer.echo("Refusing to manipulate users in production via CLI.", err=True)
        raise typer.Exit(code=1)

    if password is None:
        typer.echo(
            "Provide --password or set SALON_CLI_NONINTERACTIVE=1 with stdin input.",
            err=True,
        )
        raise typer.Exit(code=2)
    factory = _get_session_factory()
    with factory() as session:
        service = UserService(session)
        try:
            existing = service._users.get_by_email(email.lower())
            if existing:
                existing.role = UserRole.curator
                existing.is_active = True
                session.commit()
                typer.echo(f"Existing user {email} promoted to curator.")
            else:
                service.create_user(
                    email=email,
                    name=name,
                    password=password,
                    role=UserRole.curator,
                )
                typer.echo(f"Curator {email} created.")
        except ValueError as error:
            typer.echo(f"Error: {error}", err=True)
            raise typer.Exit(code=1) from error

    if as_bootstrap:
        set_bootstrap_curator(email)
        typer.echo(f"Bootstrap curator set to {email}.")
        typer.echo(
            "Note: the bootstrap seam is for Phase 1 only; Phase 2 replaces it with JWT auth."
        )


def main() -> None:
    app()


if __name__ == "__main__":
    sys.exit(main() or 0)


__all__: list = ["app", "main"]
