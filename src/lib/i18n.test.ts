import { describe, it, expect, beforeEach } from 'vitest';
import { _, setLang, initLang, state, type DictKey } from './i18n.svelte';

beforeEach(() => {
  state.lang = 'en';
  localStorage.clear();
});

describe('i18n', () => {
  it('returns the key as a defensive fallback when a dict key is missing at runtime', () => {
    const missing = 'nonexistent.key' as DictKey;
    expect(_(missing)).toBe('nonexistent.key');
  });

  it('returns English text by default', () => {
    expect(_('app.title')).toBe('mgrind');
    expect(_('discipline.numbers.name')).toBe('Numbers');
  });

  it('returns German text after switching language', () => {
    setLang('de');
    expect(_('app.title')).toBe('mgrind');
    expect(_('discipline.numbers.name')).toBe('Zahlen');
    expect(_('select.discipline')).toBe('Wähle eine Disziplin');
  });

  it('interpolates positional arguments', () => {
    expect(_('feedback.incorrect', '42')).toBe('The correct answer was: 42');
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

  it('translates decimal comma error', () => {
    expect(_('error.decimalComma')).toBe('Please use a period (.) instead of a comma (,)');
    setLang('de');
    expect(_('error.decimalComma')).toBe('Bitte benutze einen Punkt (.) anstelle eines Kommas (,)');
  });
});
