#!/bin/sh
# Switches the developer page (#dev) on or off from the DEV_TOOLS environment variable. Runs at
# every container start, so the same image serves dev and live instances. Only exactly "true"
# turns it on.
set -eu

out_dir=/tmp/dev
mkdir -p "$out_dir"

if [ "${DEV_TOOLS:-}" = "true" ]; then
  printf '{"enabled":true}\n' > "$out_dir/dev.json.tmp"
  echo "$0: developer tools enabled at #dev" >&2
else
  printf '{"enabled":false}\n' > "$out_dir/dev.json.tmp"
fi
mv "$out_dir/dev.json.tmp" "$out_dir/dev.json"
