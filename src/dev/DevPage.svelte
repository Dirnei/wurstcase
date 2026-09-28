<script lang="ts">
  // The developer page is a tool for the author, so its text is plain English (no i18n).
  import { SPECIES } from '../game/content/animals'
  import { BUILDINGS, CHAINS, type BuildingId } from '../game/content/buildings'
  import { BUYERS, STEP_MARKUP, type BuyerId } from '../game/content/buyers'
  import { PRODUCTS } from '../game/content/resources'
  import { SHELTERS } from '../game/content/shelters'
  import { POPULATION } from '../game/content/town'
  import { getUpgrade, type UnlockClause } from '../game/content/upgrades'
  import {
    animalCurve,
    bulkTable,
    chainSetPayback,
    costCurve,
    demandCeiling,
    MAX_COPIES,
    MAX_SETS,
    paybackCurves,
  } from '../game/balance/curves'
  import { pacingTable } from '../game/balance/milestones'
  import { DEFAULT_SETTINGS, simulate, type SimulationResult } from '../game/balance/simulate'
  import { chainBalance, manualPass } from '../game/balance/value'
  import { translate } from '../i18n/translate'
  import { backToGame } from '../ui/route.svelte'
  import ArtSheet from './ArtSheet.svelte'
  import Chart from './Chart.svelte'

  const name = (key: string) => translate('en', key as Parameters<typeof translate>[1])
  const buildingName = (id: string) => name(`building.${id}`)
  const resourceName = (id: string) => name(`resource.${id}`)

  const euro = (value: number) =>
    `€${value.toLocaleString('en', { maximumFractionDigits: 2 })}`
  const clock = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  const percent = (share: number) => `${(share * 100).toLocaleString('en', { maximumFractionDigits: 1 })}%`

  // ── Simulation ──
  let minutes = $state(DEFAULT_SETTINGS.minutes)
  let clicksPerSecond = $state(DEFAULT_SETTINGS.clicksPerSecond)
  let surplusBuyer = $state<BuyerId>('biogas')
  let running = $state(false)
  let result = $state.raw<SimulationResult | null>(null)
  let runMs = $state(0)

  function run(): void {
    running = true
    // Let the page paint "Running…" before the synchronous simulation blocks it.
    setTimeout(() => {
      const start = performance.now()
      result = simulate({ minutes: Math.max(1, minutes), clicksPerSecond: Math.max(0, clicksPerSecond), surplusBuyer })
      runMs = performance.now() - start
      running = false
    }, 20)
  }
  run()

  const times = $derived(result ? result.samples.map((s) => s.time / 60) : [])
  const pacing = $derived(result ? pacingTable(result.log) : [])
  const upgradeRows = $derived(
    result
      ? result.offers.map((offer) => ({
          ...offer,
          upgrade: getUpgrade(offer.id),
          bought: result!.log.find((p) => p.kind === 'upgrade' && p.id === offer.id)?.time ?? null,
        }))
      : [],
  )

  function conditionText(clause: UnlockClause): string {
    if ('earned' in clause) return `${euro(clause.earned)} earned`
    if ('owned' in clause) return `${clause.atLeast} × ${buildingName(clause.owned)}`
    if ('shelters' in clause) return `${clause.atLeast} × ${clause.shelters}`
    if ('residents' in clause) return `${clause.atLeast} × ${clause.residents === 'any' ? 'residents' : clause.residents}`
    return `${clause.aktionRuns} run ${clause.atLeast} ×`
  }
  const minuteLabel = (m: number) => `${+m.toFixed(1)}m`

  // ── Content-derived curves ──
  let picked = $state<BuildingId>('soybeanField')
  const cost = $derived(costCurve(picked))
  const payback = paybackCurves()
  const copies = Array.from({ length: MAX_COPIES }, (_, i) => i + 1)
  const setPayback = chainSetPayback()
  const setNumbers = Array.from({ length: MAX_SETS }, (_, i) => i + 1)
  const balances = CHAINS.map((chain) => ({ ...chainBalance(chain), manual: manualPass(chain) }))

  const customerSteps = Array.from({ length: 41 }, (_, i) => Math.round(10 * (POPULATION / 10) ** (i / 40)))
  const demand = demandCeiling(customerSteps)
  const demandRows = demandCeiling([10, 100, 1000, 10_000, POPULATION])
  const bulk = bulkTable()

  const animals = SPECIES.map((species) => ({ species, curve: animalCurve(species.id) }))
  const animalCopies = animals[0].curve.map((point) => point.owned)
</script>

<div class="dev">
  <header>
    <h1>Wurst Case: balancing</h1>
    <button type="button" class="game-button" onclick={backToGame}>← Back to the game</button>
    <p class="muted">
      {BUILDINGS.length} buildings · {SPECIES.length} species · {SHELTERS.length} shelters · town
      {POPULATION.toLocaleString('en')}
    </p>
    <p class="muted">
      Price growth per copy:
      {BUILDINGS.map((b) => `${buildingName(b.id)} ×${b.priceGrowth}`).join(' · ')} ·
      {SHELTERS.map((s) => `${name(`shelter.${s.id}`)} ×${s.priceGrowth}`).join(' · ')} ·
      {SPECIES.map((s) => `${name(`animal.${s.id}`)} ×${s.priceGrowth}`).join(' · ')}
    </p>
  </header>

  <section class="panel">
    <h2>Simulated playthrough</h2>
    <form
      onsubmit={(event) => {
        event.preventDefault()
        run()
      }}
    >
      <label>Minutes <input type="number" min="1" max="600" bind:value={minutes} /></label>
      <label>Clicks per second <input type="number" min="0" max="20" step="0.5" bind:value={clicksPerSecond} /></label>
      <label
        >Surplus to <select bind:value={surplusBuyer}>
          <option value="biogas">biogas</option>
          <option value="megaMeat">megaMeat</option>
        </select></label
      >
      <button type="submit" class="game-button" disabled={running}>{running ? 'Running…' : 'Run'}</button>
      {#if result && !running}
        <span class="muted">{result.log.length} purchases · {runMs.toFixed(0)} ms</span>
      {/if}
    </form>

    {#if result}
      <div class="grid">
        <Chart
          title="Money and total earned"
          x={times}
          xLabel="Game time"
          yLabel="€"
          logY
          formatX={minuteLabel}
          series={[
            { label: 'Money', values: result.samples.map((s) => s.money) },
            { label: 'Total earned', values: result.samples.map((s) => s.totalEarned) },
          ]}
        />
        <Chart
          title="Income per second (10 s average)"
          x={times}
          xLabel="Game time"
          yLabel="€/s"
          formatX={minuteLabel}
          series={[{ label: 'Income', values: result.samples.map((s) => s.income) }]}
        />
        <Chart
          title="Customers"
          x={times}
          xLabel="Game time"
          yLabel="Customers"
          formatX={minuteLabel}
          series={[{ label: 'Customers', values: result.samples.map((s) => s.customers) }]}
        />
      </div>

      <h3>Pacing</h3>
      <table>
        <thead><tr><th>Milestone</th><th>Target</th><th>Simulated</th><th>Status</th></tr></thead>
        <tbody>
          {#each pacing as row (row.id)}
            <tr>
              <td>{row.label}</td>
              <td>{row.window[0]}–{row.window[1]} min</td>
              <td class="num">{row.time === null ? '–' : clock(row.time)}</td>
              <td class="status" data-status={row.status}>{row.status}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <h3>Upgrades in this run</h3>
      <p class="muted">Payback is price ÷ the extra income per second at the moment the upgrade went on offer; – for upgrades that do not change income.</p>
      <table>
        <thead><tr><th>Upgrade</th><th>Conditions</th><th>Price</th><th>On offer</th><th>Payback</th><th>Bought</th></tr></thead>
        <tbody>
          {#each upgradeRows as row (row.id)}
            <tr>
              <td>{name(`upgrade.${row.id}.name`)}</td>
              <td>{row.upgrade.when.map(conditionText).join(', ')}</td>
              <td class="num">{euro(row.upgrade.price)}</td>
              <td class="num">{clock(row.time)}</td>
              <td class="num">{row.gain && row.gain > 0 ? `${Math.round(row.upgrade.price / row.gain)} s` : '–'}</td>
              <td class="num">{row.bought === null ? '–' : clock(row.bought)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <details>
        <summary>Purchase log ({result.log.length})</summary>
        <div class="scroll">
          <table>
            <thead><tr><th>Time</th><th>Purchase</th><th>Price</th></tr></thead>
            <tbody>
              {#each result.log as purchase, index (index)}
                <tr>
                  <td class="num">{clock(purchase.time)}</td>
                  <td>
                    {purchase.kind === 'building'
                      ? buildingName(purchase.id)
                      : purchase.kind === 'assistant'
                        ? 'Shop assistant'
                        : purchase.kind === 'upgrade'
                        ? `Upgrade: ${name(`upgrade.${purchase.id}.name`)}`
                        : purchase.kind === 'storeroom'
                        ? 'Storeroom expansion'
                        : `${purchase.kind === 'shelter' ? 'Shelter' : 'Animal'}: ${purchase.id}`}
                  </td>
                  <td class="num">{euro(purchase.price)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </details>
    {/if}
  </section>

  <section class="panel">
    <h2>Cost vs income</h2>
    <label>
      Building
      <select bind:value={picked}>
        {#each BUILDINGS as building (building.id)}
          <option value={building.id}>{buildingName(building.id)}</option>
        {/each}
      </select>
    </label>
    <Chart
      title="{buildingName(picked)}: next price, total spent and income of n copies"
      x={cost.map((p) => p.owned)}
      xLabel="Copies owned"
      yLabel="€ and €/s"
      logY
      series={[
        { label: 'Next price', values: cost.map((p) => p.nextPrice) },
        { label: 'Total spent', values: cost.map((p) => p.spent) },
        { label: 'Income €/s', values: cost.map((p) => p.income) },
      ]}
    />
  </section>

  <section class="panel">
    <h2>Payback</h2>
    <Chart
      title="Seconds for the n-th copy to pay for itself"
      x={copies}
      xLabel="Copy"
      yLabel="Seconds"
      logY
      series={payback.map((curve) => ({ label: buildingName(curve.id), values: curve.seconds }))}
    />
    <Chart
      title="Seconds for the k-th balanced chain set to pay for itself (crossings show when the next chain takes over)"
      x={setNumbers}
      xLabel="Set"
      yLabel="Seconds"
      logY
      series={setPayback.map(({ chain, sets }) => ({ label: name(`chain.${chain}`), values: sets.map((set) => set.seconds) }))}
    />
  </section>

  <section class="panel">
    <h2>Chain balance</h2>
    <table>
      <thead>
        <tr><th>Chain</th><th>Balanced set</th><th>Output</th><th>Income</th><th>By hand</th></tr>
      </thead>
      <tbody>
        {#each balances as balance (balance.chain)}
          <tr>
            <td>{name(`chain.${balance.chain}`)}</td>
            <td>{balance.buildings.map((b) => `${b.count} ${buildingName(b.id)}`).join(' : ')}</td>
            <td class="num">{+balance.output.toFixed(3)} {resourceName(balance.product)}/s</td>
            <td class="num">{euro(balance.income)}/s</td>
            <td class="num">
              {balance.manual.clicks} clicks → {euro(balance.manual.euros)} ({euro(balance.manual.euros / balance.manual.clicks)}/click)
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="panel">
    <h2>Demand ceiling</h2>
    <Chart
      title="Most income per second the customers pay for, if every order is this product (lines differ only by price)"
      x={customerSteps}
      xLabel="Customers"
      yLabel="€/s"
      logX
      logY
      formatX={(value) => value.toLocaleString('en')}
      series={PRODUCTS.map((product) => ({
        label: resourceName(product),
        values: demand.map((point) => point.income[product]),
      }))}
    />
    <table>
      <thead>
        <tr>
          <th>Customers</th>
          {#each PRODUCTS as product (product)}<th>{resourceName(product)} kitchens busy</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each demandRows as row (row.customers)}
          <tr>
            <td class="num">{row.customers.toLocaleString('en')}</td>
            {#each PRODUCTS as product (product)}<td class="num">{+row.kitchens[product].toFixed(1)}</td>{/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="panel">
    <h2>Lebenshof</h2>
    <Chart
      title="Euros per awareness/s of the next animal"
      x={animalCopies}
      xLabel="Animals of the species owned"
      yLabel="€ per 📣/s"
      logY
      series={animals.map(({ species, curve }) => ({
        label: species.id,
        values: curve.map((point) => point.nextPrice / species.awareness),
      }))}
    />
  </section>

  <section class="panel">
    <h2>Bulk buyers</h2>
    <p class="muted">Market value: the product's price, less {percent(STEP_MARKUP)} per processing step still to come.</p>
    <table>
      <thead>
        <tr>
          <th>Resource</th><th>Market value</th>
          {#each BUYERS as buyer (buyer.id)}<th>{buyer.id}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each bulk as row (row.resource)}
          <tr>
            <td>{resourceName(row.resource)}</td>
            <td class="num">{euro(row.marketValue)}</td>
            {#each BUYERS as buyer (buyer.id)}
              {@const offer = row.buyers[buyer.id]}
              <td class="num">{offer ? `${euro(offer.perUnit)} (${percent(offer.share)})` : '–'}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
  <ArtSheet />
</div>

<style>
  .dev {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
  }

  h1 {
    margin: 0;
    font-size: 1.3rem;
  }

  h3 {
    margin: 8px 0 0;
    font-size: 0.95rem;
  }

  p {
    margin: 0;
  }

  .muted {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
  }

  input,
  select {
    font: inherit;
    width: 6em;
    margin-left: 4px;
    padding: 2px 6px;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  select {
    width: auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  table {
    border-collapse: collapse;
    font-size: 0.85rem;
    width: 100%;
  }

  section {
    overflow-x: auto;
  }

  th,
  td {
    text-align: left;
    padding: 3px 8px;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
  }

  .num {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .status[data-status='in window'] {
    color: var(--accent);
  }

  .status[data-status='early'],
  .status[data-status='late'],
  .status[data-status='not reached'] {
    color: var(--danger);
  }

  .scroll {
    max-height: 320px;
    overflow-y: auto;
  }
</style>
