<script lang="ts">
  // The countryside behind the game view. Anchored at the bottom centre and cropped to fill any screen;
  // day and dusk come from the --art-* tokens, and the sun, moon and stars swap with the colour scheme.
  let { contained = false }: { contained?: boolean } = $props()
  // Unique per instance: the sky gradient takes its colours from where it is defined.
  const uid = $props.id()
  const skyId = `landscape-sky-${uid}`
</script>

<svg
  class="art landscape"
  class:contained
  viewBox="0 0 1600 900"
  preserveAspectRatio="xMidYMax slice"
  aria-hidden="true"
  focusable="false"
>
  <defs>
    <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style:stop-color="var(--art-sky-top)" />
      <stop offset="1" style:stop-color="var(--art-sky-bottom)" />
    </linearGradient>
  </defs>

  <rect class="no-stroke" width="1600" height="900" fill="url(#{skyId})" />

  <g class="stars no-stroke f-moon">
    <circle cx="180" cy="90" r="2.5" /><circle cx="420" cy="170" r="2" /><circle cx="610" cy="60" r="2.5" />
    <circle cx="900" cy="130" r="2" /><circle cx="1180" cy="70" r="2.5" /><circle cx="1450" cy="160" r="2" />
    <circle cx="300" cy="250" r="1.6" /><circle cx="1320" cy="260" r="1.6" /><circle cx="760" cy="220" r="1.6" />
  </g>
  <circle class="sun f-sun" cx="1260" cy="190" r="62" />
  <g class="moon">
    <circle class="f-moon" cx="1260" cy="190" r="54" />
    <circle class="f-moon detail s-tofu-shade" cx="1238" cy="176" r="10" />
    <circle class="f-moon detail s-tofu-shade" cx="1278" cy="214" r="7" />
  </g>

  <g class="part-cloud cloud-1">
    <path class="f-cloud" d="M120 210 q14 -40 60 -30 q24 -34 70 -14 q46 -8 52 32 q30 8 20 28 H112 q-18 -8 8 -16 Z" />
  </g>
  <g class="part-cloud cloud-2">
    <path class="f-cloud" d="M760 130 q12 -32 50 -24 q20 -28 58 -12 q38 -6 44 26 q24 6 16 22 H754 q-14 -6 6 -12 Z" />
  </g>
  <g class="part-cloud cloud-3">
    <path class="f-cloud" d="M1380 300 q10 -26 40 -20 q16 -22 46 -10 q30 -4 36 20 q20 6 12 18 H1374 q-12 -6 6 -8 Z" />
  </g>

  <!-- Far hill with fields. -->
  <path class="f-hill-1" d="M0 600 Q260 470 560 560 T1100 540 T1600 560 V900 H0 Z" />
  <path class="f-field-1" d="M620 560 Q760 520 900 548 L920 610 Q770 590 640 620 Z" />
  <path class="detail thin s-soil-dark" d="M650 580 Q770 552 905 575 M660 600 Q775 575 912 595" />
  <path class="f-field-2" d="M180 560 Q300 520 430 540 L450 600 Q320 585 200 612 Z" />
  <path class="detail thin s-leaf-dark" d="M200 575 Q310 545 437 560 M210 595 Q320 570 445 582" />

  <!-- Trees. -->
  <g>
    <path class="f-soil" d="M1452 560 V600 H1464 V560" />
    <path class="f-leaf" d="M1458 480 Q1420 490 1422 530 Q1410 566 1458 568 Q1506 566 1494 530 Q1496 490 1458 480 Z" />
    <path class="f-soil" d="M96 600 V640 H106 V600" />
    <path class="f-leaf-dark" d="M101 530 Q70 538 72 572 Q62 604 101 606 Q140 604 130 572 Q132 538 101 530 Z" />
  </g>

  <!-- The farmhouse, with windows that light up at dusk. -->
  <g>
    <path class="f-cream" d="M1060 520 H1200 V620 H1060 Z" />
    <path class="f-roof" d="M1040 526 L1130 450 L1220 526 Z" />
    <path class="f-soil-dark" d="M1170 470 H1186 V500 L1170 488 Z" />
    <path class="f-window" d="M1078 546 H1106 V574 H1078 Z M1154 546 H1182 V574 H1154 Z" />
    <path class="detail thin" d="M1092 546 V574 M1078 560 H1106 M1168 546 V574 M1154 560 H1182" />
    <path class="f-soil" d="M1116 580 H1144 V620 H1116 Z" />
  </g>

  <!-- Near hill with a fence. -->
  <path class="f-hill-2" d="M0 700 Q300 610 700 670 T1600 650 V900 H0 Z" />
  <g class="s-soil-dark">
    <path d="M300 660 V700 M360 652 V694 M420 648 V690 M480 648 V690 M540 652 V694" stroke-width="5" />
    <path d="M288 670 Q420 648 552 664 M288 686 Q420 664 552 680" stroke-width="3" />
  </g>
  <path class="f-hill-3" d="M0 800 Q420 720 860 790 T1600 770 V900 H0 Z" />
  <path class="detail thin s-leaf-dark" d="M120 820 l6 -12 l6 12 M640 810 l6 -12 l6 12 M1180 800 l6 -12 l6 12 M1420 830 l6 -12 l6 12" />
</svg>

<style>
  .landscape {
    position: fixed;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    stroke-width: 3;
    pointer-events: none;
  }

  /* Clouds drift across the whole sky at their own pace; negative delays start them mid-way. */
  .part-cloud {
    animation: drift linear infinite;
  }

  .cloud-1 {
    animation-duration: 70s;
    animation-delay: -20s;
  }

  .cloud-2 {
    animation-duration: 95s;
    animation-delay: -61s;
  }

  .cloud-3 {
    animation-duration: 118s;
    animation-delay: -97s;
  }

  @keyframes drift {
    from {
      transform: translateX(-1500px);
    }
    to {
      transform: translateX(1700px);
    }
  }

  .contained {
    position: absolute;
    z-index: 0;
  }

  .moon,
  .stars {
    opacity: 0;
  }

  @media (prefers-color-scheme: dark) {
    .sun {
      opacity: 0;
    }

    .moon,
    .stars {
      opacity: 1;
    }
  }

  /* The art sheet shows both at once. */
  :global(.art-day) .sun {
    opacity: 1;
  }

  :global(.art-day) :is(.moon, .stars) {
    opacity: 0;
  }

  :global(.art-dusk) .sun {
    opacity: 0;
  }

  :global(.art-dusk) :is(.moon, .stars) {
    opacity: 1;
  }
</style>
