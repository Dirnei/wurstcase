<script lang="ts">
  import { LANGS } from '../i18n/lang'
  import { currentLang, setLanguage, t } from './i18n.svelte'
</script>

<header>
  <h1>{t('app.title')}</h1>
  <div class="language" role="group" aria-label={t('language.toggle.label')}>
    {#each LANGS as lang (lang)}
      <button
        type="button"
        aria-pressed={currentLang() === lang}
        onclick={() => setLanguage(lang)}
      >
        {t(`language.toggle.${lang}`)}
      </button>
    {/each}
  </div>
</header>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: var(--accent);
  }

  .language {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  button {
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
