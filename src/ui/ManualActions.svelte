<script lang="ts">
  import { CHAINS } from '../game/content/buildings'
  import { MANUAL_ACTIONS } from '../game/content/manual'
  import { canPerform, isManualUnlocked, performManual } from '../game/systems/manual'
  import { amount } from './amounts'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'

  const groups = $derived(
    readGame((state) =>
      CHAINS.map((chain) => ({
        chain,
        actions: MANUAL_ACTIONS.filter(
          (action) => action.chain === chain && isManualUnlocked(state, action.id),
        ),
      })).filter((group) => group.actions.length > 0),
    ),
  )
</script>

<section class="panel">
  <h2>{t('manual.title')}</h2>
  {#each groups as group (group.chain)}
    <div class="group">
      <h3>{t(`chain.${group.chain}`)}</h3>
      <div class="actions">
        {#each group.actions as action (action.id)}
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
    </div>
  {/each}
</section>

<style>
  .group + .group {
    margin-top: 12px;
  }

  h3 {
    margin: 0 0 6px;
    font-size: 0.95rem;
    font-weight: 600;
  }

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
