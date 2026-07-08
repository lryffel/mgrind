<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';
  import Fraction from './Fraction.svelte';
  import Sqrt from './Sqrt.svelte';

  let {
    exercise,
    onSubmit,
    onNext,
    feedback,
  }: {
    exercise: Exercise;
    onSubmit: (answer: string) => void;
    onNext: () => void;
    feedback: 'correct' | 'incorrect' | null;
  } = $props();

  let input = $state('');
  let numInput = $state('');
  let denInput = $state('');
  let firstInput = $state<HTMLInputElement | null>(null);

  const variable = $derived(exercise.data?.variable as string | undefined ?? 'x');
  const value = $derived(exercise.data?.value as string | undefined ?? '');
  const term = $derived(exercise.data?.term as string | undefined ?? exercise.prompt);
  const complexity = $derived(exercise.data?.complexity as number | undefined ?? 0);
  const answerIsFraction = $derived(exercise.answer.includes('/'));

  const valueFrac = $derived(parseValueFrac(value));

  function parseValueFrac(s: string): { num: number; den: number } | null {
    if (!s.includes('/')) return null;
    const parts = s.split('/');
    if (parts.length !== 2) return null;
    const num = parseInt(parts[0], 10);
    const den = parseInt(parts[1], 10);
    if (isNaN(num) || isNaN(den) || den === 0) return null;
    return { num, den };
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        submitAnswer();
      } else {
        onNext();
      }
    }
  }

  function submitAnswer() {
    const answer = answerIsFraction
      ? `${numInput.trim()}/${denInput.trim()}`
      : input.trim();
    onSubmit(answer);
  }

  $effect(() => {
    if (feedback === null) {
      firstInput?.focus();
    }
  });

  interface SupSeg {
    type: 'sup';
    base: string;
    exp: string;
  }
  interface FracSeg {
    type: 'frac';
    num: number;
    den: number | string;
  }
  interface SqrtSeg {
    type: 'sqrt';
    radicand: string;
  }
  interface TextSeg {
    type: 'text';
    text: string;
  }
  type Seg = SupSeg | FracSeg | SqrtSeg | TextSeg;

  function splitTerm(text: string): Seg[] {
    const segments: Seg[] = [];
    const regex = /\((\d+)\/(\d+)\)|(\d+)\/(\d+)|(\d+)\/([a-z])|\u221A\(([^)]*)\)|(\w+)\^\(([^)]*)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
      }
      if (match[1] !== undefined) {
        segments.push({ type: 'frac', num: parseInt(match[1], 10), den: parseInt(match[2], 10) });
      } else if (match[3] !== undefined) {
        segments.push({ type: 'frac', num: parseInt(match[3], 10), den: parseInt(match[4], 10) });
      } else if (match[5] !== undefined && match[6] !== undefined) {
        segments.push({ type: 'frac', num: parseInt(match[5], 10), den: match[6] });
      } else if (match[7] !== undefined) {
        segments.push({ type: 'sqrt', radicand: match[7] });
      } else {
        segments.push({ type: 'sup', base: match[8], exp: match[9] });
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: 'text', text: text.slice(lastIndex) });
    }
    return segments;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if feedback === null}
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore', variable)}
    {#if valueFrac}
      <Fraction num={valueFrac.num} den={valueFrac.den} />
    {:else}
      {value}
    {/if}
    {_('exercise.substitution.promptAfter')}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  <p class="prompt fraction-prompt">
    {#each splitTerm(term) as seg, i (i)}
      {#if seg.type === 'frac'}
        <Fraction num={seg.num} den={seg.den} />
      {:else if seg.type === 'sqrt'}
        <Sqrt radicand={seg.radicand} />
      {:else if seg.type === 'sup'}
        <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
      {:else}
        {seg.text}
      {/if}
    {/each}
    <span class="equals"> = </span>
    {#if answerIsFraction}
      <span class="fraction-answer-inline">
        <input type="text" bind:value={numInput} bind:this={firstInput} />
        <span class="fraction-bar"></span>
        <input type="text" bind:value={denInput} />
      </span>
    {:else}
      <input type="text" bind:value={input} bind:this={firstInput} class="user-answer-input" />
    {/if}
  </p>
  <div class="submit-row">
    <button onclick={submitAnswer}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">
    {_('exercise.substitution.promptBefore', variable)}
    {#if valueFrac}
      <Fraction num={valueFrac.num} den={valueFrac.den} />
    {:else}
      {value}
    {/if}
    {_('exercise.substitution.promptAfter')}
  </p>
  {#if complexity >= 5 && answerIsFraction}
    <p class="hint">{_('exercise.substitution.reduceHint')}</p>
  {/if}
  <p class="prompt fraction-prompt">
    {#each splitTerm(term) as seg, i (i)}
      {#if seg.type === 'frac'}
        <Fraction num={seg.num} den={seg.den} />
      {:else if seg.type === 'sqrt'}
        <Sqrt radicand={seg.radicand} />
      {:else if seg.type === 'sup'}
        <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
      {:else}
        {seg.text}
      {/if}
    {/each}
    <span class="equals"> = </span>
    {#if answerIsFraction}
      <Fraction num={numInput || '0'} den={denInput || '1'} />
    {:else}
      <span class="user-answer">{input || '\u00A0'}</span>
    {/if}
  </p>
  <div class="feedback-row">
    <p class="feedback {feedback}">
      {feedback === 'correct'
        ? _('feedback.correct')
        : _('feedback.incorrect', exercise.answer)}
    </p>
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .prompt-label {
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.85rem;
    color: var(--pico-muted-color, #777);
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .equals {
    font-size: 1.5rem;
  }

  .user-answer {
    font-size: 1.5rem;
  }

  .superscript {
    font-size: 0.75em;
    vertical-align: super;
    line-height: 1;
  }

  .fraction-answer-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .fraction-answer-inline input {
    width: 5rem;
    text-align: center;
  }

  .fraction-answer-inline .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
  }

  .user-answer-input {
    width: 6rem;
    text-align: center;
    font-size: 1.5rem;
  }
</style>
