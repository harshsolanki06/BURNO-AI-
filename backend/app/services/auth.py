"""
EchoVerse AI OS — Auth Service
User creation and authentication logic
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserCreate, UserResponse, Token


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    """Create a new user with hashed password."""
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Look up a user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Verify credentials and return user or None."""
    user = await get_user_by_email(db, email)
    if user is None or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def build_token_response(user: User) -> Token:
    """Build a JWT token response for a user."""
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
        ),
    )
