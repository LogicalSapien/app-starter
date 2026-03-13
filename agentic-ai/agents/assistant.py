"""General-purpose assistant agent.

Handles classified user messages with access to tools.
Uses the base agent factory so it inherits shared tools (e.g. get_current_time).
"""

from __future__ import annotations

from agents.base import create_agent

assistant = create_agent(
    system_prompt=(
        'You are a helpful, concise assistant. '
        'Answer questions directly. For tasks, outline clear steps. '
        'For feedback, acknowledge and suggest improvements. '
        'For greetings, respond warmly and offer to help.'
    ),
)
