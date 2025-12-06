#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

docker compose down --volumes --remove-orphans --rmi local

echo "Kontener, obrazy lokalne i wolumeny projektu zostały usunięte."

