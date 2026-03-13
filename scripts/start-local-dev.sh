#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# start-local-dev.sh — Start API, UI, and AI services for local development
# ─────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PIDS=()

# ── Colors ───────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ── Cleanup on exit ─────────────────────────────────────
cleanup() {
  info "Shutting down services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  ok "All services stopped."
}
trap cleanup EXIT INT TERM

# ── Check prerequisites ─────────────────────────────────
info "Checking prerequisites..."

command -v node  >/dev/null 2>&1 || fail "node is not installed. Install Node.js 20+ from https://nodejs.org"
command -v npm   >/dev/null 2>&1 || fail "npm is not installed."
command -v python3 >/dev/null 2>&1 || fail "python3 is not installed. Install Python 3.11+ from https://python.org"

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  fail "Node.js 20+ required, found v$(node -v)"
fi

ok "Prerequisites satisfied (Node $(node -v), Python $(python3 --version | awk '{print $2}'))"

# ── Detect runner (doppler or .env) ──────────────────────
RUNNER=""
if command -v doppler >/dev/null 2>&1; then
  RUNNER="doppler run --"
  ok "Doppler detected — using doppler for secrets"
else
  warn "Doppler not found — falling back to .env files"
  RUNNER=""
fi

# ── Install dependencies ────────────────────────────────
info "Installing dependencies..."

if [ -f "$ROOT_DIR/api/package.json" ]; then
  info "  -> api/"
  (cd "$ROOT_DIR/api" && npm install --silent) &
fi

if [ -f "$ROOT_DIR/ui/package.json" ]; then
  info "  -> ui/"
  (cd "$ROOT_DIR/ui" && npm install --silent) &
fi

if [ -f "$ROOT_DIR/mobile/package.json" ]; then
  info "  -> mobile/"
  (cd "$ROOT_DIR/mobile" && npm install --silent) &
fi

if [ -f "$ROOT_DIR/agentic-ai/requirements.txt" ]; then
  info "  -> agentic-ai/"
  (cd "$ROOT_DIR/agentic-ai" && python3 -m pip install -r requirements.txt -q) &
fi

wait
ok "Dependencies installed."

# ── Start services ───────────────────────────────────────
echo ""
info "Starting services..."
echo ""

# API (port 3001)
if [ -f "$ROOT_DIR/api/package.json" ]; then
  info "Starting API on http://localhost:3001"
  if [ -n "$RUNNER" ]; then
    (cd "$ROOT_DIR/api" && $RUNNER npm run dev 2>&1 | sed 's/^/  [api] /') &
  else
    (cd "$ROOT_DIR/api" && npm run dev 2>&1 | sed 's/^/  [api] /') &
  fi
  PIDS+=($!)
fi

# UI (port 5173)
if [ -f "$ROOT_DIR/ui/package.json" ]; then
  info "Starting UI  on http://localhost:5173"
  if [ -n "$RUNNER" ]; then
    (cd "$ROOT_DIR/ui" && $RUNNER npm run dev 2>&1 | sed 's/^/  [ui]  /') &
  else
    (cd "$ROOT_DIR/ui" && npm run dev 2>&1 | sed 's/^/  [ui]  /') &
  fi
  PIDS+=($!)
fi

# Agentic AI (port 8000)
if [ -d "$ROOT_DIR/agentic-ai/api" ]; then
  info "Starting AI  on http://localhost:8000"
  if [ -n "$RUNNER" ]; then
    (cd "$ROOT_DIR/agentic-ai" && $RUNNER python3 -m uvicorn api.main:app --reload --port 8000 2>&1 | sed 's/^/  [ai]  /') &
  else
    (cd "$ROOT_DIR/agentic-ai" && python3 -m uvicorn api.main:app --reload --port 8000 2>&1 | sed 's/^/  [ai]  /') &
  fi
  PIDS+=($!)
fi

echo ""
echo "─────────────────────────────────────────────"
echo ""
ok "Services started:"
echo "   API        : http://localhost:3001"
echo "   UI         : http://localhost:5173"
echo "   AI Service : http://localhost:8000"
echo ""
warn "Mobile is not started by this script."
echo "   To start mobile separately:"
echo "   cd mobile && npx expo start"
echo ""
echo "   Press Ctrl+C to stop all services."
echo ""
echo "─────────────────────────────────────────────"

# Wait for all background processes
wait
