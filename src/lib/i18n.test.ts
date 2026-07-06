import { describe, it, expect, beforeEach } from 'vitest';
import { _, setLang, initLang, state } from './i18n.svelte';

beforeEach(() => {
  state.lang = 'en';
  localStorage.clear();
});

describe('i18n', () => {
  it('returns the key if no translation is found', () => {
    expect(_('nonexistent.key')).toBe('nonexistent.key');
  });

  it('returns English text by default', () => {
    expect(_('app.title')).toBe('mgrind');
    expect(_('discipline.multiplication.name')).toBe('Multiplication Tables');
  });

  it('returns German text after switching language', () => {
    setLang('de');
    expect(_('app.title')).toBe('mgrind');
    expect(_('discipline.multiplication.name')).toBe('Einmaleins');
    expect(_('select.discipline')).toBe('Wähle eine Disziplin');
  });

  it('interpolates positional arguments', () => {
    expect(_('feedback.incorrect', '42')).toBe('Incorrect. The answer was 42.');
    expect(_('progress.percent', '75')).toBe('Progress: 75%');
  });

  it('persists language in localStorage', () => {
    setLang('de');
    expect(localStorage.getItem('mgrind-lang')).toBe('de');
  });

  it('restores language from localStorage on init', () => {
    localStorage.setItem('mgrind-lang', 'de');
    initLang();
    expect(state.lang).toBe('de');
  });

  it('ignores invalid stored language', () => {
    localStorage.setItem('mgrind-lang', 'fr');
    state.lang = 'en';
    initLang();
    expect(state.lang).toBe('en');
  });

  it('handles missing localStorage gracefully', () => {
    const orig = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('no access');
    };
    expect(() => initLang()).not.toThrow();
    expect(state.lang).toBe('en');
    localStorage.getItem = orig;
  });

  it('toggles language', () => {
    setLang('de');
    expect(state.lang).toBe('de');
    setLang('en');
    expect(state.lang).toBe('en');
  });
});
