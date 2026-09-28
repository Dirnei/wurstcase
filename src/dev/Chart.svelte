<script lang="ts">
  import uPlot from 'uplot'
  import 'uplot/dist/uPlot.min.css'

  export interface ChartSeries {
    label: string
    values: readonly (number | null)[]
  }

  let {
    title,
    x,
    series,
    xLabel,
    yLabel,
    logX = false,
    logY = false,
    formatX = (value: number) => String(value),
    height = 280,
  }: {
    title: string
    x: readonly number[]
    series: readonly ChartSeries[]
    xLabel: string
    yLabel: string
    logX?: boolean
    logY?: boolean
    formatX?: (value: number) => string
    height?: number
  } = $props()

  // Mid-saturation colours that stay readable on the light and the dark background.
  const PALETTE = ['#4e9a3a', '#d17a22', '#3b7dd8', '#c0417a', '#8a6cd1', '#2aa198', '#b58900', '#cb4b16', '#7a8f99']

  let container: HTMLDivElement
  let plot: uPlot | undefined

  /** Log scales cannot show zero or negative values; those points are left out. */
  const forScale = (values: readonly (number | null)[], log: boolean) =>
    values.map((value) => (value === null || (log && value <= 0) ? null : value))

  function build(): void {
    plot?.destroy()
    const style = getComputedStyle(container)
    const text = style.getPropertyValue('--text-muted').trim() || '#666'
    const grid = style.getPropertyValue('--border').trim() || '#ddd'
    const axis = (label: string, values?: uPlot.Axis['values']): uPlot.Axis => ({
      label,
      stroke: text,
      grid: { stroke: grid, width: 1 },
      ticks: { stroke: grid, width: 1 },
      values,
    })
    const options: uPlot.Options = {
      width: container.clientWidth,
      height,
      scales: {
        x: { time: false, distr: logX ? 3 : 1 },
        y: { distr: logY ? 3 : 1 },
      },
      axes: [
        axis(xLabel, (_, ticks) => ticks.map((tick) => (tick == null ? '' : formatX(tick)))),
        axis(yLabel, (_, ticks) => ticks.map((tick) => (tick == null ? '' : compact(tick)))),
      ],
      series: [
        { label: xLabel, value: (_, value) => (value == null ? '–' : formatX(value)) },
        ...series.map((s, index) => ({
          label: s.label,
          stroke: PALETTE[index % PALETTE.length],
          width: 2,
          value: (_: uPlot, value: number | null) => (value == null ? '–' : compact(value)),
        })),
      ],
      legend: { live: true },
      cursor: { drag: { x: false, y: false } },
    }
    const data = [forScale(x, logX), ...series.map((s) => forScale(s.values, logY))] as uPlot.AlignedData
    plot = new uPlot(options, data, container)
  }

  function compact(value: number): string {
    const abs = Math.abs(value)
    if (abs >= 1e6) return `${+(value / 1e6).toPrecision(3)}M`
    if (abs >= 1e3) return `${+(value / 1e3).toPrecision(3)}K`
    return String(+value.toPrecision(3))
  }

  $effect(() => {
    // Rebuild whenever the data or options change; reading them here subscribes to them.
    void [x, series, logX, logY, xLabel, yLabel, height]
    build()
    const resize = new ResizeObserver(() => plot?.setSize({ width: container.clientWidth, height }))
    resize.observe(container)
    // The theme in effect is on <html>, whether chosen by the player or taken from the system.
    const theme = new MutationObserver(build)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      resize.disconnect()
      theme.disconnect()
      plot?.destroy()
      plot = undefined
    }
  })
</script>

<figure>
  <figcaption>{title}</figcaption>
  <div class="chart" bind:this={container}></div>
</figure>

<style>
  figure {
    margin: 0;
    min-width: 0;
  }

  figcaption {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }

  .chart {
    width: 100%;
    color: var(--text);
  }

  .chart :global(.u-legend) {
    font-size: 0.8rem;
    text-align: left;
  }
</style>
