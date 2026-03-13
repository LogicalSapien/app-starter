"""Base agent scaffold using Pydantic AI."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel
from pydantic_ai import Agent

logger = logging.getLogger(__name__)


class AgentResponse(BaseModel):
    """Standard response model for agent runs."""

    content: str
    metadata: dict[str, Any] = {}


@dataclass
class AgentDependencies:
    """Shared dependencies injected into every agent run.

    Extend this class with database connections, API clients,
    user context, or any other runtime dependencies your agents need.
    """

    user_id: str | None = None
    request_id: str | None = None


def create_agent(
    model: str = 'anthropic:claude-sonnet-4-20250514',
    system_prompt: str = 'You are a helpful assistant.',
    retries: int = 2,
) -> Agent[AgentDependencies, AgentResponse]:
    """Create a pre-configured Pydantic AI agent.

    Args:
        model: The AI model identifier (e.g. 'anthropic:claude-sonnet-4-20250514').
        system_prompt: The system prompt for the agent.
        retries: Number of retries on transient failures.

    Returns:
        A configured Agent instance ready for `.run()` calls.
    """
    agent: Agent[AgentDependencies, AgentResponse] = Agent(
        model=model,
        result_type=AgentResponse,
        system_prompt=system_prompt,
        retries=retries,
        deps_type=AgentDependencies,
    )

    @agent.tool_plain
    async def get_current_time() -> str:
        """Return the current UTC time. Useful as a baseline tool example."""
        from datetime import datetime, timezone

        return datetime.now(timezone.utc).isoformat()

    logger.debug('Created agent with model=%s', model)
    return agent
