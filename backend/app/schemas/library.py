from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LibraryMaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    author: str | None
    description: str | None
    file_name: str
    file_size_bytes: int
    material_type: str
    created_at: datetime


class LibraryMaterialCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=255)
    author: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
