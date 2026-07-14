<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const rectArea = 'A = a \\cdot b';
  const rectPerim = 'U = 2(a + b)';
  const squareArea = 'A = s^2';
  const squarePerim = 'U = 4s';
  const triArea = 'A = \\frac{1}{2} \\cdot g \\cdot h';
  const circleArea = 'A = \\pi r^2';
  const circlePerim = 'U = 2\\pi r';
  const paraArea = 'A = g \\cdot h';
  const annulusArea = 'A = \\pi(R^2 - r^2)';
  const piSym = '\\pi';
  const fracEx = '\\frac{15}{2}';
</script>

{#if state.lang === 'en'}
  <p>Calculate the area and/or perimeter of geometric shapes. Common formulas:</p>
  <ul>
    <li>Rectangle: <Math expression={rectArea} />, <Math expression={rectPerim} /></li>
    <li>Square: <Math expression={squareArea} />, <Math expression={squarePerim} /></li>
    <li>Triangle: <Math expression={triArea} /></li>
    <li>
      Circle: <Math expression={circleArea} />, <Math expression={circlePerim} /> — enter only the coefficient of <Math
        expression={piSym}
      />
    </li>
    <li>Parallelogram: <Math expression={paraArea} /> (use the perpendicular height)</li>
    <li>Annulus (ring): <Math expression={annulusArea} /></li>
  </ul>
  <p>Enter exact answers as integers or reduced fractions (e.g. <Math expression={fracEx} />).</p>
  <p>If the problem cannot be solved with the given information, click the "Cannot compute" button.</p>
{:else}
  <p>Berechne den Fl&auml;cheninhalt und/oder den Umfang von geometrischen Figuren. Wichtige Formeln:</p>
  <ul>
    <li>Rechteck: <Math expression={rectArea} />, <Math expression={rectPerim} /></li>
    <li>Quadrat: <Math expression={squareArea} />, <Math expression={squarePerim} /></li>
    <li>Dreieck: <Math expression={triArea} /></li>
    <li>
      Kreis: <Math expression={circleArea} />, <Math expression={circlePerim} /> — gib nur den Koeffizienten von <Math
        expression={piSym}
      /> ein
    </li>
    <li>Parallelogramm: <Math expression={paraArea} /> (verwende die senkrechte H&ouml;he)</li>
    <li>Kreisring: <Math expression={annulusArea} /></li>
  </ul>
  <p>Gib exakte Antworten als ganze Zahlen oder gek&uuml;rzte Br&uuml;che ein (z. B. <Math expression={fracEx} />).</p>
  <p>
    Wenn die Aufgabe mit den gegebenen Informationen nicht gel&ouml;st werden kann, klicke auf den Knopf "Nicht
    berechenbar".
  </p>
{/if}
