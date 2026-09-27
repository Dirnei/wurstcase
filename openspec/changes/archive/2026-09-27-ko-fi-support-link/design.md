# Design

## Context

See proposal.md (Why) and the `legal-pages` delta spec. `src/ui/Footer.svelte` is a `<footer>`
with one `<nav aria-label="Rechtliches|Legal">` holding the Impressum and Datenschutz links.
`src/legal/texts.test.ts` checks the privacy sections. The existing requirement "No cookies and no
third-party requests" allows plain outbound links, because a link makes no request until it is
clicked. No `src/game/` files or content entries change.

## Goals / Non-Goals

**Goals:**
- The link is easy to find but quiet. It uses the same muted link style as the legal links, and it
  does not go in the legal `nav`, because it is not a legal link.

**Non-Goals:**
- Tracking clicks, or any Ko-fi asset (see proposal Non-goals).

## Decisions

### Markup and layout

```svelte
<footer>
  <nav aria-label={t('footer.label')}>…legal links…</nav>
  <a class="support" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{t('footer.support')}</a>
</footer>
```

The footer becomes a wrapping flex row with `justify-content: space-between`: legal links on the
left, support link on the right. At 320 px the support link wraps onto its own line. `SUPPORT_URL`
is a constant at the top of `Footer.svelte`. It is the author's link, not operator configuration,
so it does not go in `legal.json`.

`rel="noopener noreferrer"` keeps the new tab from reaching back into the game and sends no
`Referer` to Ko-fi. That matches the privacy text, which promises that nothing is shared before
the click.

Alternative: the official Ko-fi button image or widget script. Rejected because it loads from
ko-fi.com on every page view and breaks the same-origin requirement.

### Text

- `footer.support`: "☕ Unterstütze mich auf Ko-fi" / "☕ Support me on Ko-fi"
- Privacy, cookies section, new paragraph:
  - DE: "Im Fußbereich befindet sich ein Link zu meiner Seite bei Ko-fi (ko-fi.com). Beim
    Anzeigen des Spiels werden keine Daten an Ko-fi übertragen. Erst wenn Sie dem Link folgen,
    verlassen Sie diese Website, und es gilt die Datenschutzerklärung von Ko-fi."
  - EN: "The footer links to my page on Ko-fi (ko-fi.com). No data is sent to Ko-fi while you
    view the game. Only when you follow the link do you leave this website, and Ko-fi's privacy
    policy applies."

## Risks / Trade-offs

- [The privacy text is written in the first person while the operator is configurable] → The
  sentence says "my page". This fits because the operator is the author. If someone else ever
  hosts the game, they can reword the sentence in their own copy of the texts.
