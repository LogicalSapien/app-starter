"""Multi-agent coordinator.

Demonstrates the pipeline pattern: Classifier → Router → Specialist.

Flow:
  1. Classifier agent determines the user's intent (structured output).
  2. Coordinator builds context from the classification.
  3. Assistant agent generates a response using that context + tools.
  4. Combined result is returned to the caller.

To add more specialists, create a new agent module and add a branch
in the ``coordinate`` function.
"""

from __future__ import annotations

import logging

from pydantic import BaseModel

from agents.assistant import assistant
from agents.base import AgentDependencies
from agents.classifier import Classification, classifier

logger = logging.getLogger(__name__)


class CoordinatedResponse(BaseModel):
    """Final response from the multi-agent pipeline."""

    response: str
    classification: Classification
    agent_used: str


async def coordinate(
    message: str,
    user_id: str | None = None,
) -> CoordinatedResponse:
    """Run the multi-agent pipeline: classify → route → respond.

    Args:
        message: The raw user message.
        user_id: Optional user identifier for dependency injection.

    Returns:
        A CoordinatedResponse with the generated answer, the
        classification metadata, and which agent handled it.
    """
    deps = AgentDependencies(user_id=user_id)

    # ── Step 1: Classify ──────────────────────────────────────
    logger.info('Classifying message (user=%s)', user_id)
    classification_result = await classifier.run(message)
    classification = classification_result.data
    logger.info(
        'Classified as intent=%s confidence=%.2f',
        classification.intent,
        classification.confidence,
    )

    # ── Step 2: Route to specialist ───────────────────────────
    # Currently everything goes to the general assistant.
    # To add specialists, branch on classification.intent here:
    #
    #   if classification.intent == 'task':
    #       result = await task_agent.run(prompt, deps=deps)
    #       agent_name = 'task'

    prompt = (
        f'User intent: {classification.intent} '
        f'(confidence: {classification.confidence:.0%})\n'
        f'Summary: {classification.summary}\n\n'
        f'Original message: {message}'
    )

    response_result = await assistant.run(prompt, deps=deps)
    agent_name = 'assistant'

    # ── Step 3: Return combined result ────────────────────────
    return CoordinatedResponse(
        response=response_result.data.content,
        classification=classification,
        agent_used=agent_name,
    )
