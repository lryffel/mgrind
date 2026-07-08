<script lang="ts">
  import { _ } from '../../i18n.svelte';
  import type { Exercise } from '../../types';
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

  let userInput = $state('');
  let inputEl = $state<HTMLInputElement>();

  $effect(() => {
    if (feedback === null) {
      inputEl?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedback === null) {
        onSubmit(userInput.trim());
      } else {
        onNext();
      }
    }
  }

  interface SupSeg {
    type: 'sup';
    base: string;
    exp: string;
  }
  interface SqrtSeg {
    type: 'sqrt';
    radicand: string;
  }
  interface TextSeg {
    type: 'text';
    text: string;
  }
  type Seg = SupSeg | SqrtSeg | TextSeg;

  function splitText(text: string): Seg[] {
    const segments: Seg[] = [];
    const regex = /(\w+)\^\(([^)]*)\)|\u221A\(([^)]*)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
      }
      if (match[1] !== undefined) {
        segments.push({ type: 'sup', base: match[1], exp: match[2] });
      } else {
        segments.push({ type: 'sqrt', radicand: match[3] });
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
  {#if exercise.prompt.includes('?')}
    {@const parts = exercise.prompt.split('?')}
    <p class="prompt">
      {#each splitText(parts[0]) as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
      <input type="text" class="inline-input" bind:value={userInput} bind:this={inputEl} />
      {#each splitText(parts[1] ?? '') as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
    </p>
    <div class="submit-row">
      <button onclick={() => onSubmit(userInput.trim())}>{_('answer.submit')}</button>
    </div>
  {:else}
    <p class="prompt">
      {#each splitText(exercise.prompt) as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
    </p>
    <div role="group" class="answer-row">
      <input type="text" class="answer-input" bind:value={userInput} bind:this={inputEl} />
      <button onclick={() => onSubmit(userInput.trim())}>{_('answer.submit')}</button>
    </div>
  {/if}
{:else}
  {#if exercise.prompt.includes('?')}
    {@const parts = exercise.prompt.split('?')}
    <p class="prompt">
      {#each splitText(parts[0]) as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
      {userInput}
      {#each splitText(parts[1] ?? '') as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
    </p>
  {:else}
    <p class="prompt">
      {#each splitText(exercise.prompt) as seg, i (i)}
        {#if seg.type === 'sup'}
          <span>{seg.base}<sup class="superscript">{seg.exp}</sup></span>
        {:else if seg.type === 'sqrt'}
          <Sqrt radicand={seg.radicand} />
        {:else}
          {seg.text}
        {/if}
      {/each}
    </p>
  {/if}
  <div class="feedback-row">
    <p class="feedback {feedback}">
      {feedback === 'correct' ? _('feedback.correct') : _('feedback.incorrect', exercise.answer)}
    </p>
    <button onclick={onNext}>{_('answer.next')}</button>
  </div>
{/if}

<style>
  .answer-input {
    width: 150px;
    text-align: center;
  }

  .inline-input {
    width: 5rem;
    text-align: center;
  }

  .superscript {
    font-size: 0.75em;
    vertical-align: super;
    line-height: 1;
  }
</style>
