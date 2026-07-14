import type { Component } from 'svelte';
import type { Exercise, ExerciseType, ExerciseProps, Prerequisite } from '../types';
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
import { validateNumbersTrivia, generateNumbersTriviaExercise } from '../exercises/numbersTrivia';
import { generateFactorsExercise, validateFactors } from '../exercises/factors';
import FactorsExercise from '../components/exercises/FactorsExercise.svelte';
import { generateGcdLcm, validateGcdLcm } from '../exercises/gcdLcm';
import GcdLcmExercise from '../components/exercises/GcdLcmExercise.svelte';
import GcdLcmInstructions from '../components/exerciseInstructions/GcdLcmInstructions.svelte';
import {
  generateTermTransformationsTrivia,
  validateTermTransformationsTrivia,
} from '../exercises/termTransformationsTrivia';

function defineExerciseType(config: {
  id: string;
  nameKey: string;
  descriptionKey: string;
  generate: (seed: number, complexity: number) => Exercise;
  validate?: (answer: string, exercise: Exercise) => boolean;
  component?: Component<ExerciseProps>;
  maxComplexity?: number;
  prerequisites?: Prerequisite[];
  instructionComponent?: Component;
}): ExerciseType {
  return {
    id: config.id,
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
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
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    generate: generateMultiplication,
  }),
  division: defineExerciseType({
    id: 'division',
    nameKey: 'exercise.division.name',
    descriptionKey: 'exercise.division.desc',
    generate: generateDivision,
  }),
  squares: defineExerciseType({
    id: 'squares',
    nameKey: 'exercise.squares.name',
    descriptionKey: 'exercise.squares.desc',
    generate: generateSquares,
    instructionComponent: SquaresInstructions,
  }),
  orderOfOperations: defineExerciseType({
    id: 'orderOfOperations',
    nameKey: 'exercise.orderOfOperations.name',
    descriptionKey: 'exercise.orderOfOperations.desc',
    generate: generateOrderOfOperations,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
    instructionComponent: OrderOfOperationsInstructions,
  }),
  primeFactorisation: defineExerciseType({
    id: 'primeFactorisation',
    nameKey: 'exercise.primeFactorisation.name',
    descriptionKey: 'exercise.primeFactorisation.desc',
    generate: generatePrimeFactorisation,
    prerequisites: [
      { typeId: 'multiplication', complexity: 7 },
      { typeId: 'division', complexity: 7 },
    ],
    instructionComponent: PrimeFactorisationInstructions,
  }),
  simplifyFraction: defineExerciseType({
    id: 'simplifyFraction',
    nameKey: 'exercise.simplifyFraction.name',
    descriptionKey: 'exercise.simplifyFraction.desc',
    generate: generateSimplifyFraction,
    validate: validateFractionReduced,
    instructionComponent: SimplifyFractionInstructions,
  }),
  additionFraction: defineExerciseType({
    id: 'additionFraction',
    nameKey: 'exercise.additionFraction.name',
    descriptionKey: 'exercise.additionFraction.desc',
    generate: generateAdditionFraction,
    validate: validateFractionAnswer,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: AdditionFractionInstructions,
  }),
  multiplicationFraction: defineExerciseType({
    id: 'multiplicationFraction',
    nameKey: 'exercise.multiplicationFraction.name',
    descriptionKey: 'exercise.multiplicationFraction.desc',
    generate: generateMultiplicationFraction,
    validate: validateFractionAnswer,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: MultiplicationFractionInstructions,
  }),
  substitution: defineExerciseType({
    id: 'substitution',
    nameKey: 'exercise.substitution.name',
    descriptionKey: 'exercise.substitution.desc',
    generate: generateSubstitutionExercise,
    validate: validateSubstitution,
    instructionComponent: SubstitutionInstructions,
  }),
  collectingTerms: defineExerciseType({
    id: 'collectingTerms',
    nameKey: 'exercise.collectingTerms.name',
    descriptionKey: 'exercise.collectingTerms.desc',
    generate: generateCollectingTerms,
    validate: validateCollectingTerms,
    instructionComponent: CollectingTermsInstructions,
  }),
  binomialFormulas: defineExerciseType({
    id: 'binomialFormulas',
    nameKey: 'exercise.binomialFormulas.name',
    descriptionKey: 'exercise.binomialFormulas.desc',
    generate: generateBinomialFormulas,
    validate: validateBinomialFormulas,
    instructionComponent: BinomialFormulasInstructions,
  }),
  scientificNotation: defineExerciseType({
    id: 'scientificNotation',
    nameKey: 'exercise.scientificNotation.name',
    descriptionKey: 'exercise.scientificNotation.desc',
    generate: generateScientificNotation,
    component: ScientificNotationExercise,
    instructionComponent: ScientificNotationInstructions,
  }),
  factoringBinomialFormulas: defineExerciseType({
    id: 'factoringBinomialFormulas',
    nameKey: 'exercise.factoringBinomialFormulas.name',
    descriptionKey: 'exercise.factoringBinomialFormulas.desc',
    generate: generateFactoringBinomialFormulas,
    validate: validateFactoringBinomialFormulas,
    component: FactoringBinomialFormulas,
    prerequisites: [{ typeId: 'binomialFormulas', complexity: 5 }],
    instructionComponent: FactoringBinomialFormulasInstructions,
  }),
  factoringOut: defineExerciseType({
    id: 'factoringOut',
    nameKey: 'exercise.factoringOut.name',
    descriptionKey: 'exercise.factoringOut.desc',
    generate: generateFactoringOut,
    validate: validateFactoringOut,
    component: FactoringOut,
    instructionComponent: FactoringOutInstructions,
  }),
  factoringOutAndBinomial: defineExerciseType({
    id: 'factoringOutAndBinomial',
    nameKey: 'exercise.factoringOutAndBinomial.name',
    descriptionKey: 'exercise.factoringOutAndBinomial.desc',
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
    nameKey: 'exercise.expand.name',
    descriptionKey: 'exercise.expand.desc',
    generate: generateExpand,
    validate: validateExpand,
    prerequisites: [{ typeId: 'collectingTerms', complexity: 3 }],
    instructionComponent: ExpandInstructions,
  }),
  expandAndCollect: defineExerciseType({
    id: 'expandAndCollect',
    nameKey: 'exercise.expandAndCollect.name',
    descriptionKey: 'exercise.expandAndCollect.desc',
    generate: generateExpandAndCollect,
    validate: validateExpandAndCollect,
    prerequisites: [{ typeId: 'expand', complexity: 3 }],
    instructionComponent: ExpandAndCollectInstructions,
  }),
  linearEquations: defineExerciseType({
    id: 'linearEquations',
    nameKey: 'exercise.linearEquations.name',
    descriptionKey: 'exercise.linearEquations.desc',
    generate: generateLinearEquationsExercise,
    validate: validateLinearEquations,
    instructionComponent: LinearEquationsInstructions,
  }),
  factorEquations: defineExerciseType({
    id: 'factorEquations',
    nameKey: 'exercise.factorEquations.name',
    descriptionKey: 'exercise.factorEquations.desc',
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
    nameKey: 'exercise.necessityOfParentheses.name',
    descriptionKey: 'exercise.necessityOfParentheses.desc',
    generate: generateNecessityOfParenthesesExercise,
    validate: validateNecessityOfParentheses,
  }),
  pythagoras: defineExerciseType({
    id: 'pythagoras',
    nameKey: 'exercise.pythagoras.name',
    descriptionKey: 'exercise.pythagoras.desc',
    generate: generatePythagoras,
    validate: validatePythagoras,
    component: Pythagoras,
    instructionComponent: PythagorasInstructions,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
  }),
  interiorAngles: defineExerciseType({
    id: 'interiorAngles',
    nameKey: 'exercise.interiorAngles.name',
    descriptionKey: 'exercise.interiorAngles.desc',
    maxComplexity: 10,
    generate: generateInteriorAngles,
    component: InteriorAngles,
    instructionComponent: InteriorAnglesInstructions,
  }),
  areaAndPerimeter: defineExerciseType({
    id: 'areaAndPerimeter',
    nameKey: 'exercise.areaAndPerimeter.name',
    descriptionKey: 'exercise.areaAndPerimeter.desc',
    maxComplexity: 10,
    generate: generateAreaAndPerimeter,
    validate: validateAreaAndPerimeter,
    component: AreaAndPerimeterExercise,
    instructionComponent: AreaAndPerimeterInstructions,
  }),
  percent: defineExerciseType({
    id: 'percent',
    nameKey: 'exercise.percent.name',
    descriptionKey: 'exercise.percent.desc',
    generate: generatePercentExercise,
    validate: validatePercent,
    prerequisites: [{ typeId: 'multiplication', complexity: 3 }],
  }),
  compareFractions: defineExerciseType({
    id: 'compareFractions',
    nameKey: 'exercise.compareFractions.name',
    descriptionKey: 'exercise.compareFractions.desc',
    generate: generateCompareFractions,
    validate: validateCompareFractions,
    instructionComponent: CompareFractionsInstructions,
    maxComplexity: 10,
  }),
  signs: defineExerciseType({
    id: 'signs',
    nameKey: 'exercise.signs.name',
    descriptionKey: 'exercise.signs.desc',
    generate: generateSigns,
    validate: validateSigns,
    instructionComponent: SignsInstructions,
  }),
  simplifySymbolicFraction: defineExerciseType({
    id: 'simplifySymbolicFraction',
    nameKey: 'exercise.simplifySymbolicFraction.name',
    descriptionKey: 'exercise.simplifySymbolicFraction.desc',
    generate: generateSimplifySymbolicFraction,
    validate: validateSimplifySymbolicFraction,
    component: SymbolicFractionExercise,
    instructionComponent: SimplifySymbolicFractionInstructions,
  }),
  roundingSigfigs: defineExerciseType({
    id: 'roundingSigfigs',
    nameKey: 'exercise.roundingSigfigs.name',
    descriptionKey: 'exercise.roundingSigfigs.desc',
    generate: generateRoundingSigfigsExercise,
    instructionComponent: RoundingSigfigsInstructions,
  }),
  gcdLcm: defineExerciseType({
    id: 'gcdLcm',
    nameKey: 'exercise.gcdLcm.name',
    descriptionKey: 'exercise.gcdLcm.desc',
    generate: generateGcdLcm,
    validate: validateGcdLcm,
    component: GcdLcmExercise,
    instructionComponent: GcdLcmInstructions,
  }),
  termTransformationsTrivia: defineExerciseType({
    id: 'termTransformationsTrivia',
    nameKey: 'exercise.termTransformationsTrivia.name',
    descriptionKey: 'exercise.termTransformationsTrivia.desc',
    generate: generateTermTransformationsTrivia,
    validate: validateTermTransformationsTrivia,
  }),
  numbersTrivia: defineExerciseType({
    id: 'numbersTrivia',
    nameKey: 'exercise.numbersTrivia.name',
    descriptionKey: 'exercise.numbersTrivia.desc',
    generate: generateNumbersTriviaExercise,
    validate: validateNumbersTrivia,
  }),

  factors: defineExerciseType({
    id: 'factors',
    nameKey: 'exercise.factors.name',
    descriptionKey: 'exercise.factors.desc',
    maxComplexity: 10,
    generate: generateFactorsExercise,
    validate: validateFactors,
    component: FactorsExercise,
  }),

  fractionTrivia: defineExerciseType({
    id: 'fractionTrivia',
    nameKey: 'exercise.fractionTrivia.name',
    descriptionKey: 'exercise.fractionTrivia.desc',
    generate: generateFractionTriviaExercise,
    validate: validateFractionTrivia,
  }),
};
