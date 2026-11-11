#!/usr/bin/env bash
set -euo pipefail

URL="${BASE_URL:-http://localhost:3001}/ping"
TIMEOUT="${SERVER_TIMEOUT_SECONDS:-120}"

echo "Waiting for Restful-Booker at $URL (timeout ${TIMEOUT}s)..."
for ((elapsed = 0; elapsed < TIMEOUT; elapsed += 2)); do
  if [ "$(curl --silent --output /dev/null --write-out '%{http_code}' "$URL")" = "201" ]; then
    echo "Restful-Booker is ready after ${elapsed}s"
    exit 0
  fi
  sleep 2
done

echo "Restful-Booker did not become ready within ${TIMEOUT}s" >&2
exit 1
