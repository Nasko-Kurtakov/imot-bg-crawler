#!/usr/bin/env bash
set -euo pipefail

# Print versions
node -v
npm -v

# Start API server (serves Angular dist and API on :3000)
echo "Starting server on :3000 (serving UI + API)..."
exec npm run server --prefix /app/server
