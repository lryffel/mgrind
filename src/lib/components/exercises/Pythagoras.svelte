<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';

  interface Vertex {
    x: number;
    y: number;
  }

  interface PythagorasData {
    isRight: boolean;
    triangleVertices: Vertex[];
    rightAngleVertex: number | null;
    sideANum: number;
    sideADen: number;
    sideBNum: number;
    sideBDen: number;
    sideCNum: number;
    sideCDen: number;
    missingSide: string;
    answerLatex: string;
  }

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  const data = $derived(exercise.data as unknown as PythagorasData);
  const vertices = $derived(data.triangleVertices);
  const isNonRight = $derived(!data.isRight);

  let userInput = $state('');

  const cx = $derived((vertices[0].x + vertices[1].x + vertices[2].x) / 3);
  const cy = $derived((vertices[0].y + vertices[1].y + vertices[2].y) / 3);

  const abLabel = $derived.by(() => {
    const mx = (vertices[0].x + vertices[1].x) / 2;
    const my = (vertices[0].y + vertices[1].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 28, y: my + (dy / len) * 28 };
  });

  const acLabel = $derived.by(() => {
    const mx = (vertices[0].x + vertices[2].x) / 2;
    const my = (vertices[0].y + vertices[2].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 28, y: my + (dy / len) * 28 };
  });

  const bcLabel = $derived.by(() => {
    const mx = (vertices[1].x + vertices[2].x) / 2;
    const my = (vertices[1].y + vertices[2].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 28, y: my + (dy / len) * 28 };
  });

  const sides = $derived([
    {
      labelX: abLabel.x,
      labelY: abLabel.y,
      num: data.sideANum,
      den: data.sideADen,
      isMissing: data.missingSide === 'AB',
    },
    {
      labelX: acLabel.x,
      labelY: acLabel.y,
      num: data.sideBNum,
      den: data.sideBDen,
      isMissing: data.missingSide === 'AC',
    },
    {
      labelX: bcLabel.x,
      labelY: bcLabel.y,
      num: data.sideCNum,
      den: data.sideCDen,
      isMissing: data.missingSide === 'BC',
    },
  ]);

  const rightAnglePoints = $derived.by<string | null>(() => {
    if (data.rightAngleVertex === null) return null;
    const raIdx = data.rightAngleVertex;
    const v0 = vertices[raIdx];
    const v1 = vertices[(raIdx + 1) % 3];
    const v2 = vertices[(raIdx + 2) % 3];
    const d1x = v1.x - v0.x;
    const d1y = v1.y - v0.y;
    const d2x = v2.x - v0.x;
    const d2y = v2.y - v0.y;
    const len1 = Math.sqrt(d1x * d1x + d1y * d1y);
    const len2 = Math.sqrt(d2x * d2x + d2y * d2y);
    const off = 12;
    const p1x = v0.x + (d1x / len1) * off;
    const p1y = v0.y + (d1y / len1) * off;
    const p2x = v0.x + (d2x / len2) * off;
    const p2y = v0.y + (d2y / len2) * off;
    const p3x = p1x + (d2x / len2) * off;
    const p3y = p1y + (d2y / len2) * off;
    return `${p1x},${p1y} ${p3x},${p3y} ${p2x},${p2y}`;
  });

  function handleSubmit() {
    onSubmit(userInput.trim());
  }

  function handleCannotCompute() {
    onSubmit('cannot_compute');
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext}>
  <p class="prompt-label">{_('exercise.pythagoras.prompt')}</p>

  <svg viewBox="0 0 250 250" class="triangle-svg">
    {#each vertices as v, i (i)}
      {@const next = vertices[(i + 1) % 3]}
      <line
        x1={v.x}
        y1={v.y}
        x2={next.x}
        y2={next.y}
        stroke="currentColor"
        stroke-width="2"
      />
    {/each}

    {#each vertices as v, i (i)}
      <circle cx={v.x} cy={v.y} r="3" fill="currentColor" />
    {/each}

    {#if rightAnglePoints}
      <polyline
        points={rightAnglePoints}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
    {/if}

    {#each sides as s, i (i)}
      <g transform="translate({s.labelX}, {s.labelY})">
        {#if s.isMissing && feedback === null}
          <text text-anchor="middle" y="5" font-size="18" font-weight="700" fill="currentColor">?</text>
        {:else if s.den === 1}
          <text text-anchor="middle" y="5" font-size="15" fill="currentColor">{s.num}</text>
        {:else}
          <text text-anchor="middle" y="-6" font-size="13" fill="currentColor">{s.num}</text>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="currentColor" stroke-width="1" />
          <text text-anchor="middle" y="14" font-size="13" fill="currentColor">{s.den}</text>
        {/if}
      </g>
    {/each}
  </svg>

  {#if feedback === null}
    <div class="answer-row">
      <NumericInput bind:value={userInput} placeholder="?" />
    </div>
    {#if isNonRight}
      <button class="cannot-compute-btn" onclick={handleCannotCompute}>
        {_('exercise.pythagoras.cannotCompute')}
      </button>
    {/if}
  {:else if exercise.answer === 'cannot_compute'}
    {#if feedback === 'correct'}
      <p class="feedback correct">{_('feedback.correct')}</p>
    {:else}
      <p class="feedback incorrect">
        {_('feedback.incorrect.prefix')}{_('exercise.pythagoras.cannotCompute')}{_('feedback.incorrect.suffix')}
      </p>
    {/if}
  {:else}
    <Feedback {feedback} correctLatex={data.answerLatex} />
  {/if}
</ExerciseShell>

<style>
  .triangle-svg {
    display: block;
    margin: 0 auto;
    max-width: 250px;
    width: 100%;
    height: auto;
  }

  .answer-row {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .cannot-compute-btn {
    margin-top: 0.5rem;
  }
</style>
