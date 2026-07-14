<script lang="ts">
  import type { ExerciseProps } from '../../types';
  import TextInputCard from './TextInputCard.svelte';
  import FractionInputCard from './FractionInputCard.svelte';
  import MultiFieldCard from './MultiFieldCard.svelte';
  import BatchChoiceCard from './BatchChoiceCard.svelte';
  import SingleChoiceCard from './SingleChoiceCard.svelte';
  import MultiChoiceCard from './MultiChoiceCard.svelte';
  import PrimeFactorsCard from './PrimeFactorsCard.svelte';

  let { exercise, onSubmit, onNext, feedback }: ExerciseProps = $props();

  const pattern = $derived(exercise.pattern);
</script>

{#if pattern === 'text-input'}
  <TextInputCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'fraction-input'}
  <FractionInputCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'multi-field'}
  <MultiFieldCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'batch-choice'}
  <BatchChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'single-choice'}
  <SingleChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'multi-choice'}
  <MultiChoiceCard {exercise} {onSubmit} {onNext} {feedback} />
{:else if pattern === 'prime-factors'}
  <PrimeFactorsCard {exercise} {onSubmit} {onNext} {feedback} />
{/if}
