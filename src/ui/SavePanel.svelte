<script lang="ts">
  import { importSave } from '../game/save'
  import { exportCurrentSave, replaceState, startNewGame } from './game.svelte'
  import { t } from './i18n.svelte'

  let mode = $state<'closed' | 'export' | 'import'>('closed')
  let exportText = $state('')
  let importText = $state('')
  let importMessage = $state<'invalid' | 'done' | null>(null)
  let copied = $state(false)
  let newGameStarted = $state(false)
  let exportField = $state<HTMLTextAreaElement>()

  function newGame() {
    if (!confirm(t('save.newGameConfirm'))) {
      return
    }
    startNewGame()
    mode = 'closed'
    newGameStarted = true
  }

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

<section class="panel">
  <div class="row">
    <h2>{t('save.title')}</h2>
    <div class="actions">
      <button type="button" class="game-button" onclick={openExport}>{t('save.export')}</button>
      <button type="button" class="game-button" onclick={openImport}>{t('save.import')}</button>
      <button type="button" class="game-button" onclick={newGame}>{t('save.newGame')}</button>
    </div>
  </div>

  {#if newGameStarted && mode === 'closed'}
    <p role="status">{t('save.newGameDone')}</p>
  {/if}

  {#if mode === 'export'}
    <label for="save-export">{t('save.exportHint')}</label>
    <textarea id="save-export" readonly rows="3" bind:this={exportField} value={exportText}></textarea>
    <div class="actions">
      <button type="button" class="game-button" onclick={copy}>{copied ? t('save.copied') : t('save.copy')}</button>
      <button type="button" class="game-button" onclick={() => (mode = 'closed')}>{t('save.close')}</button>
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
      <button type="button" class="game-button" onclick={load} disabled={importText.trim() === ''}>{t('save.importLoad')}</button>
      <button type="button" class="game-button" onclick={() => (mode = 'closed')}>{t('save.close')}</button>
    </div>
  {/if}
</section>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  textarea {
    width: 100%;
    padding: 8px;
    border: 1.4px solid var(--ink);
    border-radius: var(--radius-sm);
    background: var(--paper-2);
    color: var(--ink);
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
