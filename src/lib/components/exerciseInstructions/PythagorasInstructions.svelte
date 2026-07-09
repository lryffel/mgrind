<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const pyth = 'a^2 + b^2 = c^2';
  const exTri = '3^2 + 4^2 = 5^2';
</script>

{#if state.lang === 'en'}
  <p>
    The Pythagorean theorem states that in a right triangle, the square of the hypotenuse
    (<Math expression="c" />) equals the sum of the squares of the other two sides
    (<Math expression="a" /> and <Math expression="b" />):
  </p>
  <p><Math expression={pyth} /></p>
  <p>
    In this exercise, the two given sides might be legs, or one leg and the hypotenuse.
    Determine which side is missing and apply the theorem to find it.
  </p>
  <p>
    If the triangle is <strong>not</strong> right-angled, you cannot use the Pythagorean
    theorem. In that case, press the "Cannot be computed" button.
  </p>
  <p>
    <em>Note:</em> The side lengths in this exercise are specially chosen so that the
    result simplifies to a nice fraction. In general, the Pythagorean theorem usually
    does <strong>not</strong> produce neat results.
  </p>
{:else}
  <p>
    Der Satz des Pythagoras besagt, dass in einem rechtwinkligen Dreieck das Quadrat der
    Hypotenuse (<Math expression="c" />) gleich der Summe der Quadrate der anderen beiden
    Seiten (<Math expression="a" /> und <Math expression="b" />) ist:
  </p>
  <p><Math expression={pyth} /></p>
  <p>
    In dieser Übung können die zwei gegebenen Seiten die Katheten oder eine Kathete und
    die Hypotenuse sein. Bestimme, welche Seite fehlt, und wende den Satz an, um sie zu
    berechnen.
  </p>
  <p>
    Wenn das Dreieck <strong>nicht</strong> rechtwinklig ist, kannst du den Satz des
    Pythagoras nicht anwenden. Drücke in diesem Fall den Knopf «Kann nicht mit dem Satz
    des Pythagoras berechnet werden».
  </p>
  <p>
    <em>Hinweis:</em> Die Seitenlängen in dieser Übung sind speziell gewählt, sodass das
    Ergebnis ein schöner Bruch ist. Im Allgemeinen liefert der Satz des Pythagoras
    <strong>keine</strong> einfachen Ergebnisse.
  </p>
{/if}
