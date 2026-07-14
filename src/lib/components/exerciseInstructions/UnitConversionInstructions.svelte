<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const mm_cm = '1\\ \\mathrm{cm} = 10\\ \\mathrm{mm}';
  const m_km = '1\\ \\mathrm{km} = 1000\\ \\mathrm{m}';
  const g_kg = '1\\ \\mathrm{kg} = 1000\\ \\mathrm{g}';
  const ml_l = '1\\ \\mathrm{L} = 1000\\ \\mathrm{mL}';
  const min_s = '1\\ \\mathrm{min} = 60\\ \\mathrm{s}';
  const h_d = '1\\ \\mathrm{d} = 24\\ \\mathrm{h}';
</script>

{#if state.lang === 'en'}
  <p>
    Convert a quantity from one unit to another within the same category. You'll work with
    <strong>length</strong> (mm, cm, dm, m, km), <strong>mass</strong> (mg, g, kg, t),
    <strong>volume</strong> (mL, cL, dL, L), and <strong>time</strong> (s, min, h, d).
  </p>
  <p><strong>Metric conversions</strong> use powers of 10:</p>
  <ul>
    <li><Math expression={mm_cm} /></li>
    <li><Math expression={m_km} /></li>
    <li><Math expression={g_kg} /></li>
    <li><Math expression={ml_l} /></li>
  </ul>
  <p><strong>Time conversions</strong> use factors 60 and 24:</p>
  <ul>
    <li><Math expression={min_s} /></li>
    <li><Math expression={h_d} /></li>
  </ul>
  <p>
    Type the result as a decimal number. Use a period (<code>.</code>) as the decimal separator. No fractions or units
    needed — just the number.
  </p>
{:else}
  <p>
    Rechne eine Grösse von einer Einheit in eine andere derselben Kategorie um. Du arbeitest mit
    <strong>Länge</strong> (mm, cm, dm, m, km), <strong>Masse</strong> (mg, g, kg, t),
    <strong>Volumen</strong> (mL, cL, dL, L) und <strong>Zeit</strong> (s, min, h, d).
  </p>
  <p><strong>Metrische Umrechnungen</strong> verwenden Zehnerpotenzen:</p>
  <ul>
    <li><Math expression={mm_cm} /></li>
    <li><Math expression={m_km} /></li>
    <li><Math expression={g_kg} /></li>
    <li><Math expression={ml_l} /></li>
  </ul>
  <p><strong>Zeitumrechnungen</strong> verwenden die Faktoren 60 und 24:</p>
  <ul>
    <li><Math expression={min_s} /></li>
    <li><Math expression={h_d} /></li>
  </ul>
  <p>
    Gib das Ergebnis als Dezimalzahl ein. Verwende einen Punkt (<code>.</code>) als Dezimaltrennzeichen. Keine Brüche
    oder Einheiten — nur die Zahl.
  </p>
{/if}
