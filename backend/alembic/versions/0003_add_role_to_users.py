"""add role to users

Revision ID: 0003_add_role_to_users
Revises: 0002_refresh_tokens
Create Date: 2026-07-21 00:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0003_add_role_to_users"
down_revision: str | None = "0002_refresh_tokens"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if bind.dialect.name == "postgresql":
        op.execute("""
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('member', 'curator');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        """)
        role_type = postgresql.ENUM(
            "member",
            "curator",
            name="user_role",
            create_type=False,
        )
    else:
        role_type = sa.String(length=20)

    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "role" not in columns:
        op.add_column(
            "users",
            sa.Column("role", role_type, nullable=False, server_default="member"),
        )
        op.execute("UPDATE users SET role = 'curator'")

    indexes = {index["name"] for index in inspector.get_indexes("users")}
    if "ix_users_role" not in indexes:
        op.create_index("ix_users_role", "users", ["role"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "users" not in inspector.get_table_names():
        return

    indexes = {index["name"] for index in inspector.get_indexes("users")}
    if "ix_users_role" in indexes:
        op.drop_index("ix_users_role", table_name="users")

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "role" in columns:
        op.drop_column("users", "role")
