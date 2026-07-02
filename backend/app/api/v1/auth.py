from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.deps import DatabaseSession, get_current_user
from app.core.config import get_settings
from app.models import User
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    TokenPair,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(session: DatabaseSession) -> AuthService:
    return AuthService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
CurrentUserDep = Annotated[User | None, Depends(get_current_user)]


def _to_current_user_response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        is_active=user.is_active,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    service: AuthServiceDep,
) -> LoginResponse:
    user = service.authenticate(email=payload.email, password=payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user, access_token, access_expires_at, refresh_token = service.issue_tokens(
        user,
        user_agent=request.headers.get("user-agent"),
    )

    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24 * 30,
    )
    return LoginResponse(
        user=_to_current_user_response(user),
        tokens=TokenPair(
            access_token=access_token,
            access_expires_at=access_expires_at,
        ),
    )


@router.post("/refresh", response_model=RefreshResponse)
def refresh(
    request: Request,
    response: Response,
    service: AuthServiceDep,
    payload: RefreshRequest | None = None,
) -> RefreshResponse:
    refresh_token_value = (
        payload.refresh_token if payload is not None else None
    ) or request.cookies.get("refresh_token")
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    try:
        user, access_token, access_expires_at, fresh_refresh_token = service.refresh(
            refresh_token_value,
            user_agent=request.headers.get("user-agent"),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=fresh_refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24 * 30,
    )
    return RefreshResponse(
        user=_to_current_user_response(user),
        tokens=TokenPair(
            access_token=access_token,
            access_expires_at=access_expires_at,
        ),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    service: AuthServiceDep,
    current_user: CurrentUserDep,
) -> Response:
    refresh_token_value = request.cookies.get("refresh_token")
    if current_user is not None:
        service.logout(user_id=UUID(str(current_user.id)), refresh_token_value=refresh_token_value)
    else:
        service.logout(refresh_token_value=refresh_token_value)

    response.delete_cookie(key="refresh_token", path="/")
    return response


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> CurrentUserResponse:
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return _to_current_user_response(current_user)


__all__ = ["router"]
