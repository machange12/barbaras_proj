from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    environment: str


class ReadinessResponse(HealthCheckResponse):
    database: str
