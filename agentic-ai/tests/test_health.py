"""Tests for health check endpoints."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.fixture
async def client() -> AsyncClient:
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_returns_service_identity(client: AsyncClient) -> None:
    """Root endpoint returns service identity."""
    response = await client.get('/')
    assert response.status_code == 200

    body = response.json()
    assert body['service'] == 'agentic-ai'
    assert body['status'] == 'ok'


@pytest.mark.asyncio
async def test_healthz_returns_healthy(client: AsyncClient) -> None:
    """Healthz endpoint returns healthy status with uptime."""
    response = await client.get('/healthz')
    assert response.status_code == 200

    body = response.json()
    assert body['status'] == 'healthy'
    assert 'uptime_seconds' in body
    assert isinstance(body['uptime_seconds'], (int, float))
    assert body['uptime_seconds'] >= 0
