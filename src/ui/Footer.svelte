<script lang="ts">
  import { t } from './i18n.svelte'
</script>

<footer>
  <nav aria-label={t('footer.label')}>
    <a href="#impressum">{t('footer.impressum')}</a>
    <a href="#datenschutz">{t('footer.datenschutz')}</a>
  </nav>
</footer>

<style>
  footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    font-size: 0.875rem;
  }

  a {
    color: var(--text-muted);
  }

  a:hover {
    color: var(--accent);
  }
</style>
