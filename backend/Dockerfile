FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

RUN pip install --upgrade pip \
    && pip install .

EXPOSE 8000

# Check for orphaned enum types, run migrations, then start the server.
CMD python -c "\
import psycopg, os; \
url = os.environ['DATABASE_URL']; \
url = url.replace('postgresql+psycopg://', 'postgresql://').replace('postgres://', 'postgresql://'); \
conn = psycopg.connect(url); \
conn.autocommit = True; \
cur = conn.cursor(); \
cur.execute(\"SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'\"); \
has_role = cur.fetchone() is not None; \
cur.execute('DROP TYPE IF EXISTS user_role') if not has_role else None; \
cur.execute('DROP TYPE IF EXISTS application_status') if not has_role else None; \
cur.execute('DROP TYPE IF EXISTS material_type') if not has_role else None; \
conn.close(); \
print('Checked orphaned types')" \
    && alembic upgrade head \
    && uvicorn app.main:app --host 0.0.0.0 --port 8000
