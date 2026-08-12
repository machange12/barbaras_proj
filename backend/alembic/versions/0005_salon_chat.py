"""salon chat channels and messages, drop whatsapp flag

Revision ID: 0005_salon_chat
Revises: 0004_whatsapp_and_library
Create Date: 2026-08-12 00:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision: str = "0005_salon_chat"
down_revision: str | None = "0004_whatsapp_and_library"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SEED_CHANNELS = [
    {
        "slug": "foyer",
        "name": "Foyer",
        "description": "Introductions, greetings, and general salon conversation.",
        "position": 1,
        "curator_only_posting": False,
    },
    {
        "slug": "current-reading",
        "name": "Current Reading",
        "description": "Notes and reflection on the volumes on the shelf.",
        "position": 2,
        "curator_only_posting": False,
    },
    {
        "slug": "debate-hall",
        "name": "Debate Hall",
        "description": "Calm, deliberate disagreement beneath the green lamps.",
        "position": 3,
        "curator_only_posting": False,
    },
    {
        "slug": "announcements",
        "name": "Announcements",
        "description": "Dispatch from the curator's desk. Members read, only the curator writes.",
        "position": 4,
        "curator_only_posting": True,
    },
]


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "channels" not in tables:
        op.create_table(
            "channels",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("slug", sa.String(length=80), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("description", sa.String(length=300), nullable=True),
            sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
            sa.Column(
                "curator_only_posting",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
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
        op.create_index("ix_channels_slug", "channels", ["slug"], unique=True)

        channels_table = sa.table(
            "channels",
            sa.column("id", sa.Uuid()),
            sa.column("slug", sa.String()),
            sa.column("name", sa.String()),
            sa.column("description", sa.String()),
            sa.column("position", sa.Integer()),
            sa.column("curator_only_posting", sa.Boolean()),
        )
        op.bulk_insert(
            channels_table,
            [
                {"id": uuid4(), **row}
                for row in SEED_CHANNELS
            ],
        )

    if "messages" not in tables:
        op.create_table(
            "messages",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("channel_id", sa.Uuid(), nullable=False),
            sa.Column("author_id", sa.Uuid(), nullable=False),
            sa.Column("edited_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
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
            sa.ForeignKeyConstraint(["channel_id"], ["channels.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        )
        op.create_index(
            "ix_messages_channel_created_at",
            "messages",
            ["channel_id", "created_at"],
        )
        op.create_index("ix_messages_deleted_at", "messages", ["deleted_at"])
        op.create_index("ix_messages_channel_id", "messages", ["channel_id"])
        op.create_index("ix_messages_author_id", "messages", ["author_id"])

    if "applications" in tables:
        columns = {column["name"] for column in inspector.get_columns("applications")}
        if "whatsapp_invite_sent" in columns:
            op.drop_column("applications", "whatsapp_invite_sent")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "messages" in tables:
        op.drop_index("ix_messages_channel_created_at", table_name="messages")
        op.drop_index("ix_messages_deleted_at", table_name="messages")
        op.drop_index("ix_messages_channel_id", table_name="messages")
        op.drop_index("ix_messages_author_id", table_name="messages")
        op.drop_table("messages")

    if "channels" in tables:
        op.drop_index("ix_channels_slug", table_name="channels")
        op.drop_table("channels")

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