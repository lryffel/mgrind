<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';
</script>

{#if state.lang === 'en'}
  <p>
    In this exercise you are given a quadratic (or cubic) equation. Your task is to solve it by factoring. The answer is
    the solution set — one, two, or three numbers.
  </p>
  <p>
    The equation may not always be set to zero — the terms can be distributed across both sides. Before factoring, first
    rearrange the equation to bring all terms to one side.
  </p>
  <p>Use these factoring techniques:</p>
  <ol>
    <li>
      <strong>Factor out a common monomial</strong> — if every term contains <Math expression="x" />, factor it out.
      <br />
      Example: <Math expression="x^{2} = 4x" /> rearranges to <Math expression="x^{2} - 4x = 0" />, then factors to
      <Math expression="x(x - 4) = 0" />, so the solutions are <Math expression="x = 0" /> and
      <Math expression="x = 4" />.
    </li>
    <li>
      <strong>Difference of squares</strong> — if the expression has the form <Math expression="a^{2} - b^{2}" />, use
      <Math expression="a^{2} - b^{2} = (a + b)(a - b)" />.
      <br />
      Example: <Math expression="x^{2} = 9" /> rearranges to <Math expression="x^{2} - 9 = 0" />, then factors to
      <Math expression="(x + 3)(x - 3) = 0" />, so the solutions are <Math expression="x = 3" /> and
      <Math expression="x = -3" />.
    </li>
    <li>
      <strong>Perfect square</strong> — if the expression matches <Math expression="a^{2} + 2ab + b^{2}" /> or
      <Math expression="a^{2} - 2ab + b^{2}" />, use <Math expression="(a + b)^{2}" /> or
      <Math expression="(a - b)^{2}" />.
      <br />
      Example: <Math expression="x^{2} + 6x = -9" /> rearranges to <Math expression="x^{2} + 6x + 9 = 0" />, then
      factors to <Math expression="(x + 3)^{2} = 0" />, so the only solution is <Math expression="x = -3" />.
    </li>
    <li>
      <strong>Combine techniques</strong> — first factor out a common factor, then apply a binomial formula.
      <br />
      Example: <Math expression="3x^{2} = 12" /> becomes <Math expression="3x^{2} - 12 = 0" />, then
      <Math expression="3(x^{2} - 4) = 0" />, then <Math expression="3(x + 2)(x - 2) = 0" />. Since
      <Math expression="3 \neq 0" />, the solutions are <Math expression="x = 2" /> and
      <Math expression="x = -2" />.
    </li>
  </ol>
  <p>
    For cubic equations, factor out <Math expression="x" /> first and then factor the remaining quadratic using the same techniques.
  </p>
  <p>Enter each solution in a separate field. The order of the fields does not matter.</p>
{:else}
  <p>
    Bei dieser Übung erhältst du eine quadratische (oder kubische) Gleichung. Deine Aufgabe ist es, sie durch
    Faktorisieren zu lösen. Die Antwort ist die Lösungsmenge — eine, zwei oder drei Zahlen.
  </p>
  <p>
    Die Gleichung ist nicht immer gleich null gesetzt — die Terme können auf beide Seiten verteilt sein. Bringe vor dem
    Faktorisieren alle Terme auf eine Seite.
  </p>
  <p>Wende diese Faktorisierungstechniken an:</p>
  <ol>
    <li>
      <strong>Klammere einen gemeinsamen Faktor aus</strong> — wenn jeder Term <Math expression="x" /> enthält, klammere ihn
      aus.
      <br />
      Beispiel: <Math expression="x^{2} = 4x" /> umgeformt zu <Math expression="x^{2} - 4x = 0" />, dann faktorisiert zu
      <Math expression="x(x - 4) = 0" />, also sind die Lösungen <Math expression="x = 0" /> und
      <Math expression="x = 4" />.
    </li>
    <li>
      <strong>Dritte binomische Formel</strong> — wenn der Term die Form <Math expression="a^{2} - b^{2}" /> hat, wende
      <Math expression="a^{2} - b^{2} = (a + b)(a - b)" /> an.
      <br />
      Beispiel: <Math expression="x^{2} = 9" /> umgeformt zu <Math expression="x^{2} - 9 = 0" />, dann faktorisiert zu
      <Math expression="(x + 3)(x - 3) = 0" />, also sind die Lösungen <Math expression="x = 3" /> und
      <Math expression="x = -3" />.
    </li>
    <li>
      <strong>Erste/zweite binomische Formel</strong> — wenn der Term <Math expression="a^{2} + 2ab + b^{2}" /> oder
      <Math expression="a^{2} - 2ab + b^{2}" /> ist, wende <Math expression="(a + b)^{2}" /> oder
      <Math expression="(a - b)^{2}" /> an.
      <br />
      Beispiel: <Math expression="x^{2} + 6x = -9" /> umgeformt zu <Math expression="x^{2} + 6x + 9 = 0" />, dann
      faktorisiert zu <Math expression="(x + 3)^{2} = 0" />, also ist die einzige Lösung <Math expression="x = -3" />.
    </li>
    <li>
      <strong>Kombiniere Techniken</strong> — klammere zuerst einen gemeinsamen Faktor aus, dann wende eine binomische
      Formel an.
      <br />
      Beispiel: <Math expression="3x^{2} = 12" /> umgeformt zu <Math expression="3x^{2} - 12 = 0" />, dann zu
      <Math expression="3(x^{2} - 4) = 0" />, dann <Math expression="3(x + 2)(x - 2) = 0" />. Da
      <Math expression="3 \neq 0" />, sind die Lösungen <Math expression="x = 2" /> und
      <Math expression="x = -2" />.
    </li>
  </ol>
  <p>
    Bei kubischen Gleichungen klammere zuerst <Math expression="x" /> aus und faktorisiere dann die verbleibende quadratische
    Gleichung mit denselben Techniken.
  </p>
  <p>Gib jede Lösung in ein separates Feld ein. Die Reihenfolge der Felder spielt keine Rolle.</p>
{/if}
