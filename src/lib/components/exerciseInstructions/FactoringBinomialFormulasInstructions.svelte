<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const formula1rev = 'a^{2} + 2ab + b^{2} = (a + b)^{2}';
  const formula2rev = 'a^{2} - 2ab + b^{2} = (a - b)^{2}';
  const formula3rev = 'a^{2} - b^{2} = (a + b)(a - b)';
  const ex1 = 'x^{2} + 6x + 9';
  const ex1res = '(x + 3)^{2}';
  const ex2 = 'x^{2} - 16';
  const ex2res = '(x + 4)(x - 4)';
  const ex3 = '4x^{2} - 12x + 9';
  const ex3res = '(2x - 3)^{2}';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise asks you to factor an expanded expression back into a binomial form using one of the three binomial
    formulas. This is the reverse of expanding. Occasionally, the expression does not match any binomial formula — these
    are "trap" cases.
  </p>
  <p>The three binomial formulas (in reverse) are:</p>
  <ol>
    <li><Math expression={formula1rev} /></li>
    <li><Math expression={formula2rev} /></li>
    <li><Math expression={formula3rev} /></li>
  </ol>
  <p>To solve, follow these steps:</p>
  <ol>
    <li>
      <strong>Count the terms</strong> — three terms suggest formula 1 or 2. Two terms separated by a minus sign suggest formula
      3.
    </li>
    <li>
      <strong>Find <Math expression="a" /> and <Math expression="b" /></strong> — take the square root of the first term
      to find <Math expression="a" /> and the square root of the last term to find <Math expression="b" />. For <Math
        expression={ex1}
      />, <Math expression="a = x" /> and <Math expression="b = 3" />.
    </li>
    <li>
      <strong>Check the middle term</strong> — compute <Math expression="2ab" /> and see if it matches the middle term. For
      <Math expression={ex1} />, <Math expression="2 \cdot x \cdot 3 = 6x" />, which matches. If the middle term is
      positive, use formula 1: <Math expression={ex1res} />. If it is negative, use formula 2. For <Math
        expression={ex3}
      />, <Math expression="a = 2x" />, <Math expression="b = 3" />, and <Math expression="2 \cdot 2x \cdot 3 = 12x" />,
      giving <Math expression={ex3res} />.
    </li>
    <li>
      <strong>For difference of squares</strong> — <Math expression={ex2} />: <Math expression="a = x" />, <Math
        expression="b = 4"
      />. This is formula 3: <Math expression={ex2res} />.
    </li>
    <li>
      <strong>If no formula applies</strong> — for example <Math expression={'x^{2} + x + 1'} /> where the middle term <Math
        expression="x"
      /> is not <Math expression="2ab" /> for an integer <Math expression="b" />, select "no binomial formula".
    </li>
  </ol>
{:else}
  <p>
    In dieser Übung musst du einen expandierten Ausdruck mit einer der drei binomischen Formeln zurück in eine
    Binom-Form faktorisieren. Dies ist die Umkehrung des Ausmultiplizierens. Gelegentlich passt der Ausdruck auf keine
    binomische Formel — das sind sogenannte Fallen.
  </p>
  <p>Die drei binomischen Formeln (rückwärts) lauten:</p>
  <ol>
    <li><Math expression={formula1rev} /></li>
    <li><Math expression={formula2rev} /></li>
    <li><Math expression={formula3rev} /></li>
  </ol>
  <p>Gehe folgendermassen vor:</p>
  <ol>
    <li>
      <strong>Zähle die Terme</strong> — drei Terme deuten auf Formel 1 oder 2 hin. Zwei Terme mit einem Minus dazwischen
      deuten auf Formel 3 hin.
    </li>
    <li>
      <strong>Finde <Math expression="a" /> und <Math expression="b" /></strong> — die Quadratwurzel des ersten Terms
      ergibt <Math expression="a" />, die des letzten Terms <Math expression="b" />. Bei <Math expression={ex1} /> ist <Math
        expression="a = x"
      /> und <Math expression="b = 3" />.
    </li>
    <li>
      <strong>Überprüfe den mittleren Term</strong> — berechne <Math expression="2ab" /> und prüfe, ob er mit dem mittleren
      Term übereinstimmt. Bei <Math expression={ex1} /> ist <Math expression="2 \cdot x \cdot 3 = 6x" />, was passt. Ist
      der mittlere Term positiv, verwende Formel 1: <Math expression={ex1res} />. Ist er negativ, verwende Formel 2. Bei <Math
        expression={ex3}
      /> ist <Math expression="a = 2x" />, <Math expression="b = 3" /> und <Math
        expression="2 \cdot 2x \cdot 3 = 12x"
      />, also <Math expression={ex3res} />.
    </li>
    <li>
      <strong>Bei Differenz von Quadraten</strong> — <Math expression={ex2} />: <Math expression="a = x" />, <Math
        expression="b = 4"
      />. Dies ist Formel 3: <Math expression={ex2res} />.
    </li>
    <li>
      <strong>Wenn keine Formel passt</strong> — zum Beispiel <Math expression={'x^{2} + x + 1'} />, wo der mittlere
      Term <Math expression="x" /> nicht <Math expression="2ab" /> für ein ganzzahliges <Math expression="b" /> ist, wähle
      «keine binomische Formel».
    </li>
  </ol>
{/if}
