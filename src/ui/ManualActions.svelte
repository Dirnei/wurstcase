<script lang="ts">
  import { MANUAL_ACTIONS } from '../game/content/manual'
  import { canPerform, performManual } from '../game/systems/manual'
  import { amount } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
</script>

<section class="panel">
  <h2>{t('manual.title')}</h2>
  <div class="actions">
    {#each MANUAL_ACTIONS as action (action.id)}
      <button
        type="button"
        class="game-button"
        disabled={!readGame((state) => canPerform(state, action.id))}
        onclick={() => act((state) => performManual(state, action.id))}
      >
        <span>{t(`manual.${action.id}`)}</span>
        {#if action.input}
          <small>
            {t('recipe', {
              inAmount: amount(action.input.amount),
              input: t(`resource.${action.input.resource}`),
              outAmount: amount(action.output.amount),
              output: t(`resource.${action.output.resource}`),
            })}
          </small>
        {/if}
      </button>
    {/each}
  </div>
</section>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  button {
    display: flex;
    flex-direction: column;
  }

  small {
    color: var(--text-muted);
  }
</style>
