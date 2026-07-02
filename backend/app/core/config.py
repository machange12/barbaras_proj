from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "The Reading Salon API"
    environment: Literal["local", "test", "staging", "production"] = "local"
    api_v1_prefix: str = "/api/v1"
    backend_cors_origins: list[str] = Field(default_factory=list)

    database_url: str = "sqlite:///./local.db"

    jwt_secret_key: str = ""  # noqa: S105 - configured via env
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "the-reading-salon"
    jwt_audience: str = "the-reading-salon-clients"
    access_token_expire_minutes: int = 60

    bcrypt_max_bytes: int = 72
    request_timeout_seconds: float = 10.0

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


@lru_cache
def get_settings() -> Settings:
    return Settings()
