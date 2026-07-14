<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { ExerciseProps } from '../../types';
  import type { AreaData } from '../../exercises/area';
  import ExerciseShell from '../ExerciseShell.svelte';
  import Feedback from '../Feedback.svelte';
  import CoefficientField from '../CoefficientField.svelte';
  import NumericInput from '../NumericInput.svelte';
  import KaTeX from '../Math.svelte';
  import SvgContainer from '../SvgContainer.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  let userInput = $state('');
  let validationError = $derived(userInput.includes(',') ? _('error.decimalComma') : null);

  let data = $derived(exercise.data as AreaData);
  let isCircle = $derived(data.shape === 'circle');
  let vertices = $derived(data.vertices);
  let isInverted = $derived(data.target === 'dim');

  function fracLatex(num: number, den: number): string {
    if (den === 1) return String(num);
    return `\\frac{${num}}{${den}}`;
  }

  function formatAnswer(ans: string): string {
    const parts = ans.split(',');
    if (parts.length === 1) return parts[0];
    return `\\frac{${parts[0]}}{${parts[1]}}`;
  }

  let areaLatex = $derived('A = ' + fracLatex(data.areaNum, data.areaDen));

  let correctLatex = $derived.by(() => {
    if (isCircle) return 'A = ' + formatAnswer(exercise.answer) + '\\pi';
    if (isInverted) {
      const dimName = data.missingDimIndex === 1 ? 'b' : 'h';
      return dimName + ' = ' + formatAnswer(exercise.answer);
    }
    return 'A = ' + formatAnswer(exercise.answer);
  });

  let userLatex = $derived.by(() => {
    const t = userInput.trim();
    if (t === '') return '';
    if (isCircle) return 'A = ' + formatAnswer(t) + '\\pi';
    if (isInverted) {
      const dimName = data.missingDimIndex === 1 ? 'b' : 'h';
      return dimName + ' = ' + formatAnswer(t);
    }
    return 'A = ' + formatAnswer(t);
  });

  let dimLabel1 = $derived(
    isCircle
      ? fracLatex(data.dim1Num, data.dim1Den)
      : isInverted && data.missingDimIndex === 1
        ? null
        : fracLatex(data.dim1Num, data.dim1Den),
  );
  let dimLabel2 = $derived(
    data.dim2Num === undefined
      ? null
      : isInverted && data.missingDimIndex === 2
        ? null
        : fracLatex(data.dim2Num!, data.dim2Den!),
  );
  let dimLabel3 = $derived(data.dim3Num === undefined ? null : fracLatex(data.dim3Num!, data.dim3Den!));

  let labelOffset = $derived.by(() => {
    if (vertices.length < 2) return 14;
    const xs = vertices.map((v) => v.x);
    const shapeW = Math.max(...xs) - Math.min(...xs);
    return Math.max(8, Math.min(18, shapeW * 0.07));
  });

  let baseLabelPos = $derived.by(() => {
    if (vertices.length < 2) return { x: 0, y: 0 };
    const mx = (vertices[0].x + vertices[1].x) / 2;
    const my = Math.max(vertices[0].y, vertices[1].y) + labelOffset;
    return { x: mx, y: my };
  });

  let heightFoot = $derived.by(() => {
    if (data.shape === 'triangle') {
      return { x: (vertices[0].x + vertices[1].x) / 2, y: vertices[0].y };
    }
    if (data.shape === 'parallelogram' && vertices.length >= 4) {
      return { x: vertices[2].x, y: vertices[0].y };
    }
    return { x: 0, y: 0 };
  });

  let heightLabelPos = $derived.by(() => {
    if (data.shape !== 'triangle' && data.shape !== 'parallelogram') return { x: 0, y: 0 };
    const midY = (vertices[2].y + vertices[0].y) / 2;
    return { x: heightFoot.x - labelOffset, y: midY };
  });

  let rectTopLabelPos = $derived.by(() => {
    if (data.shape !== 'rectangle') return { x: 0, y: 0 };
    return { x: (vertices[0].x + vertices[1].x) / 2, y: vertices[0].y - labelOffset };
  });

  let rectRightLabelPos = $derived.by(() => {
    if (data.shape !== 'rectangle') return { x: 0, y: 0 };
    return { x: vertices[1].x + labelOffset, y: (vertices[1].y + vertices[2].y) / 2 };
  });

  let slantLabelPos = $derived.by(() => {
    if (data.dim3Num === undefined || vertices.length < 4) return { x: 0, y: 0 };
    return { x: vertices[1].x + labelOffset, y: (vertices[1].y + vertices[2].y) / 2 };
  });

  let circleRadiusLabelPos = $derived.by(() => {
    if (!isCircle) return { x: 0, y: 0 };
    return { x: (vertices[2].x + vertices[3].x) / 2, y: vertices[2].y - labelOffset };
  });

  let missingInputPos = $derived.by(() => {
    if (!isInverted) return { x: 0, y: 0 };
    if (data.missingDimIndex === 1) {
      if (data.shape === 'rectangle') return rectTopLabelPos;
      return baseLabelPos;
    }
    if (data.missingDimIndex === 2) {
      if (data.shape === 'rectangle') return rectRightLabelPos;
      return heightLabelPos;
    }
    return { x: 0, y: 0 };
  });

  let knownLabel1Pos = $derived.by(() => {
    if (data.shape === 'rectangle') return rectTopLabelPos;
    return baseLabelPos;
  });

  let knownLabel2Pos = $derived.by(() => {
    if (data.shape === 'rectangle') return rectRightLabelPos;
    return heightLabelPos;
  });

  let heightApex = $derived.by(() => {
    if (data.shape === 'triangle') return { x: vertices[2].x, y: vertices[2].y };
    if (data.shape === 'parallelogram') return { x: vertices[2].x, y: vertices[2].y };
    return { x: 0, y: 0 };
  });
</script>

<ExerciseShell {exercise} {feedback} submitAnswer={() => onSubmit(userInput.trim())} {onNext} {validationError}>
  <p class="prompt-label">{_(data.promptKey)}</p>

  <SvgContainer {vertices}>
    {#if isCircle}
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
    {:else}
      <polygon
        points={vertices.map((v) => v.x + ',' + v.y).join(' ')}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
      {#if data.shape === 'triangle' || data.shape === 'parallelogram'}
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
    {/if}

    {#snippet overlays({ pct })}
      {#if isCircle}
        <div class="svg-overlay" style={pct(circleRadiusLabelPos.x, circleRadiusLabelPos.y)}>
          <KaTeX expression={dimLabel1 ?? '?'} />
        </div>
      {:else if isInverted && feedback === null}
        <div class="svg-overlay" style={pct(missingInputPos.x, missingInputPos.y)}>
          <NumericInput bind:value={userInput} placeholder="?" />
        </div>
        {#if dimLabel1 !== null && data.missingDimIndex !== 1}
          <div class="svg-overlay" style={pct(knownLabel1Pos.x, knownLabel1Pos.y)}>
            <KaTeX expression={dimLabel1} />
          </div>
        {/if}
        {#if dimLabel2 !== null && data.missingDimIndex !== 2}
          <div class="svg-overlay" style={pct(knownLabel2Pos.x, knownLabel2Pos.y)}>
            <KaTeX expression={dimLabel2} />
          </div>
        {/if}
        {#if dimLabel3 !== null}
          <div class="svg-overlay" style={pct(slantLabelPos.x, slantLabelPos.y)}>
            <KaTeX expression={dimLabel3} />
          </div>
        {/if}
      {:else if isInverted && feedback !== null}
        <div class="svg-overlay" style={pct(missingInputPos.x, missingInputPos.y)}>
          <span class="user-answer"><KaTeX expression={userInput.trim() === '' ? '?' : formatAnswer(userInput)} /></span
          >
        </div>
        {#if dimLabel1 !== null}
          <div class="svg-overlay" style={pct(knownLabel1Pos.x, knownLabel1Pos.y)}>
            <KaTeX expression={dimLabel1} />
          </div>
        {/if}
        {#if dimLabel2 !== null}
          <div class="svg-overlay" style={pct(knownLabel2Pos.x, knownLabel2Pos.y)}>
            <KaTeX expression={dimLabel2} />
          </div>
        {/if}
        {#if dimLabel3 !== null}
          <div class="svg-overlay" style={pct(slantLabelPos.x, slantLabelPos.y)}>
            <KaTeX expression={dimLabel3} />
          </div>
        {/if}
      {:else}
        {#if dimLabel1 !== null}
          <div class="svg-overlay" style={pct(knownLabel1Pos.x, knownLabel1Pos.y)}>
            <KaTeX expression={dimLabel1} />
          </div>
        {/if}
        {#if dimLabel2 !== null}
          <div class="svg-overlay" style={pct(knownLabel2Pos.x, knownLabel2Pos.y)}>
            <KaTeX expression={dimLabel2} />
          </div>
        {/if}
        {#if dimLabel3 !== null}
          <div class="svg-overlay" style={pct(slantLabelPos.x, slantLabelPos.y)}>
            <KaTeX expression={dimLabel3} />
          </div>
        {/if}
      {/if}
    {/snippet}
  </SvgContainer>

  {#if isInverted}
    <p class="result-row"><KaTeX expression={areaLatex} /></p>
    {#if feedback !== null}
      <p class="result-row">
        <span class="user-answer"><KaTeX expression={userLatex} /></span>
      </p>
      <Feedback {feedback} {correctLatex} />
    {/if}
  {:else if isCircle}
    {#if feedback === null}
      <p class="result-row">
        <KaTeX expression="A = " />
        <CoefficientField bind:value={userInput} variablePart="\pi" />
      </p>
    {:else}
      <p class="result-row">
        <span class="user-answer"><KaTeX expression={userLatex} /></span>
      </p>
      <Feedback {feedback} {correctLatex} />
    {/if}
  {:else}
    {#if feedback === null}
      <p class="result-row">
        <KaTeX expression="A = " />
        <NumericInput bind:value={userInput} placeholder="?" />
      </p>
    {:else}
      <p class="result-row">
        <span class="user-answer"><KaTeX expression={userLatex} /></span>
      </p>
      <Feedback {feedback} {correctLatex} />
    {/if}
  {/if}
</ExerciseShell>

<style>
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
</style>
