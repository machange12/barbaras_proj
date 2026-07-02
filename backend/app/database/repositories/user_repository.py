from sqlalchemy import select

from app.database.repositories.base import BaseRepository
from app.models import User


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return self._session.execute(stmt).scalar_one_or_none()
