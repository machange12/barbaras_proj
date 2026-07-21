from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.deps import DatabaseSession, get_current_user, require_curator
from app.core.config import get_settings
from app.models import User
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    PendingUserResponse,
    RegisterRequest,
    RefreshRequest,
    RefreshResponse,
    TokenPair,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(session: DatabaseSession) -> AuthService:
    return AuthService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
CurrentUserDep = Annotated[User | None, Depends(get_current_user)]
CuratorUserDep = Annotated[User, Depends(require_curator)]


def _to_current_user_response(user: User) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        is_active=user.is_active,
    )


def _to_pending_user_response(user: User) -> PendingUserResponse:
    return PendingUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post("/register", response_model=PendingUserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, session: DatabaseSession) -> PendingUserResponse:
    service = UserService(session)
    try:
        user = service.create_user(
            email=payload.email,
            name=payload.name,
            password=payload.password,
            is_active=False,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return _to_pending_user_response(user)


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


@router.get("/pending-users", response_model=list[PendingUserResponse])
def list_pending_users(
    _: CuratorUserDep,
    session: DatabaseSession,
) -> list[PendingUserResponse]:
    service = UserService(session)
    return [_to_pending_user_response(user) for user in service.list_pending_members()]


@router.post("/pending-users/{user_id}/approve", response_model=PendingUserResponse)
def approve_pending_user(
    user_id: UUID,
    _: CuratorUserDep,
    session: DatabaseSession,
) -> PendingUserResponse:
    service = UserService(session)
    user = service.approve_member(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending user not found")
    return _to_pending_user_response(user)


__all__ = ["router"]
