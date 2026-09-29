#!/usr/bin/env bash
# Writes the runtime files into dist/ after the build: legal.json from the LEGAL_* variables (or a
# warning and the placeholders), dev.json from DEV_TOOLS, and CNAME from PAGES_CNAME. The same
# contract the container fills at start-up (docker/40-legal-json.sh, docker/41-dev-json.sh).
# Used by pages.yml (live site) and pr-preview.yml (previews: DEV_TOOLS=true, no PAGES_CNAME).
set -eu
unset_vars=""
for name in LEGAL_NAME LEGAL_STREET LEGAL_POSTAL_CODE LEGAL_CITY LEGAL_COUNTRY LEGAL_EMAIL LEGAL_HOSTING_PROVIDER; do
  if [ -z "${!name:-}" ]; then
    unset_vars="$unset_vars $name"
  fi
done
if [ -z "$unset_vars" ]; then
  # JSON.stringify escapes quotes, backslashes and control characters; umlauts stay UTF-8.
  node -e '
    const { writeFileSync } = require("node:fs")
    const keys = {
      name: "LEGAL_NAME", street: "LEGAL_STREET", postalCode: "LEGAL_POSTAL_CODE",
      city: "LEGAL_CITY", country: "LEGAL_COUNTRY", email: "LEGAL_EMAIL",
      hostingProvider: "LEGAL_HOSTING_PROVIDER",
    }
    const details = Object.fromEntries(Object.entries(keys).map(([key, env]) => [key, process.env[env]]))
    writeFileSync("dist/legal.json", JSON.stringify(details, null, 2) + "\n")
  '
  echo "legal.json written from the LEGAL_* repository variables"
else
  echo "::warning title=Placeholder legal details::The Impressum shows placeholder details because these repository variables are unset:$unset_vars"
fi

if [ "${DEV_TOOLS:-}" = "true" ]; then
  printf '{"enabled":true}\n' > dist/dev.json
  echo "::notice title=Developer page::DEV_TOOLS=true, the developer page is enabled at #dev"
else
  printf '{"enabled":false}\n' > dist/dev.json
fi

if [ -n "${PAGES_CNAME:-}" ]; then
  printf '%s\n' "$PAGES_CNAME" > dist/CNAME
  echo "CNAME written for $PAGES_CNAME"
fi
