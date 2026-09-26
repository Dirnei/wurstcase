<script lang="ts">
  import { importSave } from '../game/save'
  import { exportCurrentSave, replaceState } from './game.svelte'
  import { t } from './i18n.svelte'

  let mode = $state<'closed' | 'export' | 'import'>('closed')
  let exportText = $state('')
  let importText = $state('')
  let importMessage = $state<'invalid' | 'done' | null>(null)
  let copied = $state(false)
  let exportField = $state<HTMLTextAreaElement>()

  function openExport() {
    exportText = exportCurrentSave()
    copied = false
    mode = 'export'
  }

  function openImport() {
    importText = ''
    importMessage = null
    mode = 'import'
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(exportText)
      copied = true
    } catch {
      // Clipboard blocked (e.g. insecure context): select the text so the player can copy it.
      exportField?.select()
    }
  }

  function load() {
    const result = importSave(importText)
    if (!result.ok) {
      importMessage = 'invalid'
      return
    }
    if (!confirm(t('save.importConfirm'))) {
      return
    }
    replaceState(result.state)
    importText = ''
    importMessage = 'done'
  }
</script>

<section>
  <div class="row">
    <h2>{t('save.title')}</h2>
    <div class="actions">
      <button type="button" onclick={openExport}>{t('save.export')}</button>
      <button type="button" onclick={openImport}>{t('save.import')}</button>
    </div>
  </div>

  {#if mode === 'export'}
    <label for="save-export">{t('save.exportHint')}</label>
    <textarea id="save-export" readonly rows="3" bind:this={exportField} value={exportText}></textarea>
    <div class="actions">
      <button type="button" onclick={copy}>{copied ? t('save.copied') : t('save.copy')}</button>
      <button type="button" onclick={() => (mode = 'closed')}>{t('save.close')}</button>
    </div>
  {:else if mode === 'import'}
    <label for="save-import">{t('save.importHint')}</label>
    <textarea id="save-import" rows="3" bind:value={importText}></textarea>
    {#if importMessage === 'invalid'}
      <p class="error" role="alert">{t('save.importInvalid')}</p>
    {:else if importMessage === 'done'}
      <p role="status">{t('save.importDone')}</p>
    {/if}
    <div class="actions">
      <button type="button" onclick={load} disabled={importText.trim() === ''}>{t('save.importLoad')}</button>
      <button type="button" onclick={() => (mode = 'closed')}>{t('save.close')}</button>
    </div>
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 400;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  button {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-family: ui-monospace, monospace;
    font-size: 0.8rem;
    resize: vertical;
    word-break: break-all;
  }

  p {
    margin: 0;
  }

  .error {
    color: var(--danger);
  }
</style>
