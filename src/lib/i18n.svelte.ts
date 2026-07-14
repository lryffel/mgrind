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
  'exercise.additionFraction.desc': {
    en: 'Add and subtract fractions and simplify',
    de: 'Addiere und subtrahiere Brüche und kürze',
  },
  'exercise.additionFraction.prompt': { en: 'Calculate and simplify.', de: 'Berechne und kürze.' },
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
  'exercise.substitution.prompt': {
    en: 'Substitute {0} = {1}.',
    de: 'Setze {0} = {1} ein.',
  },
  'exercise.substitution.promptTwo': {
    en: 'Substitute {0} = {1} and {2} = {3}.',
    de: 'Setze {0} = {1} und {2} = {3} ein.',
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
    en: 'Signs should be put in the numerator, or better yet in front of the fraction: ',
    de: 'Vorzeichen sollten wenn möglich in den Zähler, oder noch besser vor den Bruch, platziert werden: ',
  },
  'feedback.fractionCanReduce': {
    en: 'The fraction can be reduced: ',
    de: 'Der Bruch kann noch gekürzt werden: ',
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
  'feedback.incorrect': { en: 'The correct answer was: {0}', de: 'Die richtige Antwort war: {0}' },
  'feedback.incorrect.prefix': { en: 'The correct answer was: ', de: 'Die richtige Antwort war: ' },
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
  'exercise.factoringOut.commonVariable': { en: 'Common variable(s):', de: 'Gemeinsame Variablen:' },
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
  'exercise.pythagoras.name': { en: 'Pythagoras', de: 'Satz des Pythagoras' },
  'exercise.pythagoras.desc': {
    en: 'Apply the Pythagorean theorem',
    de: 'Wende den Satz des Pythagoras an',
  },
  'exercise.pythagoras.prompt': { en: 'Find the missing side length.', de: 'Bestimme die fehlende Seitenlänge.' },
  'exercise.pythagoras.cannotCompute': {
    en: 'Cannot be computed with the Pythagorean theorem',
    de: 'Kann nicht mit dem Satz des Pythagoras berechnet werden',
  },
  'feedback.pythagoras.cannotCompute': {
    en: 'Correct! Since no right angle is shown, the Pythagorean theorem cannot be applied.',
    de: 'Richtig! Da kein rechter Winkel eingezeichnet ist, kann der Satz des Pythagoras nicht angewendet werden.',
  },
  'exercise.pythagoras.cannotComputeShort': {
    en: "Doesn't work",
    de: 'Geht nicht',
  },
  'discipline.complete': { en: 'Complete!', de: 'Abgeschlossen!' },
  'error.decimalComma': {
    en: 'Please use a period (.) instead of a comma (,)',
    de: 'Bitte benutze einen Punkt (.) anstelle eines Kommas (,)',
  },
  'exercise.fractionTrivia.name': { en: 'Trivia: Fractions', de: 'Wissen: Brüche' },
  'exercise.fractionTrivia.desc': {
    en: 'Test your knowledge about fractions',
    de: 'Teste dein Wissen über Brüche',
  },
  'exercise.fractionTrivia.fractionTerms.name': { en: 'Fraction Terms', de: 'Fachbegriffe Brüche' },
  'exercise.fractionTrivia.fractionTerms.desc': {
    en: 'Name the parts of a fraction',
    de: 'Teile eines Bruchs benennen',
  },
  'exercise.fractionTrivia.integerFractions.name': { en: 'Integer Fractions', de: 'Ganze Brüche' },
  'exercise.fractionTrivia.integerFractions.desc': {
    en: 'Identify fractions that are always integers',
    de: 'Brüche erkennen, die immer ganzzahlig sind',
  },
  'exercise.fractionTrivia.denominatorRestriction.name': { en: 'Denominator Restriction', de: 'Nenner Einschränkung' },
  'exercise.fractionTrivia.denominatorRestriction.desc': {
    en: 'What number can never be in the denominator?',
    de: 'Welche Zahl darf nie im Nenner stehen?',
  },
  'exercise.fractionTrivia.doubleFraction.name': {
    en: 'Halve / Double a Fraction',
    de: 'Bruch halbieren / verdoppeln',
  },
  'exercise.fractionTrivia.doubleFraction.desc': {
    en: 'How to halve or double a fraction',
    de: 'Wie man einen Bruch halbiert oder verdoppelt',
  },
  'exercise.fractionTrivia.fractionBar.name': { en: 'Fraction Bar', de: 'Bruchstrich' },
  'exercise.fractionTrivia.fractionBar.desc': {
    en: 'What does the fraction bar mean?',
    de: 'Was bedeutet der Bruchstrich?',
  },
  'exercise.fractionTrivia.zeroNumerator.name': { en: 'Zero Numerator', de: 'Zähler Null' },
  'exercise.fractionTrivia.zeroNumerator.desc': {
    en: 'What happens when the numerator is zero?',
    de: 'Was passiert, wenn der Zähler null ist?',
  },
  'exercise.fractionTrivia.reciprocalProduct.name': { en: 'Reciprocal Product', de: 'Kehrwertprodukt' },
  'exercise.fractionTrivia.reciprocalProduct.desc': {
    en: 'What is a fraction times its reciprocal?',
    de: 'Was ist ein Bruch mal seinem Kehrwert?',
  },
  'exercise.fractionTrivia.multiplySame.name': {
    en: 'Multiply Numerator & Denominator',
    de: 'Zähler & Nenner multiplizieren',
  },
  'exercise.fractionTrivia.multiplySame.desc': {
    en: 'Effect of multiplying numerator and denominator by the same number',
    de: 'Wirkung von Zähler- und Nennermultiplikation mit derselben Zahl',
  },
  'exercise.fractionTrivia.fractionDivision.name': { en: 'Fraction Division', de: 'Bruchdivision' },
  'exercise.fractionTrivia.fractionDivision.desc': {
    en: 'How to divide fractions',
    de: 'Wie man Brüche dividiert',
  },
  'exercise.fractionTrivia.mediant.name': { en: 'Mediant', de: 'Mediante' },
  'exercise.fractionTrivia.mediant.desc': {
    en: 'What is the mediant of two fractions?',
    de: 'Was ist die Mediante zweier Brüche?',
  },
  'exercise.fractionTrivia.reducibleFractions.name': { en: 'Reducible Fractions', de: 'Kürzbare Brüche' },
  'exercise.fractionTrivia.reducibleFractions.desc': {
    en: 'Which fractions can be reduced?',
    de: 'Welche Brüche sind kürzbar?',
  },
  'exercise.fractionTrivia.negativeSignPlacement.name': {
    en: 'Negative Sign Placement',
    de: 'Minuszeichen Platzierung',
  },
  'exercise.fractionTrivia.negativeSignPlacement.desc': {
    en: 'Where can the minus sign be placed?',
    de: 'Wo kann das Minuszeichen stehen?',
  },
  'exercise.fractionTrivia.equalFractions.name': { en: 'Equal Fractions', de: 'Gleiche Brüche' },
  'exercise.fractionTrivia.equalFractions.desc': {
    en: 'Which of these fractions are equal?',
    de: 'Welche dieser Brüche sind gleich?',
  },
  'exercise.fractionTrivia.type.fractionTerms.prompt': {
    en: 'What are the terms for the top and bottom numbers in a fraction?',
    de: 'Wie heissen die obere und die untere Zahl eines Bruchs?',
  },
  'exercise.fractionTrivia.type.integerFractions.prompt': {
    en: 'Which of these fractions are always integers whenever n is an integer?',
    de: 'Welche dieser Brüche sind für jede ganze Zahl n ganzzahlig?',
  },
  'exercise.fractionTrivia.type.mediant.promptBefore': {
    en: 'For two fractions ',
    de: 'Für zwei Brüche ',
  },
  'exercise.fractionTrivia.type.mediant.promptMiddle': {
    en: ' and ',
    de: ' und ',
  },
  'exercise.fractionTrivia.type.mediant.promptAfter': {
    en: ', what can you say about ',
    de: ', was gilt für ',
  },
  'exercise.fractionTrivia.type.mediant.promptSuffix': {
    en: '?',
    de: '?',
  },
  'exercise.fractionTrivia.type.fractionDivision.promptBefore': {
    en: 'Write ',
    de: 'Schreibe ',
  },
  'exercise.fractionTrivia.type.fractionDivision.promptAfter': {
    en: ' as a fraction with integer numerator and denominator.',
    de: ' als Bruch mit ganzzahligem Zähler und Nenner.',
  },
  'exercise.fractionTrivia.type.equalFractions.promptBefore': {
    en: 'Which of these fractions is equal to ',
    de: 'Welche dieser Brüche sind gleich ',
  },
  'exercise.fractionTrivia.type.equalFractions.promptSuffix': {
    en: '?',
    de: '?',
  },
  'exercise.fractionTrivia.type.denominatorRestriction.prompt': {
    en: 'What number are denominators never allowed to be?',
    de: 'Welche Zahl darf im Nenner nie stehen?',
  },
  'exercise.fractionTrivia.type.doubleFraction.halveMC.prompt': {
    en: 'How do you halve a fraction?',
    de: 'Wie halbiert man einen Bruch?',
  },
  'exercise.fractionTrivia.type.doubleFraction.doubleMC.prompt': {
    en: 'How do you double a fraction?',
    de: 'Wie verdoppelt man einen Bruch?',
  },
  'exercise.fractionTrivia.type.multiplySame.prompt': {
    en: 'What happens to the value of a fraction when you multiply both numerator and denominator by the same non-zero number?',
    de: 'Was passiert mit dem Wert eines Bruchs, wenn man Zähler und Nenner mit derselben Zahl multipliziert?',
  },
  'exercise.fractionTrivia.type.multiplySame.reciprocal.prompt': {
    en: 'What happens when you multiply a fraction by its reciprocal?',
    de: 'Was passiert, wenn man einen Bruch mit seinem Kehrwert multipliziert?',
  },
  'exercise.fractionTrivia.type.fractionBar.prompt': {
    en: 'Which mathematical operation does the fraction bar represent?',
    de: 'Welche Rechenoperation stellt der Bruchstrich dar?',
  },
  'exercise.fractionTrivia.option.mediant.0': { en: 'Sum', de: 'Summe' },
  'exercise.fractionTrivia.option.mediant.1': { en: 'Product', de: 'Produkt' },
  'exercise.fractionTrivia.option.mediant.2': { en: 'Average', de: 'Mittelwert' },
  'exercise.fractionTrivia.option.mediant.3': { en: 'Between the two', de: 'Zwischen den beiden' },

  'exercise.fractionTrivia.option.halveFraction.0': { en: 'Halve the numerator', de: 'Zähler halbieren' },
  'exercise.fractionTrivia.option.halveFraction.1': { en: 'Double the denominator', de: 'Nenner verdoppeln' },
  'exercise.fractionTrivia.option.halveFraction.2': { en: 'Double the numerator', de: 'Zähler verdoppeln' },
  'exercise.fractionTrivia.option.halveFraction.3': { en: 'Halve the denominator', de: 'Nenner halbieren' },
  'exercise.fractionTrivia.option.halveFraction.4': {
    en: 'Double both numerator and denominator',
    de: 'Zähler und Nenner verdoppeln',
  },
  'exercise.fractionTrivia.option.halveFraction.5': {
    en: 'Halve both numerator and denominator',
    de: 'Zähler und Nenner halbieren',
  },
  'exercise.fractionTrivia.option.halveFraction.6': { en: 'None of the above', de: 'Keines davon' },
  'exercise.fractionTrivia.option.multiplySame.0': { en: 'It stays the same', de: 'Er bleibt gleich' },
  'exercise.fractionTrivia.option.multiplySame.1': { en: 'It doubles', de: 'Er verdoppelt sich' },
  'exercise.fractionTrivia.option.multiplySame.2': { en: 'It halves', de: 'Er halbiert sich' },
  'exercise.fractionTrivia.option.multiplySame.3': { en: 'It becomes 1', de: 'Er wird 1' },
  'exercise.fractionTrivia.option.fractionBar.0': { en: 'Addition', de: 'Addition' },
  'exercise.fractionTrivia.option.fractionBar.1': { en: 'Subtraction', de: 'Subtraktion' },
  'exercise.fractionTrivia.option.fractionBar.2': { en: 'Multiplication', de: 'Multiplikation' },
  'exercise.fractionTrivia.option.fractionBar.3': { en: 'Division', de: 'Division' },
  'exercise.fractionTrivia.type.reducibleFractions.prompt': {
    en: 'Which of these fractions can always be reduced?',
    de: 'Welche dieser Brüche kann man immer kürzen?',
  },
  'exercise.fractionTrivia.option.reducibleFractions.0': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.1': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.2': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.3': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.4': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.5': { en: '', de: '' },
  'exercise.fractionTrivia.option.reducibleFractions.6': { en: 'None of the above', de: 'Keines davon' },
  'exercise.fractionTrivia.option.fractionTerms.top': { en: 'Top', de: 'Oben' },
  'exercise.fractionTrivia.option.fractionTerms.topAnswer': { en: 'numerator', de: 'Zähler' },
  'exercise.fractionTrivia.option.fractionTerms.bottom': { en: 'Bottom', de: 'Unten' },
  'exercise.fractionTrivia.option.fractionTerms.bottomAnswer': { en: 'denominator', de: 'Nenner' },
  'exercise.fractionTrivia.type.zeroNumerator.promptBefore': {
    en: 'What is ',
    de: 'Was ist ',
  },
  'exercise.fractionTrivia.type.zeroNumerator.promptAfter': {
    en: ' for any non-zero integer n?',
    de: ' für eine ganze Zahl n ≠ 0?',
  },
  'exercise.fractionTrivia.type.reciprocalProduct.promptBefore': {
    en: 'What is ',
    de: 'Was ist ',
  },
  'exercise.fractionTrivia.type.reciprocalProduct.promptAfter': {
    en: '?',
    de: '?',
  },
  'exercise.fractionTrivia.type.reciprocalProduct.var.prompt': {
    en: 'What is a/b × b/a for non-zero integers a, b?',
    de: 'Was ist a/b × b/a für ganze Zahlen a, b ≠ 0?',
  },
  'exercise.fractionTrivia.type.negativeSignPlacement.promptBefore': {
    en: 'Which of these fractions is equal to ',
    de: 'Welche dieser Brüche sind gleich ',
  },
  'exercise.fractionTrivia.type.negativeSignPlacement.promptSuffix': {
    en: '?',
    de: '?',
  },
  'exercise.simplifySymbolicFraction.name': {
    en: 'Simplify Symbolic Fractions',
    de: 'Symbolische Brüche kürzen',
  },
  'exercise.simplifySymbolicFraction.desc': {
    en: 'Simplify fractions with variables using factoring, binomial formulas, and sign rules',
    de: 'Kürze Brüche mit Variablen durch Ausklammern, binomische Formeln und Vorzeichenregeln',
  },
  'exercise.simplifySymbolicFraction.prompt': {
    en: 'Simplify.',
    de: 'Kürze.',
  },
  'exercise.compareFractions.name': {
    en: 'Compare Fractions',
    de: 'Brüche vergleichen',
  },
  'exercise.compareFractions.desc': {
    en: 'Compare two fractions using <, >, or =',
    de: 'Vergleiche zwei Brüche mit <, > oder =',
  },
  'exercise.compareFractions.prompt': {
    en: 'Choose the correct comparison symbol.',
    de: 'Wähle das richtige Vergleichszeichen.',
  },
  'exercise.compareFractions.operatorSelect': {
    en: 'Comparison',
    de: 'Vergleich',
  },
  'exercise.signs.name': {
    en: 'Signs',
    de: 'Vorzeichen',
  },
  'exercise.signs.desc': {
    en: 'Determine the sign of expressions with negative numbers',
    de: 'Bestimme das Vorzeichen von Termen mit negativen Zahlen',
  },
  'exercise.signs.prompt': {
    en: 'Determine the sign.',
    de: 'Bestimme das Vorzeichen.',
  },
  'exercise.roundingSigfigs.name': { en: 'Significant digits', de: 'Signifikante Stellen' },
  'exercise.roundingSigfigs.desc': {
    en: 'Round numbers to a given number of significant digits.',
    de: 'Zahlen auf eine bestimmte Anzahl signifikanter Stellen runden.',
  },
  'exercise.roundingSigfigs.promptBefore': { en: 'Round ', de: 'Runde ' },
  'exercise.roundingSigfigs.promptBetween': { en: ' to ', de: ' auf ' },
  'exercise.roundingSigfigs.promptAfter': { en: ' significant digits.', de: ' signifikante Stellen.' },
  'signs.select': {
    en: 'Expression',
    de: 'Term',
  },
  'common.yes': { en: 'Yes', de: 'Ja' },
  'common.no': { en: 'No', de: 'Nein' },
  'common.true': { en: 'True', de: 'Wahr' },
  'common.false': { en: 'False', de: 'Falsch' },
  'exercise.termTransformationsTrivia.name': { en: 'Trivia: Term Transformations', de: 'Wissen: Termumformungen' },
  'exercise.termTransformationsTrivia.desc': {
    en: 'Test your knowledge of term transformations and laws',
    de: 'Teste dein Wissen über Termumformungen und Gesetze',
  },
  'exercise.termTransformationsTrivia.whichLaw': {
    en: 'Which is the {0} {1}?',
    de: 'Welches ist das {0} {1}?',
  },
  'exercise.termTransformationsTrivia.whichLawNoOp': {
    en: 'Which is the {0}?',
    de: 'Welches ist das {0}?',
  },
  'exercise.termTransformationsTrivia.associativeLaw': { en: 'associative law', de: 'Assoziativgesetz' },
  'exercise.termTransformationsTrivia.commutativeLaw': { en: 'commutative law', de: 'Kommutativgesetz' },
  'exercise.termTransformationsTrivia.distributiveLaw': { en: 'distributive law', de: 'Distributivgesetz' },
  'exercise.termTransformationsTrivia.forAddition': { en: 'for addition', de: 'für die Addition' },
  'exercise.termTransformationsTrivia.forMultiplication': { en: 'for multiplication', de: 'für die Multiplikation' },
  'exercise.termTransformationsTrivia.whichAreValid': {
    en: 'Which of the following are valid laws? Mark each as yes or no.',
    de: 'Welche der folgenden Gesetze sind gültig? Markiere jedes mit Ja oder Nein.',
  },
  'exercise.termTransformationsTrivia.whatIsPowerLaw': {
    en: 'What is the {0} power law?',
    de: 'Was ist das {0} Potenzgesetz?',
  },
  'exercise.termTransformationsTrivia.first': { en: 'first', de: 'erste' },
  'exercise.termTransformationsTrivia.second': { en: 'second', de: 'zweite' },
  'exercise.termTransformationsTrivia.third': { en: 'third', de: 'dritte' },
  'exercise.termTransformationsTrivia.hintLabel': { en: 'Hint', de: 'Hinweis' },
  'exercise.termTransformationsTrivia.hintProductSameBase': {
    en: 'Product of powers with the same base',
    de: 'Produkt von Potenzen mit gleicher Basis',
  },
  'exercise.termTransformationsTrivia.hintProductSameExp': {
    en: 'Product of powers with the same exponent',
    de: 'Produkt von Potenzen mit gleichem Exponenten',
  },
  'exercise.termTransformationsTrivia.hintPowerOfPower': {
    en: 'Power of a power',
    de: 'Potenz einer Potenz',
  },
  'exercise.termTransformationsTrivia.trueFalseCorrect': {
    en: 'See the correct answers above.',
    de: 'Siehe die richtigen Antworten oben.',
  },
  'exercise.gcdLcm.name': { en: 'gcd and lcm', de: 'ggT und kgV' },
  'exercise.gcdLcm.desc': { en: 'Find the gcd and lcm of two numbers', de: 'Bestimme ggT und kgV zweier Zahlen' },
  'exercise.gcdLcm.prompt': { en: 'Find the gcd and lcm.', de: 'Bestimme ggT und kgV.' },
  'exercise.gcdLcm.gcd': { en: 'gcd', de: 'ggT' },
  'exercise.gcdLcm.lcm': { en: 'lcm', de: 'kgV' },
  'exercise.numbersTrivia.name': { en: 'Trivia: Numbers', de: 'Wissen: Zahlen' },
  'exercise.numbersTrivia.desc': {
    en: 'Test your knowledge of number concepts',
    de: 'Teste dein Wissen über Zahlen',
  },
  'exercise.numbersTrivia.primeDivisors.name': { en: 'Prime Divisors', de: 'Primteiler' },
  'exercise.numbersTrivia.primeDivisors.desc': {
    en: 'How many divisors does a prime have?',
    de: 'Wie viele Teiler hat eine Primzahl?',
  },
  'exercise.numbersTrivia.trueFalse.name': { en: 'True or False', de: 'Wahr oder Falsch' },
  'exercise.numbersTrivia.trueFalse.desc': {
    en: 'Decide if statements about numbers are true or false',
    de: 'Entscheide, ob Aussagen über Zahlen wahr oder falsch sind',
  },
  'exercise.numbersTrivia.divisibilityRules.name': { en: 'Divisibility Rules', de: 'Teilbarkeitsregeln' },
  'exercise.numbersTrivia.divisibilityRules.desc': {
    en: 'Identify the correct divisibility rule',
    de: 'Erkenne die richtige Teilbarkeitsregel',
  },
  'exercise.numbersTrivia.isNatural.name': { en: 'Natural Numbers', de: 'Natürliche Zahlen' },
  'exercise.numbersTrivia.isNatural.desc': {
    en: 'Which numbers are natural?',
    de: 'Welche Zahlen sind natürlich?',
  },
  'exercise.numbersTrivia.isInteger.name': { en: 'Integers', de: 'Ganze Zahlen' },
  'exercise.numbersTrivia.isInteger.desc': {
    en: 'Which numbers are integers?',
    de: 'Welche Zahlen sind ganz?',
  },
  'exercise.numbersTrivia.isRational.name': { en: 'Rational Numbers', de: 'Rationale Zahlen' },
  'exercise.numbersTrivia.isRational.desc': {
    en: 'Which numbers are rational?',
    de: 'Welche Zahlen sind rational?',
  },
  'exercise.numbersTrivia.type.smallestNatural.prompt': {
    en: 'What is the smallest natural number?',
    de: 'Was ist die kleinste natürliche Zahl?',
  },
  'exercise.numbersTrivia.type.isNatural.prompt': {
    en: 'Are the following numbers natural?',
    de: 'Sind folgende Zahlen natürlich?',
  },
  'exercise.numbersTrivia.type.isInteger.prompt': {
    en: 'Are the following numbers integers?',
    de: 'Sind folgende Zahlen ganze Zahlen?',
  },
  'exercise.numbersTrivia.type.isRational.prompt': {
    en: 'Are the following numbers rational?',
    de: 'Sind folgende Zahlen rationale Zahlen?',
  },
  'exercise.numbersTrivia.type.primeDivisors.prompt': {
    en: 'How many positive divisors does a prime number have?',
    de: 'Wie viele positive Teiler hat eine Primzahl?',
  },
  'exercise.numbersTrivia.type.divisibilityRules.promptBefore': {
    en: 'Which of the following correctly determines whether a number is divisible by ',
    de: 'Welche der folgenden Aussagen bestimmt korrekt, ob eine Zahl durch ',
  },
  'exercise.numbersTrivia.type.divisibilityRules.promptAfter': {
    en: '?',
    de: ' teilbar ist?',
  },
  'exercise.simplifySymbolicFraction.cannotSimplify': {
    en: 'Cannot simplify',
    de: 'Nicht vereinfachbar',
  },
  'feedback.simplifySymbolicFraction.cannotSimplify': {
    en: 'Correct! This fraction cannot be simplified further.',
    de: 'Richtig! Dieser Bruch lässt sich nicht weiter vereinfachen.',
  },
  'feedback.simplifySymbolicFraction.cannotSimplify.incorrect': {
    en: 'This fraction cannot be simplified further. Click "Cannot simplify" instead.',
    de: 'Dieser Bruch lässt sich nicht weiter vereinfachen. Klicke stattdessen auf "Nicht vereinfachbar".',
  },
  'exercise.area.name': { en: 'Areas', de: 'Flächen' },
  'exercise.area.desc': {
    en: 'Compute areas of geometric shapes',
    de: 'Berechne Flächen von geometrischen Figuren',
  },
  'exercise.area.prompt': {
    en: 'Calculate the area.',
    de: 'Berechne den Flächeninhalt.',
  },
  'exercise.area.promptDim': {
    en: 'Find the missing length.',
    de: 'Finde die fehlende Länge.',
  },
  'exercise.percent.name': { en: 'Percentages', de: 'Prozentrechnen' },
  'exercise.percent.desc': {
    en: 'Solve percentage and ratio problems',
    de: 'Löse Prozent- und Verhältnisaufgaben',
  },
  'exercise.percent.prompt': { en: 'Calculate.', de: 'Berechne.' },
  'exercise.percent.variantA.before': { en: '', de: '' },
  'exercise.percent.variantA.between': { en: '% of ', de: '% von ' },
  'exercise.percent.variantA.after': { en: '', de: '' },
  'exercise.percent.variantB.before': { en: '', de: '' },
  'exercise.percent.variantB.between': { en: ' is ', de: ' ist ' },
  'exercise.percent.variantB.after': { en: '% of what number?', de: '% von welcher Zahl?' },
  'exercise.percent.variantC.before': { en: 'What % of ', de: 'Wie viel % von ' },
  'exercise.percent.variantC.between': { en: ' is ', de: ' sind ' },
  'exercise.percent.variantC.after': { en: '?', de: '?' },
  'exercise.percent.variantD.before': { en: '', de: '' },
  'exercise.percent.variantD.between1': { en: ' pieces cost CHF ', de: ' Stück kosten CHF ' },
  'exercise.percent.variantD.between2': { en: '. How much for ', de: '. Was kosten ' },
  'exercise.percent.variantD.after': { en: ' pieces?', de: ' Stück?' },
  'exercise.percent.variantE.before': { en: '', de: '' },
  'exercise.percent.variantE.between1': { en: ' workers need ', de: ' Arbeitende brauchen ' },
  'exercise.percent.variantE.between2': { en: ' h. How long for ', de: ' h. Wie lange brauchen ' },
  'exercise.percent.variantE.after': { en: ' workers?', de: ' Arbeitende?' },
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
