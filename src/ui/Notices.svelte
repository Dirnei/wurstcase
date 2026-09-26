<script lang="ts">
  import { currentNotices, dismissNotice } from './game.svelte'
  import { t } from './i18n.svelte'
</script>

{#if currentNotices().length > 0}
  <ul>
    {#each currentNotices() as notice (notice)}
      <li role="status">
        <span>{t(`notice.${notice}`)}</span>
        <button type="button" aria-label={t('notice.dismiss')} onclick={() => dismissNotice(notice)}>×</button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--accent);
    border-radius: 8px;
    background: var(--surface);
  }

  span {
    flex: 1;
  }

  button {
    border: none;
    background: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
  }
</style>
