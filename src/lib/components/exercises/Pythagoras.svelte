<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import NumericInput from './NumericInput.svelte';
  import KaTeX from '../Math.svelte';
  import SvgContainer from '../SvgContainer.svelte';
  import { coeffLatex } from '../../math/latex';

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

  let userInput = $state('');

  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  const data = $derived(exercise.data as unknown as PythagorasData);
  const vertices = $derived(data.triangleVertices);
  const isNonRight = $derived(!data.isRight);

  const cx = $derived((vertices[0].x + vertices[1].x + vertices[2].x) / 3);
  const cy = $derived((vertices[0].y + vertices[1].y + vertices[2].y) / 3);

  const abLabel = $derived.by(() => {
    const mx = (vertices[0].x + vertices[1].x) / 2;
    const my = (vertices[0].y + vertices[1].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 22, y: my + (dy / len) * 22 };
  });

  const acLabel = $derived.by(() => {
    const mx = (vertices[0].x + vertices[2].x) / 2;
    const my = (vertices[0].y + vertices[2].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 22, y: my + (dy / len) * 22 };
  });

  const bcLabel = $derived.by(() => {
    const mx = (vertices[1].x + vertices[2].x) / 2;
    const my = (vertices[1].y + vertices[2].y) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.01) return { x: mx, y: my };
    return { x: mx + (dx / len) * 22, y: my + (dy / len) * 22 };
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

  function sideLatex(num: number, den: number): string {
    if (den === 1) return String(num);
    return coeffLatex(num, den, '');
  }

  function userAnswerLatex(answer: string): string {
    if (answer === '') return '?';
    if (answer.includes('/')) {
      const parts = answer.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      if (!isNaN(n) && !isNaN(d)) return coeffLatex(n, d, '');
      return `\\frac{${parts[0]}}{${parts[1]}}`;
    }
    return answer;
  }

  const cannotComputeShort = $derived(_('exercise.pythagoras.cannotComputeShort'));

  function handleSubmit() {
    onSubmit(userInput.trim());
  }

  function handleCannotCompute() {
    onSubmit('cannot_compute');
  }
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError}>
  {#snippet submitExtra()}
    {#if isNonRight && feedback === null}
      <button class="cannot-compute-link" onclick={handleCannotCompute} title={cannotComputeShort}>
        {cannotComputeShort}
      </button>
    {/if}
  {/snippet}
  <p class="prompt-label">{_('exercise.pythagoras.prompt')}</p>

  <SvgContainer {vertices}>
    {#each vertices as v, i (i)}
      {@const next = vertices[(i + 1) % 3]}
      <line x1={v.x} y1={v.y} x2={next.x} y2={next.y} stroke="currentColor" stroke-width="2" />
    {/each}

    {#each vertices as v, i (i)}
      <circle cx={v.x} cy={v.y} r="3" fill="currentColor" />
    {/each}

    {#if rightAnglePoints}
      <polyline points={rightAnglePoints} fill="none" stroke="currentColor" stroke-width="1.5" />
    {/if}

    {#snippet overlays({ pct })}
      {#each sides as s, i (i)}
        <div class="svg-overlay" style={pct(s.labelX, s.labelY)}>
          {#if s.isMissing && feedback === null}
            <NumericInput bind:value={userInput} placeholder="?" />
          {:else if s.isMissing && feedback !== null}
            {#if exercise.answer === 'cannot_compute'}
              <span class="user-answer">?</span>
            {:else}
              <span class="user-answer"><KaTeX expression={userAnswerLatex(userInput)} /></span>
            {/if}
          {:else}
            <KaTeX expression={sideLatex(s.num, s.den)} />
          {/if}
        </div>
      {/each}
    {/snippet}
  </SvgContainer>

  {#if feedback !== null}
    {#if exercise.answer === 'cannot_compute'}
      <div class="feedback-row">
        <Feedback {feedback} correctMessage={_('feedback.pythagoras.cannotCompute')} />
      </div>
    {:else}
      <div class="feedback-row">
        <Feedback {feedback} correctLatex={data.answerLatex} />
      </div>
    {/if}
  {/if}
</ExerciseShell>

<style>
  .cannot-compute-link {
    background: none;
    border: none;
    font: inherit;
    font-size: 0.8rem;
    color: var(--c-primary);
    cursor: pointer;
    text-decoration: underline dotted;
  }

  .cannot-compute-link:hover {
    text-decoration-style: solid;
  }
</style>
