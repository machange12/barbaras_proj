"""In-memory sliding-window rate limiting as a FastAPI dependency.

Counters are single-process dictionaries keyed by client IP, which suits this
app's footprint. If the API ever scales to multiple workers, swap the store for
a shared one (e.g. Redis) — the dependency interface stays the same.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from collections.abc import Callable

from fastapi import HTTPException, Request, status


class SlidingWindowStore:
    """Tracks hit timestamps per key within a sliding window."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, *, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        window_start = now - window_seconds
        hits = self._hits[key]

        while hits and hits[0] <= window_start:
            hits.popleft()

        if len(hits) >= limit:
            return False

        hits.append(now)
        return True

    def reset(self, key: str | None = None) -> None:
        if key is None:
            self._hits.clear()
        else:
            self._hits.pop(key, None)


_store = SlidingWindowStore()


def reset_rate_limits(key: str | None = None) -> None:
    """Clear limiter state. Tests reset between cases to keep runs hermetic."""
    _store.reset(key)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client is not None else "unknown"


def rate_limit(
    scope: str,
    *,
    limit: int,
    window_seconds: int,
) -> Callable[[Request], None]:
    """Build a FastAPI dependency that rejects excess requests with HTTP 429."""

    def dependency(request: Request) -> None:
        key = f"{scope}:{_client_ip(request)}"
        if not _store.allow(key, limit=limit, window_seconds=window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again.",
                headers={"Retry-After": str(window_seconds)},
            )

    return dependency


__all__ = ["rate_limit", "reset_rate_limits"]