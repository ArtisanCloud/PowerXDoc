#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/../node/setup-usecase-seeds.mjs"

if [[ ! -f "$NODE_SCRIPT" ]]; then
  echo "ERROR: Node seed generator not found at $NODE_SCRIPT" >&2
  exit 1
fi

node "$NODE_SCRIPT" "$@"
