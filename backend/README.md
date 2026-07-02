# The Reading Salon — Backend

FastAPI app with SQLAlchemy 2, Pydantic v2, Alembic, and JWT helpers. Phase 1 introduces the persistent data layer and curator bootstrap.

## Prereqs

- Python 3.12+
- Docker + Docker Compose (recommended), or a local Postgres 16+ if you want to skip Docker.

## Setup with Docker (recommended)

```sh
cp .env.example .env             # only if you want to override defaults
docker compose up --build db migrate
docker compose up api
```

The `migrate` service is one-shot and runs `alembic upgrade head`. The `api` service runs uvicorn with `--reload`.

Bootstrap a curator (in another terminal — enter the running `api` service):

```sh
docker compose run --rm api salon -e admin@example.org -n Admin -p 'Str0ng-Pwd!'
```

Or from your local environment against the same Postgres:

```sh
DATABASE_URL=postgresql+psycopg://salon:salon@localhost:5432/salon \
  salon -e admin@example.org -n Admin -p 'Str0ng-Pwd!'
```

## Setup without Docker

If Docker isn't available you can run Postgres locally and operate against it:

```sh
# macOS/Homebrew or your distro's equivalent:
createdb salon
createuser salon --pwprompt   # set password "salon"

cp .env.example .env
salon -e admin@example.org -n Admin -p 'Str0ng-Pwd!'   # creates the curator
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## CLI

```sh
salon --help
salon -e <email> -n <name> -p <password>        # create/promote a curator
SALON_CLI_NONINTERACTIVE=1 salon ...            # skip interactive password prompts
```

## Tests + lint

```sh
pytest -q                          # 10 tests across repository, endpoints, CLI
ruff check .                       # static analysis
```

## API surface

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/health/live` | none | Process liveness |
| GET | `/api/v1/health/ready` | none | DB readiness (degrades gracefully on SQLAlchemy errors) |
| POST | `/api/v1/applications` | none | Submit an application — sanitized echo back |
| GET | `/api/v1/applications` | bootstrap curator (Phase 1) → JWT (Phase 2) | Paginated list |
| GET | `/api/v1/applications/{id}` | curator | Single application |

## Project layout

```
app/
  api/             Routers and FastAPI dependencies (auth stub here in Phase 1)
    deps.py          require_curator / require_role (Phase 2 replaces stub)
    v1/
      applications.py
      health.py
      router.py
  core/            Settings, security (bcrypt + JWT)
  cli.py           `salon` Typer command (create-curator)
  database/        SQLAlchemy session, base, mixins, repositories
  models/          ORM models for Application, User, Essay, Comment
  schemas/         Pydantic v2 request/response models
  services/        ApplicationService, UserService, HealthService
alembic/
  versions/0001_initial.py   Initial schema
docker-compose.yml           Postgres + MailHog + api + migrate
Dockerfile                   Multi-stage backend container
```

## Phase 1 caveats

- `app/api/deps.py` exposes a `set_bootstrap_curator(email)` seam. Phase 1 routes guard the admin endpoints using that boot-time setting; Phase 2 swaps it for a JWT-derived identity and `require_role("curator")`.
- Live Postgres tests are gated behind `REQUIRE_LIVE_POSTGRES=1`; the default suite uses an in-memory SQLite engine through `tests/conftest.py` to keep CI hermetic.
