<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const triSum = '180^{\\circ}';
  const quadSum = '360^{\\circ}';
  const pentSum = '540^{\\circ}';
  const formula = '(n - 2) \\cdot 180^{\\circ}';
  const oneEighty = '180^{\\circ}';
</script>

{#if state.lang === 'en'}
  <p>
    An interior angle is the angle inside a polygon formed by two adjacent sides. In this exercise you are shown a
    polygon with some angles given and one angle missing. Your task is to calculate the missing angle.
  </p>
  <p>
    The sum of the interior angles of a polygon depends only on the number of sides <Math expression="n" />:
  </p>
  <ul>
    <li>Triangle (<Math expression="n = 3" />): <Math expression={triSum} /></li>
    <li>Quadrilateral (<Math expression="n = 4" />): <Math expression={quadSum} /></li>
    <li>Pentagon (<Math expression="n = 5" />): <Math expression={pentSum} /></li>
  </ul>
  <p>
    The general formula is <Math expression={formula} />. Add up the given angles, then subtract their sum from the
    total to find the missing angle.
  </p>
  <p>
    Note that the polygon might not be convex — some interior angles can be larger than <Math expression={oneEighty} />.
    The formula still applies.
  </p>
  <p>Enter your answer as a number followed by a degree symbol.</p>
{:else}
  <p>
    Ein Innenwinkel ist der Winkel innerhalb eines Vielecks, der von zwei benachbarten Seiten gebildet wird. In dieser
    Übung wird dir ein Vieleck gezeigt, bei dem einige Winkel gegeben sind und ein Winkel fehlt. Deine Aufgabe ist es,
    den fehlenden Winkel zu berechnen.
  </p>
  <p>
    Die Summe der Innenwinkel eines Vielecks hängt nur von der Anzahl der Seiten <Math expression="n" /> ab:
  </p>
  <ul>
    <li>Dreieck (<Math expression="n = 3" />): <Math expression={triSum} /></li>
    <li>Viereck (<Math expression="n = 4" />): <Math expression={quadSum} /></li>
    <li>Fünfeck (<Math expression="n = 5" />): <Math expression={pentSum} /></li>
  </ul>
  <p>
    Die allgemeine Formel lautet <Math expression={formula} />. Addiere die gegebenen Winkel und ziehe ihre Summe von
    der Gesamtsumme ab, um den fehlenden Winkel zu erhalten.
  </p>
  <p>
    Beachte, dass das Vieleck nicht konvex sein muss — einige Innenwinkel können grösser als
    <Math expression={oneEighty} /> sein. Die Formel gilt trotzdem.
  </p>
  <p>Gib deine Antwort als Zahl gefolgt von einem Gradzeichen ein.</p>
{/if}
