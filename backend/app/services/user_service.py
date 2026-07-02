from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import hash_password, normalize_email, verify_password
from app.database.repositories.user_repository import UserRepository
from app.models import User, UserRole


class UserService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._users = UserRepository(session)

    def create_user(
        self,
        *,
        email: str,
        name: str,
        password: str,
        role: UserRole = UserRole.member,
        bio: str | None = None,
    ) -> User:
        normalized = normalize_email(email)
        if self._users.get_by_email(normalized):
            raise ValueError(f"user with email {normalized!r} already exists")
        user = User(
            email=normalized,
            name=name,
            password_hash=hash_password(password),
            role=role,
            bio=bio,
        )
        self._users.add(user)
        self._session.commit()
        return user

    def authenticate(self, *, email: str, password: str) -> User | None:
        user = self._users.get_by_email(email)
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def get(self, user_id: UUID) -> User | None:
        return self._users.get(user_id)
