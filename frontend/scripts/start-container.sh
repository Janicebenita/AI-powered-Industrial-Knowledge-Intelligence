#!/bin/sh
set -eu
# Model files are public build artifacts, never provider credentials.
if [ "${STAGING_DISPOSABLE:-false}" = "true" ]; then
  export FASTEMBED_CACHE_PATH=/tmp/industrial-brain-models
  mkdir -p "$FASTEMBED_CACHE_PATH"
  cp -a /opt/fastembed/models/. "$FASTEMBED_CACHE_PATH/"
fi
exec npm run start
