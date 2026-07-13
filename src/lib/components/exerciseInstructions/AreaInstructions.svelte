<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const triangleF = 'A = \\frac{1}{2} \\cdot b \\cdot h';
  const rectF = 'A = a \\cdot b';
  const paraF = 'A = b \\cdot h';
  const circleF = 'A = \\pi r^2';
  const piSym = '\\pi';
  const fracEx = '\\frac{15}{2}';
</script>

{#if state.lang === 'en'}
  <p>Calculate the area of geometric shapes. Use the formulas:</p>
  <ul>
    <li>Triangle: <Math expression={triangleF} /></li>
    <li>Rectangle: <Math expression={rectF} /></li>
    <li>Parallelogram: <Math expression={paraF} /> (use the perpendicular height, not the slant side)</li>
    <li>Circle: <Math expression={circleF} /> — enter only the number that multiplies <Math expression={piSym} /></li>
  </ul>
  <p>Enter exact answers as integers or reduced fractions (e.g. <Math expression={fracEx} />).</p>
{:else}
  <p>Berechne den Fl&auml;cheninhalt von geometrischen Figuren. Verwende die Formeln:</p>
  <ul>
    <li>Dreieck: <Math expression={triangleF} /></li>
    <li>Rechteck: <Math expression={rectF} /></li>
    <li>
      Parallelogramm: <Math expression={paraF} /> (verwende die senkrechte H&ouml;he, nicht die schr&auml;ge Seite)
    </li>
    <li>Kreis: <Math expression={circleF} /> — gib nur die Zahl ein, die <Math expression={piSym} /> multipliziert</li>
  </ul>
  <p>Gib exakte Antworten als ganze Zahlen oder gek&uuml;rzte Br&uuml;che ein (z. B. <Math expression={fracEx} />).</p>
{/if}
