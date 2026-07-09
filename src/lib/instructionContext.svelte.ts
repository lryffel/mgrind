import type { Component } from 'svelte';

class InstructionContext {
  currentInstructionComponent = $state<Component | undefined>();
}

export const instructionContext = new InstructionContext();
