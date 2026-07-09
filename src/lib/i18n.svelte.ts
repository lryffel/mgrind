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
  'exercise.additionFraction.prompt': { en: 'Add and simplify.', de: 'Addiere und kürze.' },
  'exercise.subtractionFraction.name': { en: 'Subtracting Fractions', de: 'Brüche subtrahieren' },
  'exercise.subtractionFraction.desc': { en: 'Subtract fractions and simplify', de: 'Subtrahiere und kürze Brüche' },
  'exercise.subtractionFraction.prompt': { en: 'Subtract and simplify.', de: 'Subtrahiere und kürze.' },
  'exercise.multiplicationFraction.name': { en: 'Multiplying Fractions', de: 'Brüche multiplizieren' },
  'exercise.multiplicationFraction.desc': {
    en: 'Multiply fractions and simplify',
    de: 'Multipliziere und kürze Brüche',
  },
  'exercise.multiplicationFraction.prompt': { en: 'Multiply and simplify.', de: 'Multipliziere und kürze.' },
  'exercise.binomialFormulas.name': { en: 'Binomial Formulas', de: 'Binomische Formeln' },
  'exercise.binomialFormulas.desc': { en: 'Expand binomial formulas', de: 'Wende binomische Formeln an' },
  'exercise.binomialFormulas.prompt': { en: 'Expand.', de: 'Multipliziere aus.' },
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
  'exercise.collectingTerms.name': { en: 'Collecting terms', de: 'Terme zusammenfassen' },
  'exercise.collectingTerms.desc': {
    en: 'Collect like terms',
    de: 'Fasse gleiche Terme zusammen',
  },
  'exercise.collectingTerms.prompt': { en: 'Collect terms.', de: 'Fasse zusammen.' },
  'exercise.substitution.reduceHint': {
    en: 'Enter the result as a reduced fraction',
    de: 'Gib das Ergebnis als gekürzten Bruch ein',
  },
  'discipline.termTransformations.name': { en: 'Term transformations', de: 'Umformungen' },
  'discipline.equations.name': { en: 'Equations', de: 'Gleichungen' },
  'exercise.linearEquations.name': { en: 'Linear Equations', de: 'Lineare Gleichungen' },
  'exercise.linearEquations.desc': { en: 'Solve linear equations', de: 'Löse lineare Gleichungen' },
  'exercise.linearEquations.promptBefore': { en: 'Find ', de: 'Löse nach ' },
  'exercise.linearEquations.promptAfter': { en: '.', de: ' auf.' },
  'exercise.scientificNotation.name': { en: 'Scientific Notation', de: 'Wissenschaftliche Schreibweise' },
  'exercise.scientificNotation.desc': {
    en: 'Convert and compute with scientific notation',
    de: 'Wandle in wissenschaftliche Schreibweise um und rechne damit',
  },
  'exercise.scientificNotation.prompt.sciToDec': {
    en: 'Write in decimal notation.',
    de: 'Schreibe in Dezimalschreibweise.',
  },
  'exercise.scientificNotation.prompt.decToSci': {
    en: 'Write in scientific notation.',
    de: 'Schreibe in wissenschaftlicher Schreibweise.',
  },
  'exercise.scientificNotation.prompt.multiply': {
    en: 'Multiply. Write the result in scientific notation.',
    de: 'Multipliziere. Schreibe das Ergebnis in wissenschaftlicher Schreibweise.',
  },
  'exercise.scientificNotation.prompt.add': {
    en: 'Add. Write the result in scientific notation.',
    de: 'Addiere. Schreibe das Ergebnis in wissenschaftlicher Schreibweise.',
  },
  'exercise.squares.name': { en: 'Squares', de: 'Quadrate' },
  'exercise.squares.desc': { en: 'Compute squares of numbers', de: 'Berechne Quadrate von Zahlen' },
  'exercise.orderOfOperations.name': { en: 'Order of Operations', de: 'Rechenregeln' },
  'exercise.orderOfOperations.desc': {
    en: 'Apply the order of operations',
    de: 'Wende die Rechenregeln an',
  },
  'feedback.negativeDenominator.prefix': {
    en: 'Signs should be put in the numerator if possible: ',
    de: 'Vorzeichen sollten wenn möglich in den Zähler platziert werden: ',
  },
  'exercise.simplifyFraction.prompt': { en: 'Simplify.', de: 'Kürze.' },
  'exercise.primeFactorisation.prompt': {
    en: 'Find the prime decomposition.',
    de: 'Bestimme die Primfaktorzerlegung.',
  },
  'answer.submit': { en: 'Submit', de: 'Bestätigen' },
  'answer.next': { en: 'Next', de: 'Weiter' },
  'feedback.correct': { en: 'Correct!', de: 'Richtig!' },
  'feedback.correct.primeFactorisation': {
    en: 'Correct! The prime factorisation is ',
    de: 'Richtig! Die Primfaktorzerlegung ist ',
  },
  'feedback.incorrect': { en: 'Incorrect. The answer was {0}.', de: 'Falsch. Die Antwort war {0}.' },
  'feedback.incorrect.prefix': { en: 'Incorrect. The answer was ', de: 'Falsch. Die Antwort war ' },
  'feedback.incorrect.suffix': { en: '.', de: '.' },
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
  'exercise.factoringBinomialFormulas.name': {
    en: 'Factoring with Binomial Formulas',
    de: 'Faktorisieren mit binomischen Formeln',
  },
  'exercise.factoringBinomialFormulas.desc': {
    en: 'Factor expressions using binomial formulas',
    de: 'Faktorisiere Terme mit binomischen Formeln',
  },
  'exercise.factoringBinomialFormulas.formula1': { en: '1. binomial formula', de: '1. binomische Formel' },
  'exercise.factoringBinomialFormulas.formula2': { en: '2. binomial formula', de: '2. binomische Formel' },
  'exercise.factoringBinomialFormulas.formula3': { en: '3. binomial formula', de: '3. binomische Formel' },
  'exercise.factoringBinomialFormulas.noFormula': { en: 'no binomial formula', de: 'keine binomische Formel' },
  'exercise.factoringBinomialFormulas.noFormulaHint': {
    en: 'Select this if the expression does not match any binomial formula.',
    de: 'Wähle dies, wenn der Term auf keine binomische Formel passt.',
  },
  'exercise.factoringBinomialFormulas.prompt': { en: 'Factor.', de: 'Faktorisiere.' },
  'exercise.factoringBinomialFormulas.noFormulaFeedback': {
    en: 'no binomial formula applies',
    de: 'keine binomische Formel anwendbar',
  },
  'exercise.expand.name': { en: 'Expand', de: 'Ausmultiplizieren' },
  'exercise.expand.desc': {
    en: 'Expand products of algebraic expressions',
    de: 'Multipliziere Produkte von Termen aus',
  },
  'exercise.expand.prompt': { en: 'Expand.', de: 'Multipliziere aus.' },
  'exercise.expandAndCollect.name': { en: 'Expand and Collect', de: 'Ausmultiplizieren & Zusammenfassen' },
  'exercise.expandAndCollect.desc': {
    en: 'Expand products and collect like terms',
    de: 'Multipliziere aus und fasse gleiche Terme zusammen',
  },
  'exercise.expandAndCollect.prompt': {
    en: 'Expand the products and collect the terms.',
    de: 'Multipliziere aus und fasse zusammen.',
  },
  'exercise.factoringOut.name': { en: 'Factoring Out', de: 'Ausklammern' },
  'exercise.factoringOut.desc': {
    en: 'Factor out common monomials',
    de: 'Klammere gemeinsame Faktoren aus',
  },
  'exercise.factoringOut.noFactor': { en: 'No common factor', de: 'Kein gemeinsamer Faktor' },
  'exercise.factoringOut.prompt': {
    en: 'Factor out as much as possible.',
    de: 'Klammere so viel wie möglich aus.',
  },
  'exercise.factoringOutAndBinomial.name': {
    en: 'Factoring Out & Binomial Formulas',
    de: 'Ausklammern & Binomische Formeln',
  },
  'exercise.factoringOutAndBinomial.desc': {
    en: 'Factor out a common monomial and apply a binomial formula',
    de: 'Klammere aus und wende eine binomische Formel an',
  },
  'exercise.factoringOutAndBinomial.afterFactoring': {
    en: 'After factoring out:',
    de: 'Nach Ausklammern:',
  },
  'exercise.factoringOutAndBinomial.prompt': {
    en: 'Factor as much as possible.',
    de: 'Faktorisiere so weit wie möglich.',
  },
  'exercise.factoringOutAndBinomial.commonFactor': {
    en: 'Common factor:',
    de: 'Gemeinsamer Faktor:',
  },
  'exercise.factoringOutAndBinomial.formula': {
    en: 'Formula:',
    de: 'Formel:',
  },
  'exercise.factorEquations.name': {
    en: 'Factor Equations',
    de: 'Gleichungen faktorisieren',
  },
  'exercise.factorEquations.desc': {
    en: 'Solve equations by factoring',
    de: 'Löse Gleichungen durch Faktorisieren',
  },
  'exercise.factorEquations.prompt': {
    en: 'Solve by factoring.',
    de: 'Löse durch Faktorisieren.',
  },
  'exercise.necessityOfParentheses.name': {
    en: 'Necessity of Parentheses',
    de: 'Notwendigkeit von Klammern',
  },
  'exercise.necessityOfParentheses.desc': {
    en: 'Decide whether parentheses are necessary in algebraic expressions',
    de: 'Entscheide, ob Klammern in algebraischen Ausdrücken nötig sind',
  },
  'exercise.necessityOfParentheses.prompt': {
    en: 'Are the parentheses necessary?',
    de: 'Sind die Klammern nötig?',
  },
  'answer.yes': { en: 'Yes', de: 'Ja' },
  'answer.no': { en: 'No', de: 'Nein' },
  help: { en: 'Help', de: 'Hilfe' },
  'theme.toggle': { en: 'Toggle theme', de: 'Theme wechseln' },
  settings: { en: 'Settings', de: 'Einstellungen' },
  'discipline.geometry.name': { en: 'Geometry', de: 'Geometrie' },
  'exercise.interiorAngles.name': { en: 'Interior Angles', de: 'Innenwinkel' },
  'exercise.interiorAngles.desc': {
    en: 'Find the missing interior angle of a polygon',
    de: 'Bestimme den fehlenden Innenwinkel eines Vielecks',
  },
  'exercise.interiorAngles.prompt': { en: 'Find the missing angle.', de: 'Bestimme den fehlenden Winkel.' },
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
