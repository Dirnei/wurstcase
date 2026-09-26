<script lang="ts">
  import type { Placeholder } from '../legal/document'
  import { de } from '../legal/texts.de'
  import { en } from '../legal/texts.en'
  import { currentLang, t } from './i18n.svelte'
  import { operatorState } from './legal.svelte'
  import { backToGame } from './route.svelte'

  let { page }: { page: 'impressum' | 'datenschutz' } = $props()

  const legal = $derived((currentLang() === 'de' ? de : en)[page])
  const operator = $derived(operatorState())

  $effect(() => {
    void page
    window.scrollTo(0, 0)
  })

  /** Splits text into literal parts and {placeholder} parts. */
  function parts(text: string): { text: string; placeholder?: Placeholder }[] {
    return text
      .split(/(\{\w+\})/)
      .filter((part) => part !== '')
      .map((part) => {
        const match = /^\{(\w+)\}$/.exec(part)
        return match ? { text: part, placeholder: match[1] as Placeholder } : { text: part }
      })
  }
</script>

<article>
  <button type="button" class="back" onclick={backToGame}>← {t('legal.back')}</button>
  <h2>{legal.title}</h2>

  {#if legal.note}
    <p class="note">{legal.note}</p>
  {/if}
  {#if operator.status === 'unavailable'}
    <p class="note" role="alert">{t('legal.unavailable')}</p>
  {:else if operator.status === 'loading'}
    <p class="note">{t('legal.loading')}</p>
  {/if}

  {#each legal.sections as section (section.id)}
    <section>
      <h3>{section.heading}</h3>
      {#each section.paragraphs as paragraph, index (index)}
        <p>
          {#each parts(paragraph) as part, partIndex (partIndex)}
            {#if !part.placeholder}
              {part.text}
            {:else if operator.status !== 'ready'}
              –
            {:else if part.placeholder === 'email'}
              <a href="mailto:{operator.details.email}">{operator.details.email}</a>
            {:else}
              {operator.details[part.placeholder]}
            {/if}
          {/each}
        </p>
      {/each}
    </section>
  {/each}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-wrap: anywhere;
  }

  .back {
    align-self: flex-start;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  h2 {
    margin: 8px 0 0;
  }

  h3 {
    margin: 16px 0 4px;
    font-size: 1.05rem;
  }

  p {
    margin: 0 0 6px;
  }

  .note {
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }

  a {
    color: var(--accent);
  }
</style>
