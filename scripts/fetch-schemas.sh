#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <bearer-token>"
  echo "Example: $0 eyJhbGciOiJSUzI1..."
  exit 1
fi

TOKEN="$1"
SCRIPT_DIR="$(dirname "$0")"

node "$SCRIPT_DIR/fetch-schemas.js" "$TOKEN"
