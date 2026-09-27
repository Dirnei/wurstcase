<script lang="ts">
  import { t } from './i18n.svelte'

  const SUPPORT_URL = 'https://ko-fi.com/dirnei'
</script>

<footer>
  <nav aria-label={t('footer.label')}>
    <a href="#impressum">{t('footer.impressum')}</a>
    <a href="#datenschutz">{t('footer.datenschutz')}</a>
  </nav>
  <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{t('footer.support')}</a>
</footer>

<style>
  footer {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px 20px;
    font-size: 0.875rem;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
  }

  a {
    color: var(--text-muted);
  }

  a:hover {
    color: var(--accent);
  }
</style>
