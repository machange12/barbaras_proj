"""whatsapp invite flag and library materials

Revision ID: 0004_whatsapp_and_library
Revises: 0003_add_role_to_users
Create Date: 2026-08-08 00:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0004_whatsapp_and_library"
down_revision: str | None = "0003_add_role_to_users"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if bind.dialect.name == "postgresql":
        op.execute("""
            DO $$ BEGIN
                CREATE TYPE material_type AS ENUM ('pdf', 'epub', 'text', 'other');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        """)
        material_type = postgresql.ENUM(
            "pdf",
            "epub",
            "text",
            "other",
            name="material_type",
            create_type=False,
        )
    else:
        material_type = sa.String(length=20)

    tables = inspector.get_table_names()

    if "applications" in tables:
        columns = {column["name"] for column in inspector.get_columns("applications")}
        if "whatsapp_invite_sent" not in columns:
            op.add_column(
                "applications",
                sa.Column(
                    "whatsapp_invite_sent",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                ),
            )

    if "library_materials" not in tables:
        op.create_table(
            "library_materials",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("author", sa.String(length=200), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("file_path", sa.String(length=500), nullable=False),
            sa.Column("file_name", sa.String(length=255), nullable=False),
            sa.Column(
                "file_size_bytes",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
            sa.Column(
                "material_type",
                material_type,
                nullable=False,
                server_default="other",
            ),
            sa.Column(
                "uploaded_by_id",
                sa.Uuid(),
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
            ),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )
        op.create_index(
            "ix_library_materials_created_at",
            "library_materials",
            ["created_at"],
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    tables = inspector.get_table_names()

    if "library_materials" in tables:
        op.drop_index("ix_library_materials_created_at", table_name="library_materials")
        op.drop_table("library_materials")

    if bind.dialect.name == "postgresql":
        postgresql.ENUM(name="material_type", create_type=False).drop(
            op.get_bind(), checkfirst=True
        )

    if "applications" in tables:
        columns = {column["name"] for column in inspector.get_columns("applications")}
        if "whatsapp_invite_sent" in columns:
            op.drop_column("applications", "whatsapp_invite_sent")
