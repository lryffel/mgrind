<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import KaTeX from '../Math.svelte';

  interface AngleData {
    value: number;
    isMissing: boolean;
    vertexX: number;
    vertexY: number;
  }

  interface InteriorAnglesData {
    sides: number;
    angles: AngleData[];
  }

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');

  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  const degreeLatex = '{}^\\circ';
  const correctLatex = $derived(exercise.answer + '{}^\\circ');

  const data = $derived(exercise.data as InteriorAnglesData);

  const cx = 150;
  const cy = 140;

  function userAnswerLatex(answer: string): string {
    if (answer === '') return '?';
    return answer + '^\\circ';
  }

  function labelPos(vx: number, vy: number) {
    const dir = Math.atan2(vy - cy, vx - cx);
    return {
      x: vx + 28 * Math.cos(dir),
      y: vy + 28 * Math.sin(dir),
    };
  }

  function arcPath(curr: AngleData, prev: AngleData, next: AngleData) {
    const ex1 = prev.vertexX - curr.vertexX;
    const ey1 = prev.vertexY - curr.vertexY;
    const ex2 = next.vertexX - curr.vertexX;
    const ey2 = next.vertexY - curr.vertexY;

    const dot = ex1 * ex2 + ey1 * ey2;
    const len1 = Math.sqrt(ex1 * ex1 + ey1 * ey1);
    const len2 = Math.sqrt(ex2 * ex2 + ey2 * ey2);
    const acosAngle = Math.acos(dot / (len1 * len2));
    const cross = ex1 * ey2 - ey1 * ex2;

    const r = 18;
    const a1 = Math.atan2(prev.vertexY - curr.vertexY, prev.vertexX - curr.vertexX);
    const a2 = Math.atan2(next.vertexY - curr.vertexY, next.vertexX - curr.vertexX);
    const interiorAngle = cross < 0 ? acosAngle : 2 * Math.PI - acosAngle;

    const sx = curr.vertexX + r * Math.cos(a1);
    const sy = curr.vertexY + r * Math.sin(a1);
    const ex = curr.vertexX + r * Math.cos(a2);
    const ey = curr.vertexY + r * Math.sin(a2);
    return `M ${sx} ${sy} A ${r} ${r} 0 ${interiorAngle > Math.PI ? 1 : 0} 0 ${ex} ${ey}`;
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} {validationError}>
  <p class="prompt-label">{_('exercise.interiorAngles.prompt')}</p>

  <div class="svg-container">
    <svg viewBox="0 0 300 280" class="polygon-svg">
      {#each data.angles as angle, i (i)}
        {@const next = data.angles[(i + 1) % data.sides]}
        <line
          x1={angle.vertexX}
          y1={angle.vertexY}
          x2={next.vertexX}
          y2={next.vertexY}
          stroke="currentColor"
          stroke-width="2"
        />
      {/each}

      {#each data.angles as angle, i (i)}
        {@const prev = data.angles[(i - 1 + data.sides) % data.sides]}
        {@const next = data.angles[(i + 1) % data.sides]}
        <path d={arcPath(angle, prev, next)} fill="none" stroke="currentColor" stroke-width="1.5" />
        <circle cx={angle.vertexX} cy={angle.vertexY} r="3" fill="currentColor" />
      {/each}
    </svg>

    {#each data.angles as angle, i (i)}
      {@const lp = labelPos(angle.vertexX, angle.vertexY)}
      <div class="svg-overlay" style="left: {(lp.x / 300) * 100}%; top: {(lp.y / 280) * 100}%;">
        {#if angle.isMissing && feedback === null}
          <NumericInput bind:value={userInput} placeholder="?" variablePart={degreeLatex} />
        {:else if angle.isMissing && feedback !== null}
          <span class="user-answer"><KaTeX expression={userAnswerLatex(userInput)} /></span>
        {:else}
          <KaTeX expression={angle.value + '^\\circ'} />
        {/if}
      </div>
    {/each}
  </div>

  {#if feedback !== null}
    <div class="feedback-row">
      <Feedback {feedback} {correctLatex} />
    </div>
  {/if}
</ExerciseShell>

<style>
  .polygon-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .svg-container {
    position: relative;
    display: inline-block;
    width: 100%;
    margin: 0.5rem 0;
  }

  .svg-overlay {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }
</style>
