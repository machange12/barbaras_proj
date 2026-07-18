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

# Run migrations then start the server.
# Render and most hosts support a preDeployCommand; this entrypoint
# handles it inline for hosts that do not.
CMD python -c "\
import psycopg, os; \
url = os.environ['DATABASE_URL']; \
url = url.replace('postgresql+psycopg://', 'postgresql://').replace('postgres://', 'postgresql://'); \
conn = psycopg.connect(url); \
conn.autocommit = True; \
cur = conn.cursor(); \
cur.execute('DROP TYPE IF EXISTS user_role CASCADE'); \
cur.execute('DROP TYPE IF EXISTS application_status CASCADE'); \
conn.close(); \
print('Dropped orphaned types')" \
&& alembic upgrade head \
&& uvicorn app.main:app --host 0.0.0.0 --port 8000
