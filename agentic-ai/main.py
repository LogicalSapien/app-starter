"""FastAPI entry point for the agentic-ai service."""

from __future__ import annotations

import logging
import signal
import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.health import router as health_router
from config import config

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle handler."""
    # --- Startup ---
    logging.basicConfig(
        level=getattr(logging, config.log_level.upper(), logging.INFO),
        format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )

    issues = config.validate()
    for issue in issues:
        logger.warning('Config issue: %s', issue)

    logger.info(
        'Starting agentic-ai service (env=%s, host=%s, port=%d)',
        config.app_env,
        config.host,
        config.port,
    )

    yield

    # --- Shutdown ---
    logger.info('Shutting down agentic-ai service')


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title='Agentic AI Service',
        description='AI agent service powered by Pydantic AI',
        version='1.0.0',
        lifespan=lifespan,
        docs_url='/docs' if config.is_development() else None,
        redoc_url='/redoc' if config.is_development() else None,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.allowed_origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    # Routes
    app.include_router(health_router)

    return app


app = create_app()


def _handle_signal(sig: int, _frame: object) -> None:
    """Handle OS signals for graceful shutdown."""
    logger.info('Received signal %s — initiating graceful shutdown', signal.Signals(sig).name)
    sys.exit(0)


if __name__ == '__main__':
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    uvicorn.run(
        'main:app',
        host=config.host,
        port=config.port,
        reload=config.is_development(),
        log_level=config.log_level,
    )
