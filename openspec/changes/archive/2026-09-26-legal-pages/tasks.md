# Tasks

## 1. Logic (tests first)

- [x] 1.1 Write `src/legal/operator.test.ts` (valid details parse; missing or non-string fields → null; extra fields ignored) and `src/legal/route.test.ts` (`#impressum`, `#datenschutz`, empty, unknown and case variants); verify they fail
- [x] 1.2 Implement `src/legal/operator.ts` and `src/legal/route.ts`; verify the tests pass
- [x] 1.3 Write `src/legal/texts.test.ts`: DE and EN documents have the same section ids and the same `{placeholders}`; the privacy policy has the six required sections; the EN documents carry the "German version is binding" note; verify it fails

## 2. Content

- [x] 2.1 Write the German Impressum and Datenschutzerklärung and the English courtesy translations in `src/legal/texts.de.ts` / `texts.en.ts`, covering every topic in the privacy-policy requirement (browser storage keys named: `vegle.language`, game progress); verify the text tests pass
- [x] 2.2 Add UI strings (footer labels, back link, "details unavailable") to `de.json`/`en.json`; verify the dictionary parity test passes
- [x] 2.3 Add `public/legal.json` with the placeholder defaults; verify `npm run build` copies it to `dist/`

## 3. UI

- [x] 3.1 Implement `src/ui/legal.svelte.ts` (fetch `./legal.json` with `cache: 'no-cache'`, parse, expose loaded / unavailable) and reactive route state from `hashchange`; verify `npm run check` passes
- [x] 3.2 Build `Footer.svelte` and `LegalPage.svelte` (operator placeholders filled, email as `mailto:` link, back link, "details unavailable" fallback) and switch views in `App.svelte`; verify in `npm run dev` that both pages open from the footer and via direct `#` URLs

## 4. Container

- [x] 4.1 Write `docker/40-legal-json.sh` (JSON-escape values, write `/tmp/legal/legal.json`, warn on empty or placeholder values) and add it to the Dockerfile; verify `docker compose up --build -d` logs the placeholder warning with default values
- [x] 4.2 Add the `/legal.json` location (alias, `no-cache`, security headers) and the anonymized `log_format`/`access_log` to `docker/nginx.conf`; verify `curl /legal.json` returns the defaults and the access log shows `…​.0` addresses
- [x] 4.3 Add the `LEGAL_*` variables with placeholder defaults to `compose.yaml`, add `.env` to `.gitignore`, and document `.env` usage in `README.md`; verify `docker compose config` shows the defaults

## 5. Verification

- [x] 5.1 Container checks: recreate with `LEGAL_NAME='Jörg "Tofu" Müller'` and a real-looking email in a temporary `.env` and without rebuilding; verify `legal.json` is valid JSON with the exact name, the name warning is gone, and a page reload shows the new details; then remove the temporary `.env` and recreate with defaults. The container stays running (do not run `docker compose down`)
- [x] 5.2 Run `npm test`, `npm run check` and `npm run build`, then play-check in the browser against the container: footer visible in DE and EN and at 320 px width; both pages open from the footer and via `#impressum` / `#datenschutz`; the back button returns to the game; play time keeps advancing while a legal page is open; with `legal.json` blocked the fallback message shows and the game keeps running; `document.cookie` is empty and every recorded request is same-origin
