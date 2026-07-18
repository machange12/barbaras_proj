from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_database_url(value: str) -> str:
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql+psycopg://", 1)
    if value.startswith("postgresql://") and "+psycopg" not in value:
        return value.replace("postgresql://", "postgresql+psycopg://", 1)
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "The Reading Salon API"
    environment: Literal["local", "test", "staging", "production"] = "local"
    testing: bool = False
    api_v1_prefix: str = "/api/v1"
    backend_cors_origins: list[str] = Field(default_factory=list)

    database_url: str = "postgresql+psycopg://salon:salon@localhost:5432/salon"
    database_pool_size: int = 10
    database_max_overflow: int = 10
    database_pool_recycle: int = 1800
    database_echo: bool = False

    jwt_secret_key: str = ""  # noqa: S105 - configured via env
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "the-reading-salon"
    jwt_audience: str = "the-reading-salon-clients"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 30

    bcrypt_max_bytes: int = 72
    bcrypt_rounds: int = 12

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from_address: str = "salon@example.test"
    smtp_from_name: str = "The Reading Salon"

    initial_curator_email: str = ""
    initial_curator_password: str = ""

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_database_url(cls, value: object) -> object:
        if isinstance(value, str):
            return _normalize_database_url(value)
        return value

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def _split_cors(cls, value: object) -> list[str] | object:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("jwt_secret_key")
    @classmethod
    def _validate_secret(cls, value: str, info) -> str:
        env = info.data.get("environment", "local")
        if env in {"staging", "production"} and len(value.encode("utf-8")) < 32:
            raise ValueError(
                "jwt_secret_key must be at least 32 bytes in staging/production"
            )
        if value.startswith("change-me") and env == "production":
            raise ValueError("jwt_secret_key must not be the default placeholder in production")
        return value

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_testing(self) -> bool:
        return self.testing or self.environment == "test"


@lru_cache
def get_settings() -> Settings:
    return Settings()
