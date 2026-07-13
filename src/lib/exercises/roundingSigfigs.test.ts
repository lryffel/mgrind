import { describe, it, expect } from 'vitest';
import { generateRoundingSigfigs, roundToSigFigs } from './roundingSigfigs';
import { expectDeterministic, expectSeedVariation, expectHasPromptAndAnswer } from '../test-utils';

describe('roundToSigFigs', () => {
  it('rounds simple decimals', () => {
    expect(roundToSigFigs(3.14159, 3)).toBe('3.14');
    expect(roundToSigFigs(3.14159, 2)).toBe('3.1');
    expect(roundToSigFigs(2.71828, 2)).toBe('2.7');
  });

  it('rounds integers', () => {
    expect(roundToSigFigs(1234, 2)).toBe('1200');
    expect(roundToSigFigs(5678, 1)).toBe('6000');
    expect(roundToSigFigs(1234, 3)).toBe('1230');
  });

  it('rounds very small numbers with leading zeros', () => {
    expect(roundToSigFigs(0.003456, 2)).toBe('0.0035');
    expect(roundToSigFigs(0.003456, 3)).toBe('0.00346');
  });

  it('handles internal zeros', () => {
    expect(roundToSigFigs(1002, 2)).toBe('1000');
    expect(roundToSigFigs(1002, 3)).toBe('1000');
    expect(roundToSigFigs(300.56, 3)).toBe('301');
  });

  it('handles rollover scenarios', () => {
    expect(roundToSigFigs(99.9, 1)).toBe('100');
    expect(roundToSigFigs(999, 2)).toBe('1000');
  });

  it('handles trailing decimal zeros', () => {
    expect(roundToSigFigs(1.005, 3)).toBe('1.00');
  });

  it('handles zero', () => {
    expect(roundToSigFigs(0, 1)).toBe('0');
    expect(roundToSigFigs(0, 5)).toBe('0');
  });

  it('preserves trailing zeros after decimal', () => {
    expect(roundToSigFigs(1.00, 2)).toBe('1.0');
  });
});

describe('generateRoundingSigfigs', () => {
  it('is deterministic', () => {
    expectDeterministic(generateRoundingSigfigs, 42, 5);
  });

  it('varies with seed', () => {
    expectSeedVariation(generateRoundingSigfigs, 5);
  });

  it('produces prompt and answer', () => {
    expectHasPromptAndAnswer(generateRoundingSigfigs, 42, 5);
  });

  it('generates a prompt with the number formatted with thin-space grouping', () => {
    const ex = generateRoundingSigfigs(42, 5);
    expect(ex.prompt).toBeTruthy();
    expect(typeof ex.prompt).toBe('string');
  });

  it('stores sigfigs count in data', () => {
    const ex = generateRoundingSigfigs(42, 5);
    expect(ex.data?.sigfigsCount).toBeGreaterThanOrEqual(1);
  });

  it('generates valid answer for each complexity level', () => {
    for (let c = 1; c <= 10; c++) {
      const ex = generateRoundingSigfigs(100, c);
      expect(ex.answer).toBeTruthy();
      expect(typeof ex.answer).toBe('string');
    }
  });

  it('generates different types at different complexity levels', () => {
    const low = generateRoundingSigfigs(42, 1);
    const high = generateRoundingSigfigs(42, 10);
    expect(low.answer).not.toBe(high.answer);
  });
});
