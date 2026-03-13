"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    """Central configuration for the agentic-ai service."""

    anthropic_api_key: str = field(default_factory=lambda: os.getenv('ANTHROPIC_API_KEY', ''))
    openai_api_key: str = field(default_factory=lambda: os.getenv('OPENAI_API_KEY', ''))
    database_url: str = field(default_factory=lambda: os.getenv('DATABASE_URL', ''))
    port: int = field(default_factory=lambda: int(os.getenv('PORT', '8000')))
    host: str = field(default_factory=lambda: os.getenv('HOST', '0.0.0.0'))  # nosec B104
    allowed_origins: list[str] = field(
        default_factory=lambda: [
            o.strip() for o in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',') if o.strip()
        ]
    )
    log_level: str = field(default_factory=lambda: os.getenv('LOG_LEVEL', 'info').lower())
    app_env: str = field(default_factory=lambda: os.getenv('APP_ENV', 'development').lower())

    def validate(self) -> list[str]:
        """Return a list of configuration warnings/errors. Empty list means all good."""
        issues: list[str] = []

        if not self.anthropic_api_key and not self.openai_api_key:
            issues.append(
                'Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set. ' 'At least one AI provider key is required.'
            )

        if not self.database_url:
            issues.append('DATABASE_URL is not set.')

        if self.log_level not in ('debug', 'info', 'warning', 'error', 'critical'):
            issues.append(f"Invalid LOG_LEVEL: {self.log_level}")

        return issues

    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env == 'development'

    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env == 'production'


# Singleton instance
config = Config()
