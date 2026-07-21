from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str | None = Field(
        default=None,
        description=(
            "Optional. When the refresh cookie is absent the client can pass the token here."
        ),
    )


class CurrentUserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal["member", "curator"]
    is_active: bool


class PendingUserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal["member", "curator"]
    is_active: bool
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    access_expires_at: datetime
    token_type: Literal["Bearer"] = "Bearer"  # noqa: S105


class LoginResponse(BaseModel):
    user: CurrentUserResponse
    tokens: TokenPair
    # Refresh token is delivered via httpOnly Set-Cookie; this field is intentionally
    # not exposed to keep the cookie the only source for long-lived credentials.


class RefreshResponse(BaseModel):
    user: CurrentUserResponse
    tokens: TokenPair


__all__ = [
    "CurrentUserResponse",
    "LoginRequest",
    "LoginResponse",
    "PendingUserResponse",
    "RegisterRequest",
    "RefreshRequest",
    "RefreshResponse",
    "TokenPair",
]
