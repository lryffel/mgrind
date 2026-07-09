<script lang="ts">
  import { state } from '../../i18n.svelte';
  import Math from '../Math.svelte';

  const step1 = '3^{2} = 9';
  const step1Expr = '4 + 2 \\cdot 9';
  const step2 = '2 \\cdot 9 = 18';
  const step2Expr = '4 + 18';
  const step3 = '4 + 18 = 22';
</script>

{#if state.lang === 'en'}
  <p>
    This exercise tests your understanding of the order of operations — the rules that tell you which calculation to
    perform first in an arithmetic expression. You will see expressions that combine parentheses, exponents,
    multiplication, division, and addition or subtraction.
  </p>
  <p>The standard order is:</p>
  <ol>
    <li><strong>Parentheses</strong> — evaluate anything inside <Math expression={'( \\dots )'} /> first.</li>
    <li>
      <strong>Exponents and square roots</strong> — evaluate powers like <Math expression={'3^{2}'} /> and roots like <Math
        expression={'\\sqrt{9}'}
      />.
    </li>
    <li><strong>Multiplication and division</strong> — from left to right.</li>
    <li><strong>Addition and subtraction</strong> — from left to right.</li>
  </ol>
  <p>Let's work through <Math expression={'4 + 2 \\cdot 3^{2}'} /> step by step:</p>
  <ul>
    <li>Step 1 — Exponents: <Math expression={step1} />, so the expression becomes <Math expression={step1Expr} />.</li>
    <li>
      Step 2 — Multiplication: <Math expression={step2} />, so the expression becomes <Math expression={step2Expr} />.
    </li>
    <li>Step 3 — Addition: <Math expression={step3} />.</li>
  </ul>
  <p>The final result is <Math expression={'22'} />.</p>
{:else}
  <p>
    Diese Übung testet dein Verständnis der Rechenregeln — der Regeln, die festlegen, in welcher Reihenfolge du in einem
    arithmetischen Ausdruck rechnen musst. Dir werden Ausdrücke begegnen, die Klammern, Exponenten, Multiplikation,
    Division und Addition oder Subtraktion kombinieren.
  </p>
  <p>Die Standard-Reihenfolge ist:</p>
  <ol>
    <li><strong>Klammern</strong> — berechne zuerst alles innerhalb von <Math expression={'( \\dots )'} />.</li>
    <li>
      <strong>Exponenten und Quadratwurzeln</strong> — berechne Potenzen wie <Math expression={'3^{2}'} /> und Wurzeln wie
      <Math expression={'\\sqrt{9}'} />.
    </li>
    <li><strong>Multiplikation und Division</strong> — von links nach rechts.</li>
    <li><strong>Addition und Subtraktion</strong> — von links nach rechts.</li>
  </ol>
  <p>Gehen wir <Math expression={'4 + 2 \\cdot 3^{2}'} /> Schritt für Schritt durch:</p>
  <ul>
    <li>Schritt 1 — Exponenten: <Math expression={step1} />, der Ausdruck wird zu <Math expression={step1Expr} />.</li>
    <li>
      Schritt 2 — Multiplikation: <Math expression={step2} />, der Ausdruck wird zu <Math expression={step2Expr} />.
    </li>
    <li>Schritt 3 — Addition: <Math expression={step3} />.</li>
  </ul>
  <p>Das Ergebnis ist <Math expression={'22'} />.</p>
{/if}
