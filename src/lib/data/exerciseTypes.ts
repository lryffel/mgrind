import type { Component } from 'svelte';
import type { Exercise, ExerciseType, ExerciseProps, Prerequisite } from '../types';
import type { DictKey } from '../i18n.svelte';
import { generateMultiplication } from '../exercises/multiplication';
import { generateDivision } from '../exercises/division';
import { generatePrimeFactorisation } from '../exercises/primeFactorisation';
import { generateSquares } from '../exercises/squares';
import { generateOrderOfOperations } from '../exercises/orderOfOperations';
import { generateAdditionFraction } from '../exercises/additionFraction';
import { generateSimplifyFraction } from '../exercises/simplifyFraction';
import { generateMultiplicationFraction } from '../exercises/multiplicationFraction';
import { generateSubstitutionExercise, validateSubstitution } from '../exercises/substitution';
import { generateBinomialFormulas, validateBinomialFormulas } from '../exercises/binomialFormulas';
import { generateCollectingTerms, validateCollectingTerms } from '../exercises/collectingTerms';
import { generateScientificNotation } from '../exercises/scientificNotation';
import ScientificNotationExercise from '../components/exercises/ScientificNotationExercise.svelte';
import SymbolicFractionExercise from '../components/exercises/SymbolicFractionExercise.svelte';
import {
  generateFactoringBinomialFormulas,
  validateFactoringBinomialFormulas,
} from '../exercises/factoringBinomialFormulas';
import FactoringBinomialFormulas from '../components/exercises/FactoringBinomialFormulas.svelte';
import { generateFactoringOut, validateFactoringOut } from '../exercises/factoringOut';
import FactoringOut from '../components/exercises/FactoringOut.svelte';
import { generateFactoringOutAndBinomial, validateFactoringOutAndBinomial } from '../exercises/factoringOutAndBinomial';
import FactoringOutAndBinomial from '../components/exercises/FactoringOutAndBinomial.svelte';
import { generateFactorEquations, validateFactorEquations } from '../exercises/factorEquations';
import FactorEquations from '../components/exercises/FactorEquations.svelte';
import {
  generateNecessityOfParenthesesExercise,
  validateNecessityOfParentheses,
} from '../exercises/necessityOfParentheses';
import AdditionFractionInstructions from '../components/exerciseInstructions/AdditionFractionInstructions.svelte';
import SquaresInstructions from '../components/exerciseInstructions/SquaresInstructions.svelte';
import OrderOfOperationsInstructions from '../components/exerciseInstructions/OrderOfOperationsInstructions.svelte';
import PrimeFactorisationInstructions from '../components/exerciseInstructions/PrimeFactorisationInstructions.svelte';
import SimplifyFractionInstructions from '../components/exerciseInstructions/SimplifyFractionInstructions.svelte';
import MultiplicationFractionInstructions from '../components/exerciseInstructions/MultiplicationFractionInstructions.svelte';
import SubstitutionInstructions from '../components/exerciseInstructions/SubstitutionInstructions.svelte';
import CollectingTermsInstructions from '../components/exerciseInstructions/CollectingTermsInstructions.svelte';
import BinomialFormulasInstructions from '../components/exerciseInstructions/BinomialFormulasInstructions.svelte';
import ScientificNotationInstructions from '../components/exerciseInstructions/ScientificNotationInstructions.svelte';
import FactoringBinomialFormulasInstructions from '../components/exerciseInstructions/FactoringBinomialFormulasInstructions.svelte';
import FactoringOutInstructions from '../components/exerciseInstructions/FactoringOutInstructions.svelte';
import FactoringOutAndBinomialInstructions from '../components/exerciseInstructions/FactoringOutAndBinomialInstructions.svelte';
import ExpandInstructions from '../components/exerciseInstructions/ExpandInstructions.svelte';
import ExpandAndCollectInstructions from '../components/exerciseInstructions/ExpandAndCollectInstructions.svelte';
import LinearEquationsInstructions from '../components/exerciseInstructions/LinearEquationsInstructions.svelte';
import FactorEquationsInstructions from '../components/exerciseInstructions/FactorEquationsInstructions.svelte';
import { generateExpand, validateExpand } from '../exercises/expand';
import { generateExpandAndCollect, validateExpandAndCollect } from '../exercises/expandAndCollect';
import { generateLinearEquationsExercise, validateLinearEquations } from '../exercises/linearEquations';
import { generateInteriorAngles } from '../exercises/interiorAngles';
import { validateFractionTrivia, generateFractionTriviaExercise } from '../exercises/fractionTrivia';
import { generatePythagoras, validatePythagoras } from '../exercises/pythagoras';
import { generatePercentExercise, validatePercent } from '../exercises/percent';
import { generateAreaAndPerimeter, validateAreaAndPerimeter } from '../exercises/areaAndPerimeter';
import InteriorAngles from '../components/exercises/InteriorAngles.svelte';
import Pythagoras from '../components/exercises/Pythagoras.svelte';
import AreaAndPerimeterExercise from '../components/exercises/AreaAndPerimeterExercise.svelte';
import InteriorAnglesInstructions from '../components/exerciseInstructions/InteriorAnglesInstructions.svelte';
import PythagorasInstructions from '../components/exerciseInstructions/PythagorasInstructions.svelte';
import AreaAndPerimeterInstructions from '../components/exerciseInstructions/AreaAndPerimeterInstructions.svelte';
import { trimCompare, validateFractionAnswer, validateFractionReduced } from '../validation';
import {
  generateSimplifySymbolicFraction,
  validateSimplifySymbolicFraction,
} from '../exercises/simplifySymbolicFraction';
import SimplifySymbolicFractionInstructions from '../components/exerciseInstructions/SimplifySymbolicFractionInstructions.svelte';
import { generateCompareFractions, validateCompareFractions } from '../exercises/compareFractions';
import CompareFractionsInstructions from '../components/exerciseInstructions/CompareFractionsInstructions.svelte';
import { generateSigns, validateSigns } from '../exercises/signs';
import SignsInstructions from '../components/exerciseInstructions/SignsInstructions.svelte';
import { generateRoundingSigfigsExercise } from '../exercises/roundingSigfigs';
import RoundingSigfigsInstructions from '../components/exerciseInstructions/RoundingSigfigsInstructions.svelte';
import UnitConversionInstructions from '../components/exerciseInstructions/UnitConversionInstructions.svelte';
import { validateNumbersTrivia, generateNumbersTriviaExercise } from '../exercises/numbersTrivia';
import { generateFactorsExercise, validateFactors } from '../exercises/factors';
import { generateUnitConversion, validateUnitConversion } from '../exercises/unitConversion';
import FactorsExercise from '../components/exercises/FactorsExercise.svelte';
import { generateGcdLcm, validateGcdLcm } from '../exercises/gcdLcm';
import GcdLcmExercise from '../components/exercises/GcdLcmExercise.svelte';
import GcdLcmInstructions from '../components/exerciseInstructions/GcdLcmInstructions.svelte';
import {
  generateTermTransformationsTrivia,
  validateTermTransformationsTrivia,
} from '../exercises/termTransformationsTrivia';
import {
  generateSymbolicFractionOperations,
  validateSymbolicFractionOperations,
} from '../exercises/symbolicFractionOperations';
import SymbolicFractionOperationsInstructions from '../components/exerciseInstructions/SymbolicFractionOperationsInstructions.svelte';

function defineExerciseType(config: {
  id: string;
  generate: (seed: number, complexity: number) => Exercise;
  validate?: (answer: string, exercise: Exercise) => boolean;
  component?: Component<ExerciseProps>;
  maxComplexity?: number;
  prerequisites?: Prerequisite[];
  instructionComponent?: Component;
}): ExerciseType {
  return {
    id: config.id,
    nameKey: `exercise.${config.id}.name` as DictKey,
    descriptionKey: `exercise.${config.id}.desc` as DictKey,
    maxComplexity: config.maxComplexity ?? 10,
    generate: config.generate,
    validate: config.validate ?? trimCompare,
    ...(config.component ? { component: config.component } : {}),
    ...(config.prerequisites ? { prerequisites: config.prerequisites } : {}),
    ...(config.instructionComponent ? { instructionComponent: config.instructionComponent } : {}),
  };
}

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: defineExerciseType({
    id: 'multiplication',
    generate: generateMultiplication,
  }),
  division: defineExerciseType({
    id: 'division',
    generate: generateDivision,
  }),
  squares: defineExerciseType({
    id: 'squares',
    generate: generateSquares,
    instructionComponent: SquaresInstructions,
  }),
  orderOfOperations: defineExerciseType({
    id: 'orderOfOperations',
    generate: generateOrderOfOperations,
    instructionComponent: OrderOfOperationsInstructions,
  }),
  primeFactorisation: defineExerciseType({
    id: 'primeFactorisation',
    generate: generatePrimeFactorisation,
    prerequisites: [
      { typeId: 'multiplication', complexity: 7 },
      { typeId: 'division', complexity: 7 },
    ],
    instructionComponent: PrimeFactorisationInstructions,
  }),
  simplifyFraction: defineExerciseType({
    id: 'simplifyFraction',
    generate: generateSimplifyFraction,
    validate: validateFractionReduced,
    instructionComponent: SimplifyFractionInstructions,
  }),
  additionFraction: defineExerciseType({
    id: 'additionFraction',
    generate: generateAdditionFraction,
    validate: validateFractionAnswer,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: AdditionFractionInstructions,
  }),
  multiplicationFraction: defineExerciseType({
    id: 'multiplicationFraction',
    generate: generateMultiplicationFraction,
    validate: validateFractionAnswer,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: MultiplicationFractionInstructions,
  }),
  substitution: defineExerciseType({
    id: 'substitution',
    generate: generateSubstitutionExercise,
    validate: validateSubstitution,
    instructionComponent: SubstitutionInstructions,
  }),
  collectingTerms: defineExerciseType({
    id: 'collectingTerms',
    generate: generateCollectingTerms,
    validate: validateCollectingTerms,
    instructionComponent: CollectingTermsInstructions,
  }),
  binomialFormulas: defineExerciseType({
    id: 'binomialFormulas',
    generate: generateBinomialFormulas,
    validate: validateBinomialFormulas,
    instructionComponent: BinomialFormulasInstructions,
  }),
  scientificNotation: defineExerciseType({
    id: 'scientificNotation',
    generate: generateScientificNotation,
    component: ScientificNotationExercise,
    instructionComponent: ScientificNotationInstructions,
  }),
  factoringBinomialFormulas: defineExerciseType({
    id: 'factoringBinomialFormulas',
    generate: generateFactoringBinomialFormulas,
    validate: validateFactoringBinomialFormulas,
    component: FactoringBinomialFormulas,
    prerequisites: [{ typeId: 'binomialFormulas', complexity: 5 }],
    instructionComponent: FactoringBinomialFormulasInstructions,
  }),
  factoringOut: defineExerciseType({
    id: 'factoringOut',
    generate: generateFactoringOut,
    validate: validateFactoringOut,
    component: FactoringOut,
    instructionComponent: FactoringOutInstructions,
  }),
  factoringOutAndBinomial: defineExerciseType({
    id: 'factoringOutAndBinomial',
    generate: generateFactoringOutAndBinomial,
    validate: validateFactoringOutAndBinomial,
    component: FactoringOutAndBinomial,
    prerequisites: [
      { typeId: 'factoringOut', complexity: 3 },
      { typeId: 'binomialFormulas', complexity: 3 },
    ],
    instructionComponent: FactoringOutAndBinomialInstructions,
  }),
  expand: defineExerciseType({
    id: 'expand',
    generate: generateExpand,
    validate: validateExpand,
    prerequisites: [{ typeId: 'collectingTerms', complexity: 3 }],
    instructionComponent: ExpandInstructions,
  }),
  expandAndCollect: defineExerciseType({
    id: 'expandAndCollect',
    generate: generateExpandAndCollect,
    validate: validateExpandAndCollect,
    prerequisites: [{ typeId: 'expand', complexity: 3 }],
    instructionComponent: ExpandAndCollectInstructions,
  }),
  linearEquations: defineExerciseType({
    id: 'linearEquations',
    generate: generateLinearEquationsExercise,
    validate: validateLinearEquations,
    instructionComponent: LinearEquationsInstructions,
  }),
  factorEquations: defineExerciseType({
    id: 'factorEquations',
    generate: generateFactorEquations,
    validate: validateFactorEquations,
    component: FactorEquations,
    prerequisites: [
      { typeId: 'factoringOut', complexity: 4 },
      { typeId: 'factoringBinomialFormulas', complexity: 4 },
      { typeId: 'linearEquations', complexity: 3 },
    ],
    instructionComponent: FactorEquationsInstructions,
  }),
  necessityOfParentheses: defineExerciseType({
    id: 'necessityOfParentheses',
    generate: generateNecessityOfParenthesesExercise,
    validate: validateNecessityOfParentheses,
  }),
  pythagoras: defineExerciseType({
    id: 'pythagoras',
    generate: generatePythagoras,
    validate: validatePythagoras,
    component: Pythagoras,
    instructionComponent: PythagorasInstructions,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
  }),
  interiorAngles: defineExerciseType({
    id: 'interiorAngles',
    maxComplexity: 10,
    generate: generateInteriorAngles,
    component: InteriorAngles,
    instructionComponent: InteriorAnglesInstructions,
  }),
  areaAndPerimeter: defineExerciseType({
    id: 'areaAndPerimeter',
    maxComplexity: 10,
    generate: generateAreaAndPerimeter,
    validate: validateAreaAndPerimeter,
    component: AreaAndPerimeterExercise,
    instructionComponent: AreaAndPerimeterInstructions,
  }),
  percent: defineExerciseType({
    id: 'percent',
    generate: generatePercentExercise,
    validate: validatePercent,
    prerequisites: [{ typeId: 'multiplication', complexity: 3 }],
  }),
  compareFractions: defineExerciseType({
    id: 'compareFractions',
    generate: generateCompareFractions,
    validate: validateCompareFractions,
    instructionComponent: CompareFractionsInstructions,
    maxComplexity: 10,
  }),
  signs: defineExerciseType({
    id: 'signs',
    generate: generateSigns,
    validate: validateSigns,
    instructionComponent: SignsInstructions,
  }),
  simplifySymbolicFraction: defineExerciseType({
    id: 'simplifySymbolicFraction',
    generate: generateSimplifySymbolicFraction,
    validate: validateSimplifySymbolicFraction,
    component: SymbolicFractionExercise,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: SimplifySymbolicFractionInstructions,
  }),
  roundingSigfigs: defineExerciseType({
    id: 'roundingSigfigs',
    generate: generateRoundingSigfigsExercise,
    instructionComponent: RoundingSigfigsInstructions,
  }),
  gcdLcm: defineExerciseType({
    id: 'gcdLcm',
    generate: generateGcdLcm,
    validate: validateGcdLcm,
    component: GcdLcmExercise,
    instructionComponent: GcdLcmInstructions,
  }),
  termTransformationsTrivia: defineExerciseType({
    id: 'termTransformationsTrivia',
    generate: generateTermTransformationsTrivia,
    validate: validateTermTransformationsTrivia,
  }),
  numbersTrivia: defineExerciseType({
    id: 'numbersTrivia',
    generate: generateNumbersTriviaExercise,
    validate: validateNumbersTrivia,
  }),

  factors: defineExerciseType({
    id: 'factors',
    maxComplexity: 10,
    generate: generateFactorsExercise,
    validate: validateFactors,
    component: FactorsExercise,
  }),

  fractionTrivia: defineExerciseType({
    id: 'fractionTrivia',
    generate: generateFractionTriviaExercise,
    validate: validateFractionTrivia,
  }),
  unitConversion: defineExerciseType({
    id: 'unitConversion',
    generate: generateUnitConversion,
    validate: validateUnitConversion,
    instructionComponent: UnitConversionInstructions,
  }),
  symbolicFractionOperations: defineExerciseType({
    id: 'symbolicFractionOperations',
    generate: generateSymbolicFractionOperations,
    validate: validateSymbolicFractionOperations,
    component: SymbolicFractionExercise,
    prerequisites: [
      { typeId: 'additionFraction', complexity: 4 },
      { typeId: 'multiplicationFraction', complexity: 4 },
    ],
    instructionComponent: SymbolicFractionOperationsInstructions,
  }),
};
