import type { Lang } from './types';

const dict = {
  'app.title': { en: 'mgrind', de: 'mgrind' },
  'discipline.numbers.name': { en: 'Numbers', de: 'Zahlen' },
  'exercise.multiplication.name': { en: 'Multiplication', de: 'Multiplikation' },
  'exercise.multiplication.desc': { en: 'Solve multiplication problems', de: 'Löse Multiplikationsaufgaben' },
  'exercise.division.name': { en: 'Division', de: 'Division' },
  'exercise.division.desc': {
    en: 'Solve division problems',
    de: 'Löse Divisionsaufgaben',
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
  'exercise.multiplicationFraction.desc': {
    en: 'Multiply fractions and simplify',
    de: 'Multipliziere und kürze Brüche',
  },
  'exercise.multiplicationFraction.prompt': { en: 'Multiply and simplify', de: 'Multipliziere und kürze' },
  'exercise.substitution.name': { en: 'Substitution', de: 'Einsetzen' },
  'exercise.substitution.desc': {
    en: 'Substitute a value into an expression',
    de: 'Setze einen Wert in einen Term ein',
  },
  'exercise.substitution.promptBefore': {
    en: 'Substitute ',
    de: 'Setze ',
  },
  'exercise.substitution.promptAfter': {
    en: '',
    de: ' ein',
  },
  'exercise.substitution.reduceHint': {
    en: 'Enter the result as a reduced fraction',
    de: 'Gib das Ergebnis als gekürzten Bruch ein',
  },
  'discipline.algebra.name': { en: 'Algebra', de: 'Algebra' },
  'exercise.squares.name': { en: 'Squares', de: 'Quadrate' },
  'exercise.squares.desc': { en: 'Compute squares of numbers', de: 'Berechne Quadrate von Zahlen' },
  'exercise.orderOfOperations.name': { en: 'Order of Operations', de: 'Rechenregeln' },
  'exercise.orderOfOperations.desc': {
    en: 'Apply the order of operations',
    de: 'Wende die Rechenregeln an',
  },
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
  exerciseTypes: { en: 'Exercise Types', de: 'Übungstypen' },
  'exerciseTypes.someDisabled': { en: 'Some disabled', de: 'Einige deaktiviert' },
  'exercise.locked': { en: 'Locked', de: 'Gesperrt' },
  'exercise.prerequisitesNotMet': { en: 'Prerequisites not met', de: 'Voraussetzungen nicht erfüllt' },
  'exercise.prerequisiteLine': {
    en: '{0} at level {1} (currently {2})',
    de: '{0} auf Stufe {1} (aktuell {2})',
  },
  'exercise.enableNow': { en: 'Enable anyway', de: 'Trotzdem aktivieren' },
  'exercise.enableNow.warning': {
    en: 'This exercise can be enabled anyway. This will increase the progress of prerequisite exercises artificially.',
    de: 'Diese Übung kann trotzdem aktiviert werden. Dadurch wird der Fortschritt der Voraussetzungen künstlich erhöht.',
  },
  'settings.resetProgress': { en: 'Reset progress', de: 'Fortschritt zurücksetzen' },
  'settings.resetProgress.confirm': {
    en: 'Are you sure you want to reset all progress? This cannot be undone.',
    de: 'Bist du sicher, dass du den gesamten Fortschritt zurücksetzen möchtest? Dies kann nicht rückgängig gemacht werden.',
  },
  'settings.resetProgress.confirmButton': { en: 'Reset', de: 'Zurücksetzen' },
  'settings.cancel': { en: 'Cancel', de: 'Abbrechen' },
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
