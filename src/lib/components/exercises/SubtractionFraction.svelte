<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';

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

  let numInput = $state(0);
  let denInput = $state(0);
  let numInputEl = $state<HTMLInputElement>();

  const opMatch = $derived(exercise.prompt.match(/^(\d+)\/(\d+)([+\-*/])(\d+)\/(\d+)$/));
  const num1 = $derived(Number(opMatch![1]));
  const den1 = $derived(Number(opMatch![2]));
  const op = $derived(opMatch![3]);
  const num2 = $derived(Number(opMatch![4]));
  const den2 = $derived(Number(opMatch![5]));
  const correctNumDen = $derived(exercise.answer.split(','));
  const promptKey = $derived((exercise.data?.promptKey as string | undefined) ?? 'exercise.subtractionFraction.prompt');

  const hasNegativeDenominator = $derived(
    feedback === 'correct' && (denInput < 0 || (numInput < 0 && denInput < 0))
  );
  const normalizedWarning = $derived(
    hasNegativeDenominator
      ? `${denInput < 0 ? -numInput : numInput}/${denInput < 0 ? -denInput : denInput}`
      : ''
  );

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(`${numInput},${denInput}`);
      } else {
        onNext();
      }
    }
  }

  $effect(() => {
    if (feedback === null) {
      numInputEl?.focus();
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if feedback === null}
  <p class="prompt-label">{_(promptKey)}</p>
  <p class="prompt fraction-prompt">
    <span class="fraction">
      <span class="num">{num1}</span>
      <span class="fraction-bar"></span>
      <span class="den">{den1}</span>
    </span>
    <span class="op">{op}</span>
    <span class="fraction">
      <span class="num">{num2}</span>
      <span class="fraction-bar"></span>
      <span class="den">{den2}</span>
    </span>
    <span class="equals">=</span>
    <span class="fraction-answer-inline">
      <input
        type="number"
        class="fraction-num"
        bind:value={numInput}
        bind:this={numInputEl}
      />
      <span class="fraction-bar"></span>
      <input type="number" class="fraction-den" bind:value={denInput} />
    </span>
  </p>
  <div class="submit-row">
    <button onclick={() => onSubmit(`${numInput},${denInput}`)}>{_('answer.submit')}</button>
  </div>
{:else}
  <p class="prompt-label">{_(promptKey)}</p>
  <p class="prompt fraction-prompt">
    <span class="fraction">
      <span class="num">{num1}</span>
      <span class="fraction-bar"></span>
      <span class="den">{den1}</span>
    </span>
    <span class="op">{op}</span>
    <span class="fraction">
      <span class="num">{num2}</span>
      <span class="fraction-bar"></span>
      <span class="den">{den2}</span>
    </span>
    <span class="equals">=</span>
    <span class="fraction">
      <span class="num">{numInput}</span>
      <span class="fraction-bar"></span>
      <span class="den">{denInput}</span>
    </span>
  </p>
  {#if hasNegativeDenominator}
    <p class="feedback correct">
      {_('feedback.correct')}
    </p>
    <p class="feedback warning">
      {_('feedback.negativeDenominator', normalizedWarning)}
    </p>
  {:else}
    <p class="feedback {feedback}">
      {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', `${correctNumDen[0]}/${correctNumDen[1]}`)}
    </p>
  {/if}
  <div class="submit-row">
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .prompt {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }

  .prompt-label {
    font-size: 1.125rem;
    font-weight: 400;
    opacity: 0.8;
    text-align: center;
    margin: 0 0 0.25rem 0;
  }

  .submit-row {
    display: flex;
    justify-content: center;
  }

  .fraction-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .fraction-prompt .equals,
  .fraction-prompt .op {
    font-size: 1.5rem;
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

  .fraction {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
  }

  .fraction .num,
  .fraction .den {
    padding: 0 0.5rem;
  }

  .fraction .fraction-bar,
  .fraction-bar {
    display: block;
    width: 100%;
    height: 2px;
    background: currentColor;
    min-width: 4rem;
  }

  .fraction-num {
    width: 5rem;
    text-align: center;
  }

  .fraction-den {
    width: 5rem;
    text-align: center;
  }

  .feedback {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
    text-align: center;
  }

  .feedback.correct {
    color: var(--pico-ins-color);
  }

  .feedback.incorrect {
    color: var(--pico-del-color);
  }

  .feedback.warning {
    color: var(--pico-warning-color, #f0a000);
    font-size: 1rem;
  }
</style>
