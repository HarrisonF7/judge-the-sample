#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "Installing the pinned app dependencies..."
  npm install
fi
echo "Open http://localhost:5173/ in your browser. Stop the app with Ctrl+C."
npm run dev -- --port 5173 --strictPort
