<script lang="ts">
  import { canSellAll, sellAll } from '../game/systems/sales'
  import { act, readGame } from './game.svelte'
  import { t } from './i18n.svelte'
</script>

<button
  type="button"
  class="game-button"
  title={t('sales.sellAllHint')}
  disabled={!readGame(canSellAll)}
  onclick={() => act(sellAll)}
>
  {t('sales.sellAll')}
</button>
