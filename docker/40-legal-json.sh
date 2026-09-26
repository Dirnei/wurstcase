#!/bin/sh
# Writes the operator details for the Impressum and privacy policy from the LEGAL_* environment
# variables. Runs at every container start (as the unprivileged nginx user), so changed values
# only need the container to be recreated, not the image rebuilt.
set -eu

out_dir=/tmp/legal
placeholders=""

json_escape() {
  # Drop control characters, then escape backslashes and double quotes.
  printf '%s' "$1" | tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

field() {
  key=$1
  var=$2
  value=$(printenv "$var" || true)
  case "$value" in
    "" | *Muster* | *example.com*) placeholders="$placeholders $var" ;;
  esac
  printf '  "%s": "%s"' "$key" "$(json_escape "$value")"
}

mkdir -p "$out_dir"
{
  printf '{\n'
  field name LEGAL_NAME && printf ',\n'
  field street LEGAL_STREET && printf ',\n'
  field postalCode LEGAL_POSTAL_CODE && printf ',\n'
  field city LEGAL_CITY && printf ',\n'
  field country LEGAL_COUNTRY && printf ',\n'
  field email LEGAL_EMAIL && printf ',\n'
  field hostingProvider LEGAL_HOSTING_PROVIDER && printf '\n'
  printf '}\n'
} > "$out_dir/legal.json.tmp"
mv "$out_dir/legal.json.tmp" "$out_dir/legal.json"

if [ -n "$placeholders" ]; then
  echo "$0: WARNING: placeholder or empty legal details in use for:$placeholders (set them in .env, see README)" >&2
fi
