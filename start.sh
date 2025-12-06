#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

docker compose up --build

echo "Aplikacja dostępna pod adresem http://localhost:5173 (uruchomiona w trybie foreground, przerwij Ctrl+C)"

