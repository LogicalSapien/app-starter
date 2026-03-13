"""Tests for the multi-agent chat endpoint.

All agent calls are mocked so these tests run without API keys.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from agents.classifier import Classification
from agents.coordinator import CoordinatedResponse
from main import app

MOCK_RESPONSE = CoordinatedResponse(
    response='The current UTC time is 2024-01-15T12:00:00Z.',
    classification=Classification(
        intent='question',
        confidence=0.95,
        summary='User asked about the current time',
    ),
    agent_used='assistant',
)


@pytest.fixture
async def client():
    """Create an async HTTP client for testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest.mark.asyncio
async def test_chat_returns_coordinated_response(client):
    """POST /api/agents/chat returns classification + response."""
    with patch('api.routes.agents.coordinate', new_callable=AsyncMock, return_value=MOCK_RESPONSE):
        resp = await client.post('/api/agents/chat', json={'message': 'What time is it?'})

    assert resp.status_code == 200
    data = resp.json()
    assert data['classification']['intent'] == 'question'
    assert data['classification']['confidence'] == 0.95
    assert data['agent_used'] == 'assistant'
    assert 'response' in data


@pytest.mark.asyncio
async def test_chat_accepts_optional_user_id(client):
    """POST /api/agents/chat forwards user_id to the coordinator."""
    with patch('api.routes.agents.coordinate', new_callable=AsyncMock, return_value=MOCK_RESPONSE) as mock_coord:
        resp = await client.post(
            '/api/agents/chat',
            json={'message': 'Hello!', 'user_id': 'user-42'},
        )

    assert resp.status_code == 200
    mock_coord.assert_called_once_with(message='Hello!', user_id='user-42')


@pytest.mark.asyncio
async def test_chat_requires_message(client):
    """POST /api/agents/chat returns 422 if message is missing."""
    resp = await client.post('/api/agents/chat', json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_chat_empty_message(client):
    """POST /api/agents/chat accepts an empty string message."""
    with patch('api.routes.agents.coordinate', new_callable=AsyncMock, return_value=MOCK_RESPONSE):
        resp = await client.post('/api/agents/chat', json={'message': ''})

    assert resp.status_code == 200
