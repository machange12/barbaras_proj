import re
from html import escape

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_NAME_PATTERN = re.compile(r"^[\w\s\-.,'’]{1,80}$", re.UNICODE)

_MAX_QUESTION_LENGTH = 240
_MAX_INTENT_LENGTH = 2000


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    question: str = Field(min_length=1, max_length=_MAX_QUESTION_LENGTH)
    intent: str = Field(min_length=1, max_length=_MAX_INTENT_LENGTH)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, value: str) -> str:
        if not _NAME_PATTERN.match(value):
            raise ValueError("name contains unsupported characters")
        return value


class ApplicationResponse(BaseModel):
    status: str
    message: str
    received_at: str
    data: dict[str, str]

    @classmethod
    def build(cls, *, payload: ApplicationCreate, received_at: str) -> "ApplicationResponse":
        safe = {
            "name": escape(payload.name.strip()),
            "email": payload.email.lower(),
            "question": escape(payload.question.strip()),
            "intent": escape(payload.intent.strip()),
        }
        return cls(
            status="received",
            message="Application received",
            received_at=received_at,
            data=safe,
        )
