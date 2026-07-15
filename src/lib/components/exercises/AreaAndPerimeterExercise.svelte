<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { AreaAndPerimeterData } from '../../exercises/areaAndPerimeter';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import CoefficientField from '../CoefficientField.svelte';
  import NumericInput from '../NumericInput.svelte';
  import KaTeX from '../Math.svelte';
  import SvgContainer from '../SvgContainer.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInputs = $state<string[]>([]);
  $effect(() => {
    const len = (exercise.data as unknown as { asks?: unknown[] })?.asks?.length ?? 2;
    if (userInputs.length !== len) {
      userInputs = Array(len).fill('');
    }
  });
  let validationError = $state(null);
  let disableSubmit = $derived(userInputs.some((v) => v.trim() === ''));

  const data = $derived(exercise.data as unknown as AreaAndPerimeterData);
  const vertices = $derived(data.vertices);
  const isMulti = $derived(data.asks.length > 1);
  const isCircle = $derived(data.shape === 'circle' || data.shape === 'annulus');
  const usesPi = $derived((data.shape === 'circle' || data.shape === 'annulus') && data.asks.some((a) => true));

  function fracLatex(num: number, den: number): string {
    if (den === 1) return String(num);
    return `\\frac{${num}}{${den}}`;
  }

  function formatAnswer(s: string): string {
    const commaParts = s.split(',');
    if (commaParts.length === 2) return `\\frac{${commaParts[0]}}{${commaParts[1]}}`;
    const slashParts = s.split('/');
    if (slashParts.length === 2) return `\\frac{${slashParts[0]}}{${slashParts[1]}}`;
    return s;
  }

  const cannotComputeShort = $derived(_('exercise.areaAndPerimeter.cannotComputeShort'));

  function handleSubmit() {
    if (isMulti) {
      const v1 = userInputs[0].trim();
      const v2 = userInputs[1].trim();
      if (v1 && v2) {
        onSubmit(`${v1}|${v2}`);
      }
    } else {
      onSubmit(userInputs[0].trim());
    }
  }

  function handleCannotCompute() {
    onSubmit('cannot_compute');
  }

  let correctLatex = $derived.by(() => {
    if (exercise.answer === 'cannot_compute') return undefined;
    if (exercise.answer.includes('|')) {
      const parts = exercise.answer.split('|');
      if (data.fields?.[0]?.variablePart?.includes('pi')) {
        return 'A = ' + formatAnswer(parts[0]) + '\\pi,\\ U = ' + formatAnswer(parts[1]) + '\\pi';
      }
      return 'A = ' + formatAnswer(parts[0]) + ',\\ U = ' + formatAnswer(parts[1]);
    }
    const isSingle = !exercise.answer.includes('|');
    if (isSingle) {
      if (data.fields?.[0]?.variablePart?.includes('pi')) {
        return 'A = ' + formatAnswer(exercise.answer) + '\\pi';
      }
      const label = data.asks[0] === 'area' ? 'A' : 'U';
      return label + ' = ' + formatAnswer(exercise.answer);
    }
    return undefined;
  });

  function labelDim(idx: number): string | null {
    const dim = data.dims[idx];
    if (!dim) return null;
    return fracLatex(dim.num, dim.den);
  }

  function mid2(i: number, j: number): { x: number; y: number } {
    return { x: (vertices[i].x + vertices[j].x) / 2, y: (vertices[i].y + vertices[j].y) / 2 };
  }

  const L = $derived.by(() => {
    if (vertices.length < 2) return 14;
    const xs = vertices.map((v) => v.x);
    return Math.max(8, Math.min(18, (Math.max(...xs) - Math.min(...xs)) * 0.07));
  });

  function dimLabelPos(idx: number): { x: number; y: number } {
    const s = data.shape;
    switch (s) {
      case 'rect':
      case 'square': {
        if (idx === 0) {
          const p = mid2(2, 3);
          return { x: p.x, y: p.y + L };
        }
        if (idx === 1) {
          const p = mid2(1, 2);
          return { x: p.x + L, y: p.y };
        }
        return { x: 0, y: 0 };
      }
      case 'triangle': {
        if (idx === 0) {
          const p = mid2(0, 1);
          return { x: p.x, y: p.y + L };
        }
        if (idx === 1) {
          const footX = (vertices[0].x + vertices[1].x) / 2;
          const midY = (vertices[2].y + vertices[0].y) / 2;
          return { x: footX - L, y: midY };
        }
        return { x: 0, y: 0 };
      }
      case 'triangleRight': {
        if (idx === 0) {
          const p = mid2(0, 2);
          return { x: p.x - L, y: p.y };
        }
        if (idx === 1) {
          const p = mid2(1, 2);
          return { x: p.x, y: p.y + L };
        }
        return { x: 0, y: 0 };
      }
      case 'circle': {
        if (idx === 0) {
          const p = mid2(2, 3);
          return { x: p.x, y: p.y - L };
        }
        return { x: 0, y: 0 };
      }
      case 'parallelogram': {
        if (idx === 0) {
          const p = mid2(0, 1);
          return { x: p.x, y: p.y + L };
        }
        if (idx === 1) {
          const footX = vertices[2].x;
          const midY = (vertices[2].y + vertices[0].y) / 2;
          return { x: footX - L, y: midY };
        }
        return { x: 0, y: 0 };
      }
      case 'annulus': {
        if (idx === 0) {
          const p = mid2(4, 5);
          return { x: p.x, y: p.y - L };
        }
        if (idx === 1) {
          const p = mid2(4, 6);
          return { x: p.x + L, y: p.y };
        }
        return { x: 0, y: 0 };
      }
      case 'lShape': {
        if (idx === 0) {
          const p = mid2(0, 1);
          return { x: p.x, y: p.y - L };
        }
        if (idx === 1) {
          const p = mid2(0, 5);
          return { x: p.x - L, y: p.y };
        }
        if (idx === 2) {
          const p = mid2(2, 3);
          return { x: p.x, y: p.y + L };
        }
        if (idx === 3) {
          const p = mid2(3, 4);
          return { x: p.x + L, y: p.y };
        }
        return { x: 0, y: 0 };
      }
      case 'rectWithHole': {
        if (idx === 0) {
          const p = mid2(2, 3);
          return { x: p.x, y: p.y + L };
        }
        if (idx === 1) {
          const p = mid2(1, 2);
          return { x: p.x + L, y: p.y };
        }
        if (idx === 2) {
          const p = mid2(4, 5);
          return { x: p.x, y: p.y - L };
        }
        if (idx === 3) {
          const p = mid2(4, 7);
          return { x: p.x - L, y: p.y };
        }
        return { x: 0, y: 0 };
      }
    }
  }

  let heightApex = $derived.by(() => {
    if (data.shape === 'triangle' || data.shape === 'parallelogram') return { x: vertices[2].x, y: vertices[2].y };
    if (data.shape === 'triangleRight') return { x: vertices[0].x, y: vertices[0].y };
    return { x: 0, y: 0 };
  });

  let heightFoot = $derived.by(() => {
    if (data.shape === 'triangle' || data.shape === 'triangleRight')
      return { x: (vertices[0].x + vertices[1].x) / 2, y: vertices[0].y };
    if (data.shape === 'parallelogram' && vertices.length >= 4) return { x: vertices[2].x, y: vertices[0].y };
    return { x: 0, y: 0 };
  });

  let annulusOuterR = $derived.by(() => {
    if (data.shape !== 'annulus') return 0;
    return Math.abs(vertices[5].x - vertices[4].x);
  });

  let annulusInnerR = $derived.by(() => {
    if (data.shape !== 'annulus') return 0;
    return Math.abs(vertices[3].x - vertices[4].x);
  });

  let rightAnglePos = $derived.by<string | null>(() => {
    if (data.shape !== 'triangleRight') return null;
    const v0 = vertices[2];
    const v1 = vertices[0];
    const v2 = vertices[1];
    const d1x = v1.x - v0.x;
    const d1y = v1.y - v0.y;
    const d2x = v2.x - v0.x;
    const d2y = v2.y - v0.y;
    const len1 = Math.sqrt(d1x * d1x + d1y * d1y);
    const len2 = Math.sqrt(d2x * d2x + d2y * d2y);
    const off = 10;
    const p1x = v0.x + (d1x / len1) * off;
    const p1y = v0.y + (d1y / len1) * off;
    const p2x = v0.x + (d2x / len2) * off;
    const p2y = v0.y + (d2y / len2) * off;
    const p3x = p1x + (d2x / len2) * off;
    const p3y = p1y + (d2y / len2) * off;
    return `${p1x},${p1y} ${p3x},${p3y} ${p2x},${p2y}`;
  });

  let userLatex = $derived.by(() => {
    if (!isMulti) {
      const t = userInputs[0].trim();
      if (t === '') return '';
      if (data.fields?.[0]?.variablePart?.includes('pi')) {
        const label = data.asks[0] === 'area' ? 'A' : 'U';
        return label + ' = ' + formatAnswer(t) + '\\pi';
      }
      const label = data.asks[0] === 'area' ? 'A' : 'U';
      return label + ' = ' + formatAnswer(t);
    }
    const a1 = userInputs[0].trim();
    const a2 = userInputs[1].trim();
    if (!a1 && !a2) return '';
    const label1 = data.asks[0] === 'area' ? 'A' : 'U';
    const label2 = data.asks[1] === 'area' ? 'A' : 'U';
    const part1 = a1
      ? data.fields?.[0]?.variablePart?.includes('pi')
        ? formatAnswer(a1) + '\\pi'
        : formatAnswer(a1)
      : '?';
    const part2 = a2
      ? data.fields?.[1]?.variablePart?.includes('pi')
        ? formatAnswer(a2) + '\\pi'
        : formatAnswer(a2)
      : '?';
    return label1 + ' = ' + part1 + ',\\ ' + label2 + ' = ' + part2;
  });
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={handleSubmit} {onNext} {validationError} {disableSubmit}>
  {#snippet submitExtra()}
    {#if !data.solvable && feedback === null}
      <button class="cannot-compute-link" onclick={handleCannotCompute} title={cannotComputeShort}>
        {cannotComputeShort}
      </button>
    {/if}
  {/snippet}
  <p class="prompt-label">{_(data.promptKey)}</p>

  <SvgContainer {vertices}>
    {#if data.shape === 'circle'}
      <circle
        cx={vertices[2].x}
        cy={vertices[2].y}
        r={Math.abs(vertices[3].x - vertices[2].x)}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
      <line
        x1={vertices[2].x}
        y1={vertices[2].y}
        x2={vertices[3].x}
        y2={vertices[3].y}
        stroke="currentColor"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <circle cx={vertices[2].x} cy={vertices[2].y} r="2.5" fill="currentColor" vector-effect="non-scaling-stroke" />
    {:else if data.shape === 'annulus'}
      <path
        d="M {vertices[4].x - annulusOuterR},{vertices[4].y}
           A {annulusOuterR},{annulusOuterR} 0 1,0 {vertices[4].x + annulusOuterR},{vertices[4].y}
           A {annulusOuterR},{annulusOuterR} 0 1,0 {vertices[4].x - annulusOuterR},{vertices[4].y}
           M {vertices[4].x - annulusInnerR},{vertices[4].y}
           A {annulusInnerR},{annulusInnerR} 0 1,1 {vertices[4].x + annulusInnerR},{vertices[4].y}
           A {annulusInnerR},{annulusInnerR} 0 1,1 {vertices[4].x - annulusInnerR},{vertices[4].y}"
        fill="currentColor"
        fill-opacity="0.1"
        fill-rule="evenodd"
        vector-effect="non-scaling-stroke"
      />
      <circle
        cx={vertices[4].x}
        cy={vertices[4].y}
        r={annulusOuterR}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
      <circle
        cx={vertices[4].x}
        cy={vertices[4].y}
        r={annulusInnerR}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
      <line
        x1={vertices[4].x}
        y1={vertices[4].y}
        x2={vertices[5].x}
        y2={vertices[5].y}
        stroke="currentColor"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <line
        x1={vertices[4].x}
        y1={vertices[4].y}
        x2={vertices[6].x}
        y2={vertices[6].y}
        stroke="currentColor"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <circle cx={vertices[4].x} cy={vertices[4].y} r="2.5" fill="currentColor" vector-effect="non-scaling-stroke" />
    {:else if data.shape === 'rectWithHole'}
      <path
        d={[
          'M',
          vertices[0].x,
          vertices[0].y,
          'L',
          vertices[1].x,
          vertices[1].y,
          'L',
          vertices[2].x,
          vertices[2].y,
          'L',
          vertices[3].x,
          vertices[3].y,
          'Z',
          'M',
          vertices[4].x,
          vertices[4].y,
          'L',
          vertices[5].x,
          vertices[5].y,
          'L',
          vertices[6].x,
          vertices[6].y,
          'L',
          vertices[7].x,
          vertices[7].y,
          'Z',
        ].join(' ')}
        fill="currentColor"
        fill-opacity="0.08"
        fill-rule="evenodd"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    {:else}
      <polygon
        points={vertices.map((v) => v.x + ',' + v.y).join(' ')}
        fill="currentColor"
        fill-opacity={data.shape === 'lShape' ? '0.08' : '0'}
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
      {#if data.shape === 'triangle' || data.shape === 'triangleRight' || data.shape === 'parallelogram'}
        <line
          x1={heightApex.x}
          y1={heightApex.y}
          x2={heightFoot.x}
          y2={heightFoot.y}
          stroke="currentColor"
          stroke-width="0.75"
          stroke-dasharray="4,3"
          vector-effect="non-scaling-stroke"
        />
      {/if}
      {#if rightAnglePos}
        <polyline points={rightAnglePos} fill="none" stroke="currentColor" stroke-width="1.5" />
      {/if}
    {/if}

    {#snippet overlays({ pct })}
      {#each data.dims as dim, i (i)}
        {@const pos = dimLabelPos(i)}
        {#if pos.x !== 0 || pos.y !== 0}
          <div class="svg-overlay" style={pct(pos.x, pos.y)}>
            <KaTeX expression={fracLatex(dim.num, dim.den)} />
          </div>
        {/if}
      {/each}
    {/snippet}
  </SvgContainer>

  {#if isMulti && feedback === null}
    <div class="multi-field-row">
      {#each data.asks as ask, i (i)}
        <span class="result-row">
          <KaTeX expression={ask === 'area' ? 'A = ' : 'U = '} />
          {#if data.fields?.[i]?.variablePart?.includes('pi')}
            <CoefficientField bind:value={userInputs[i]} variablePart="\pi" />
          {:else}
            <NumericInput bind:value={userInputs[i]} />
          {/if}
        </span>
      {/each}
    </div>
  {:else if !isMulti && feedback === null}
    <div class="result-row">
      <KaTeX expression={data.asks[0] === 'area' ? 'A = ' : 'U = '} />
      {#if data.fields?.[0]?.variablePart?.includes('pi')}
        <CoefficientField bind:value={userInputs[0]} variablePart="\pi" />
      {:else}
        <NumericInput bind:value={userInputs[0]} />
      {/if}
    </div>
  {/if}

  {#if feedback !== null}
    {#if exercise.answer === 'cannot_compute'}
      <div class="feedback-row">
        <Feedback {feedback} correctMessage={_('feedback.areaAndPerimeter.cannotCompute')} />
      </div>
    {:else}
      <div class="feedback-row">
        <div class="result-row">
          <span class="user-answer"><KaTeX expression={userLatex} display /></span>
        </div>
        <Feedback {feedback} {correctLatex} />
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

  .multi-field-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    justify-content: center;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .result-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: center;
    margin-top: 0.5rem;
    font-size: 1.15rem;
  }

  .user-answer {
    color: var(--c-magenta);
  }

  .feedback-row {
    margin-top: 0.5rem;
  }
</style>
