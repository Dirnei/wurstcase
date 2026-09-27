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
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 16px;
    padding: 0 4px;
    font-size: 0.8rem;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
  }

  a {
    color: var(--ink-muted);
  }

  a:hover {
    color: var(--leaf-text);
  }

  @media (max-width: 767px) {
    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
</style>
