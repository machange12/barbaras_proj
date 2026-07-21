from sqlalchemy import select

from app.database.repositories.base import BaseRepository
from app.models import User, UserRole


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return self._session.execute(stmt).scalar_one_or_none()

    def list_pending_members(self) -> list[User]:
        stmt = (
            select(User)
            .where(User.role == UserRole.member, User.is_active.is_(False))
            .order_by(User.created_at.desc())
        )
        return list(self._session.execute(stmt).scalars().all())
