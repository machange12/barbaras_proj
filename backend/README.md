# The Reading Salon Backend

FastAPI service for the reading society platform.

## Local Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .[dev]
Copy-Item .env.example .env
fastapi dev app/main.py
```

The service exposes:

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

`ready` checks PostgreSQL connectivity using `DATABASE_URL`.

## Migrations

```powershell
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
