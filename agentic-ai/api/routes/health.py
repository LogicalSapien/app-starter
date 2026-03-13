"""Health check endpoints."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter

router = APIRouter(tags=['health'])

_start_time = time.monotonic()


@router.get('/')
async def root() -> dict[str, str]:
    """Root endpoint — returns service identity."""
    return {
        'service': 'agentic-ai',
        'status': 'ok',
    }


@router.get('/healthz')
async def healthz() -> dict[str, Any]:
    """Health check endpoint for load balancers and orchestrators."""
    uptime_seconds = round(time.monotonic() - _start_time, 2)
    return {
        'status': 'healthy',
        'uptime_seconds': uptime_seconds,
    }
