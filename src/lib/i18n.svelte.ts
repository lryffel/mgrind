import type { Lang } from './types';

const dict = {
  'app.title': { en: 'mgrind', de: 'mgrind' },
  'discipline.multiplication.name': { en: 'Multiplication Tables', de: 'Einmaleins' },
  'exercise.multiplication.name': { en: 'Multiplication Facts', de: 'Multiplikation' },
  'exercise.multiplication.desc': { en: 'Solve multiplication problems', de: 'Löse Multiplikationsaufgaben' },
  'exercise.multiplicationMissingFactor.name': { en: 'Missing Factor', de: 'Fehlender Faktor' },
  'exercise.multiplicationMissingFactor.desc': {
    en: 'Find the missing factor in a multiplication',
    de: 'Finde den fehlenden Faktor',
  },
  'exercise.primeFactorisation.name': { en: 'Prime Factorisation', de: 'Primfaktorzerlegung' },
  'exercise.primeFactorisation.desc': { en: 'Find the prime decomposition', de: 'Bestimme die Primfaktorzerlegung' },
  'discipline.fractions.name': { en: 'Fractions', de: 'Bruchrechnen' },
  'exercise.simplifyFraction.name': { en: 'Simplify Fractions', de: 'Brüche kürzen' },
  'exercise.simplifyFraction.desc': { en: 'Simplify fractions to their lowest terms', de: 'Kürze Brüche vollständig' },
  'exercise.additionFraction.name': { en: 'Adding Fractions', de: 'Brüche addieren' },
  'exercise.additionFraction.desc': { en: 'Add fractions and simplify', de: 'Addiere und kürze Brüche' },
  'exercise.additionFraction.prompt': { en: 'Add and simplify', de: 'Addiere und kürze' },
  'exercise.subtractionFraction.name': { en: 'Subtracting Fractions', de: 'Brüche subtrahieren' },
  'exercise.subtractionFraction.desc': { en: 'Subtract fractions and simplify', de: 'Subtrahiere und kürze Brüche' },
  'exercise.subtractionFraction.prompt': { en: 'Subtract and simplify', de: 'Subtrahiere und kürze' },
  'exercise.multiplicationFraction.name': { en: 'Multiplying Fractions', de: 'Brüche multiplizieren' },
  'exercise.multiplicationFraction.desc': { en: 'Multiply fractions and simplify', de: 'Multipliziere und kürze Brüche' },
  'exercise.multiplicationFraction.prompt': { en: 'Multiply and simplify', de: 'Multipliziere und kürze' },
  'feedback.negativeDenominator': {
    en: 'Signs should be put in the numerator if possible: {0}',
    de: 'Vorzeichen sollten wenn möglich in den Zähler platziert werden: {0}',
  },
  'exercise.simplifyFraction.prompt': { en: 'Simplify', de: 'Kürze' },
  'exercise.primeFactorisation.prompt': {
    en: 'Find the prime decomposition of',
    de: 'Bestimme die Primfaktorzerlegung von',
  },
  'answer.submit': { en: 'Submit', de: 'Bestätigen' },
  'answer.next': { en: 'Next', de: 'Weiter' },
  'feedback.correct': { en: 'Correct!', de: 'Richtig!' },
  'feedback.incorrect': { en: 'Incorrect. The answer was {0}.', de: 'Falsch. Die Antwort war {0}.' },
  'progress.percent': { en: 'Progress: {0}%', de: 'Fortschritt: {0}%' },
  back: { en: 'Back', de: 'Zurück' },
  'lang.switch': { en: 'DE', de: 'EN' },
  'select.discipline': { en: 'Select a discipline', de: 'Wähle eine Disziplin' },
} satisfies Record<string, Record<Lang, string>>;

export const state = $state({ lang: 'en' as Lang });

export function _(key: string, ...args: (string | number)[]): string {
  let text = (dict as Record<string, Record<Lang, string>>)[key]?.[state.lang] ?? key;
  for (let i = 0; i < args.length; i++) {
    text = text.replace(`{${i}}`, String(args[i]));
  }
  return text;
}

export function setLang(l: Lang) {
  state.lang = l;
  try {
    localStorage.setItem('mgrind-lang', l);
  } catch {
    /* ignore */
  }
}

export function initLang() {
  try {
    const stored = localStorage.getItem('mgrind-lang');
    if (stored === 'en' || stored === 'de') {
      state.lang = stored;
    }
  } catch {
    /* ignore */
  }
}
