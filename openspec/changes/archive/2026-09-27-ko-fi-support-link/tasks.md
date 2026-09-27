# Tasks

## 1. Privacy text (tests first)

- [x] 1.1 Extend `src/legal/texts.test.ts`: the DE and EN cookies sections mention Ko-fi and ko-fi.com. Verify the test fails, then add the paragraph from the design to `texts.de.ts` and `texts.en.ts` and verify it passes

## 2. Footer link

- [x] 2.1 Add `footer.support` in DE and EN; verify the dictionary test passes
- [x] 2.2 Add the support link to `Footer.svelte` (`SUPPORT_URL`, `target="_blank"`, `rel="noopener noreferrer"`, outside the legal `nav`, space-between layout that wraps); verify `npm run check` passes

## 3. Verification

- [x] 3.1 Run `npm test`, `npm run check` and `npm run build`, rebuild the container (`docker compose up --build -d`, leave it running), then play-check against it in both languages:
  - the footer shows the Ko-fi link with the right label, next to the legal links
  - at 320 px width the link wraps with no horizontal scrolling
  - clicking opens https://ko-fi.com/dirnei in a new tab and the game keeps running
  - the network log shows no request to ko-fi.com before the click
  - the privacy policy shows the new sentence in DE and EN
