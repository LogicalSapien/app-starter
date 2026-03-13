"""Agent interaction endpoints.

Exposes the multi-agent pipeline via HTTP so the Node API or
frontends can call it.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from agents.coordinator import CoordinatedResponse, coordinate

router = APIRouter(prefix='/api/agents', tags=['agents'])


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""

    message: str
    user_id: str | None = None


@router.post('/chat', response_model=CoordinatedResponse)
async def chat(request: ChatRequest) -> CoordinatedResponse:
    """Send a message through the multi-agent pipeline.

    1. Classifier agent determines the intent.
    2. Coordinator routes to the right specialist.
    3. Specialist generates a response.
    """
    return await coordinate(
        message=request.message,
        user_id=request.user_id,
    )
