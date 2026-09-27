<script lang="ts">
  import { LANGS } from '../i18n/lang'
  import { currentLang, setLanguage, t } from './i18n.svelte'
  import SavePanel from './SavePanel.svelte'

  const SUPPORT_URL = 'https://ko-fi.com/dirnei'
</script>

<h2 class="visually-hidden">{t('tab.einstellungen')}</h2>

<section class="panel">
  <h2 id="settings-language">{t('settings.language')}</h2>
  <div class="language" role="group" aria-labelledby="settings-language">
    {#each LANGS as lang (lang)}
      <button type="button" class="game-button" aria-pressed={currentLang() === lang} onclick={() => setLanguage(lang)}>
        {t(`language.toggle.${lang}`)}
      </button>
    {/each}
  </div>
</section>

<SavePanel />

<section class="panel">
  <h2>{t('footer.label')}</h2>
  <ul>
    <li><a href="#impressum">{t('footer.impressum')}</a></li>
    <li><a href="#datenschutz">{t('footer.datenschutz')}</a></li>
  </ul>
</section>

<section class="panel">
  <h2>{t('settings.support')}</h2>
  <p><a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">{t('footer.support')}</a></p>
</section>

<style>
  .language {
    display: flex;
    gap: 8px;
  }

  .language button {
    min-width: 64px;
    text-align: center;
  }

  .language button[aria-pressed='true'] {
    background: var(--leaf);
    color: var(--on-leaf);
  }

  ul {
    display: flex;
    gap: 8px 20px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  p {
    margin: 0;
  }

  @media (max-width: 767px) {
    ul a,
    p a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
</style>
