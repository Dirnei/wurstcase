# Tasks

## 1. Rename

- [x] 1.1 Set `app.title` to "Wurst Case" in `src/i18n/en.json` and `src/i18n/de.json`; verify `npm test` passes (dictionary parity)
- [x] 1.2 Set the `<title>` in `index.html` to "Wurst Case"; verify `npm run build` produces `dist/index.html` with that title
- [x] 1.3 Update `README.md` (heading and intro, dropping "working title") and the concept doc (title line and the resolved "Final game title" open item), keeping every Leverkas product mention; verify with a search that "Leverkas" only remains as the product
- [x] 1.4 Add the title to the `openspec/config.yaml` project context; verify `openspec validate --specs` still passes

## 2. Logo

- [x] 2.1 Move `logo.svg` to `src/assets/logo.svg`, point the favicon link in `index.html` at it and delete `public/favicon.svg`; verify `npm run build` emits the logo as a fingerprinted file under `dist/assets/` and `dist/index.html` references it
- [x] 2.2 Show the logo next to the title in `Header.svelte` (decorative, empty alt text, since the title text is right beside it); verify `npm run check` passes
- [x] 2.3 Delete the source `logo.png` from the repo root; verify `git status` no longer lists it

## 3. Verification

- [x] 3.1 Run `npm test`, `npm run check` and `npm run build`, then play-check in the browser: header shows the logo and "Wurst Case", the tab shows the logo favicon and "Wurst Case" as title, in English and after switching to German, the counter keeps running, and the header fits at phone width
