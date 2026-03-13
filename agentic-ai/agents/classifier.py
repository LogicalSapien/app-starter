"""Intent classification agent.

Classifies user messages into structured intents so the coordinator
can route them to the right specialist agent.
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from pydantic_ai import Agent


class Classification(BaseModel):
    """Structured classification of a user message."""

    intent: str = Field(description='One of: question, task, feedback, greeting')
    confidence: float = Field(ge=0.0, le=1.0, description='How confident the classification is')
    summary: str = Field(description='One-sentence summary of the user message')


classifier = Agent(
    'anthropic:claude-sonnet-4-20250514',
    result_type=Classification,
    system_prompt=(
        'You classify user messages. Return exactly one intent from: '
        'question, task, feedback, greeting. '
        'Include a confidence score (0-1) and a brief one-sentence summary.'
    ),
    retries=2,
)
