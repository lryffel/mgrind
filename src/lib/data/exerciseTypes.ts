import type { Exercise, ExerciseType } from '../types';
import { generateMultiplication } from '../exercises/multiplication';
import { generateDivision } from '../exercises/division';
import { generatePrimeFactorisation } from '../exercises/primeFactorisation';
import { generateSquares } from '../exercises/squares';
import { generateOrderOfOperations } from '../exercises/orderOfOperations';
import { generateAdditionFraction } from '../exercises/additionFraction';
import { generateSimplifyFraction } from '../exercises/simplifyFraction';
import { generateSubtractionFraction } from '../exercises/subtractionFraction';
import { generateMultiplicationFraction } from '../exercises/multiplicationFraction';
import { generateSubstitution, validateSubstitution } from '../exercises/substitution';
import TextInputExercise from '../components/exercises/TextInputExercise.svelte';
import PrimeFactorisation from '../components/exercises/PrimeFactorisation.svelte';
import FractionExercise from '../components/exercises/FractionExercise.svelte';
import SubstitutionExercise from '../components/exercises/SubstitutionExercise.svelte';
import { generateBinomialFormulas, validateBinomialFormulas } from '../exercises/binomialFormulas';
import { generateCollectingTerms, validateCollectingTerms } from '../exercises/collectingTerms';
import MultiFieldExercise from '../components/exercises/MultiFieldExercise.svelte';
import { generateScientificNotation } from '../exercises/scientificNotation';
import ScientificNotationExercise from '../components/exercises/ScientificNotationExercise.svelte';
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
import { generateNecessityOfParentheses, validateNecessityOfParentheses } from '../exercises/necessityOfParentheses';
import NecessityOfParentheses from '../components/exercises/NecessityOfParentheses.svelte';
import AdditionFractionInstructions from '../components/exerciseInstructions/AdditionFractionInstructions.svelte';
import SubtractionFractionInstructions from '../components/exerciseInstructions/SubtractionFractionInstructions.svelte';
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
import { generateLinearEquations, validateLinearEquations } from '../exercises/linearEquations';
import LinearEquationsExercise from '../components/exercises/LinearEquationsExercise.svelte';
import { generateInteriorAngles } from '../exercises/interiorAngles';
import { generateFractionTrivia, validateFractionTrivia } from '../exercises/fractionTrivia';
import { generatePythagoras, validatePythagoras } from '../exercises/pythagoras';
import InteriorAngles from '../components/exercises/InteriorAngles.svelte';
import Pythagoras from '../components/exercises/Pythagoras.svelte';
import FractionTrivia from '../components/exercises/FractionTrivia.svelte';
import InteriorAnglesInstructions from '../components/exerciseInstructions/InteriorAnglesInstructions.svelte';
import PythagorasInstructions from '../components/exerciseInstructions/PythagorasInstructions.svelte';
import { trimCompare, validateFractionAnswer, validateFractionReduced } from '../validation';

function validateSubtractionFraction(answer: string, exercise: Exercise): boolean {
  return validateFractionAnswer(answer, exercise);
}

export const exerciseTypes: Record<string, ExerciseType> = {
  multiplication: {
    id: 'multiplication',
    nameKey: 'exercise.multiplication.name',
    descriptionKey: 'exercise.multiplication.desc',
    maxComplexity: 10,
    generate: generateMultiplication,
    validate: trimCompare,
    component: TextInputExercise,
  },
  division: {
    id: 'division',
    nameKey: 'exercise.division.name',
    descriptionKey: 'exercise.division.desc',
    maxComplexity: 10,
    generate: generateDivision,
    validate: trimCompare,
    component: TextInputExercise,
  },
  squares: {
    id: 'squares',
    nameKey: 'exercise.squares.name',
    descriptionKey: 'exercise.squares.desc',
    maxComplexity: 10,
    generate: generateSquares,
    validate: trimCompare,
    component: TextInputExercise,
    instructionComponent: SquaresInstructions,
  },
  orderOfOperations: {
    id: 'orderOfOperations',
    nameKey: 'exercise.orderOfOperations.name',
    descriptionKey: 'exercise.orderOfOperations.desc',
    maxComplexity: 10,
    generate: generateOrderOfOperations,
    validate: trimCompare,
    component: TextInputExercise,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
    instructionComponent: OrderOfOperationsInstructions,
  },
  primeFactorisation: {
    id: 'primeFactorisation',
    nameKey: 'exercise.primeFactorisation.name',
    descriptionKey: 'exercise.primeFactorisation.desc',
    maxComplexity: 10,
    generate: generatePrimeFactorisation,
    validate: trimCompare,
    component: PrimeFactorisation,
    prerequisites: [
      { typeId: 'multiplication', complexity: 7 },
      { typeId: 'division', complexity: 7 },
    ],
    instructionComponent: PrimeFactorisationInstructions,
  },
  simplifyFraction: {
    id: 'simplifyFraction',
    nameKey: 'exercise.simplifyFraction.name',
    descriptionKey: 'exercise.simplifyFraction.desc',
    maxComplexity: 10,
    generate: generateSimplifyFraction,
    validate: validateFractionReduced,
    component: FractionExercise,
    instructionComponent: SimplifyFractionInstructions,
  },
  additionFraction: {
    id: 'additionFraction',
    nameKey: 'exercise.additionFraction.name',
    descriptionKey: 'exercise.additionFraction.desc',
    maxComplexity: 10,
    generate: generateAdditionFraction,
    validate: validateFractionAnswer,
    component: FractionExercise,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: AdditionFractionInstructions,
  },
  subtractionFraction: {
    id: 'subtractionFraction',
    nameKey: 'exercise.subtractionFraction.name',
    descriptionKey: 'exercise.subtractionFraction.desc',
    maxComplexity: 10,
    generate: generateSubtractionFraction,
    validate: validateSubtractionFraction,
    component: FractionExercise,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: SubtractionFractionInstructions,
  },
  multiplicationFraction: {
    id: 'multiplicationFraction',
    nameKey: 'exercise.multiplicationFraction.name',
    descriptionKey: 'exercise.multiplicationFraction.desc',
    maxComplexity: 10,
    generate: generateMultiplicationFraction,
    validate: validateFractionAnswer,
    component: FractionExercise,
    prerequisites: [{ typeId: 'simplifyFraction', complexity: 5 }],
    instructionComponent: MultiplicationFractionInstructions,
  },
  substitution: {
    id: 'substitution',
    nameKey: 'exercise.substitution.name',
    descriptionKey: 'exercise.substitution.desc',
    maxComplexity: 10,
    generate: generateSubstitution,
    validate: validateSubstitution,
    component: SubstitutionExercise,
    instructionComponent: SubstitutionInstructions,
  },
  collectingTerms: {
    id: 'collectingTerms',
    nameKey: 'exercise.collectingTerms.name',
    descriptionKey: 'exercise.collectingTerms.desc',
    maxComplexity: 10,
    generate: generateCollectingTerms,
    validate: validateCollectingTerms,
    component: MultiFieldExercise,
    instructionComponent: CollectingTermsInstructions,
  },
  binomialFormulas: {
    id: 'binomialFormulas',
    nameKey: 'exercise.binomialFormulas.name',
    descriptionKey: 'exercise.binomialFormulas.desc',
    maxComplexity: 10,
    generate: generateBinomialFormulas,
    validate: validateBinomialFormulas,
    component: MultiFieldExercise,
    instructionComponent: BinomialFormulasInstructions,
  },
  scientificNotation: {
    id: 'scientificNotation',
    nameKey: 'exercise.scientificNotation.name',
    descriptionKey: 'exercise.scientificNotation.desc',
    maxComplexity: 10,
    generate: generateScientificNotation,
    validate: trimCompare,
    component: ScientificNotationExercise,
    instructionComponent: ScientificNotationInstructions,
  },
  factoringBinomialFormulas: {
    id: 'factoringBinomialFormulas',
    nameKey: 'exercise.factoringBinomialFormulas.name',
    descriptionKey: 'exercise.factoringBinomialFormulas.desc',
    maxComplexity: 10,
    generate: generateFactoringBinomialFormulas,
    validate: validateFactoringBinomialFormulas,
    component: FactoringBinomialFormulas,
    prerequisites: [{ typeId: 'binomialFormulas', complexity: 5 }],
    instructionComponent: FactoringBinomialFormulasInstructions,
  },
  factoringOut: {
    id: 'factoringOut',
    nameKey: 'exercise.factoringOut.name',
    descriptionKey: 'exercise.factoringOut.desc',
    maxComplexity: 10,
    generate: generateFactoringOut,
    validate: validateFactoringOut,
    component: FactoringOut,
    instructionComponent: FactoringOutInstructions,
  },
  factoringOutAndBinomial: {
    id: 'factoringOutAndBinomial',
    nameKey: 'exercise.factoringOutAndBinomial.name',
    descriptionKey: 'exercise.factoringOutAndBinomial.desc',
    maxComplexity: 10,
    generate: generateFactoringOutAndBinomial,
    validate: validateFactoringOutAndBinomial,
    component: FactoringOutAndBinomial,
    prerequisites: [
      { typeId: 'factoringOut', complexity: 3 },
      { typeId: 'binomialFormulas', complexity: 3 },
    ],
    instructionComponent: FactoringOutAndBinomialInstructions,
  },
  expand: {
    id: 'expand',
    nameKey: 'exercise.expand.name',
    descriptionKey: 'exercise.expand.desc',
    maxComplexity: 10,
    generate: generateExpand,
    validate: validateExpand,
    component: MultiFieldExercise,
    prerequisites: [{ typeId: 'collectingTerms', complexity: 3 }],
    instructionComponent: ExpandInstructions,
  },
  expandAndCollect: {
    id: 'expandAndCollect',
    nameKey: 'exercise.expandAndCollect.name',
    descriptionKey: 'exercise.expandAndCollect.desc',
    maxComplexity: 10,
    generate: generateExpandAndCollect,
    validate: validateExpandAndCollect,
    component: MultiFieldExercise,
    prerequisites: [{ typeId: 'expand', complexity: 3 }],
    instructionComponent: ExpandAndCollectInstructions,
  },
  linearEquations: {
    id: 'linearEquations',
    nameKey: 'exercise.linearEquations.name',
    descriptionKey: 'exercise.linearEquations.desc',
    maxComplexity: 10,
    generate: generateLinearEquations,
    validate: validateLinearEquations,
    component: LinearEquationsExercise,
    instructionComponent: LinearEquationsInstructions,
  },
  factorEquations: {
    id: 'factorEquations',
    nameKey: 'exercise.factorEquations.name',
    descriptionKey: 'exercise.factorEquations.desc',
    maxComplexity: 10,
    generate: generateFactorEquations,
    validate: validateFactorEquations,
    component: FactorEquations,
    prerequisites: [
      { typeId: 'factoringOut', complexity: 4 },
      { typeId: 'factoringBinomialFormulas', complexity: 4 },
      { typeId: 'linearEquations', complexity: 3 },
    ],
    instructionComponent: FactorEquationsInstructions,
  },
  necessityOfParentheses: {
    id: 'necessityOfParentheses',
    nameKey: 'exercise.necessityOfParentheses.name',
    descriptionKey: 'exercise.necessityOfParentheses.desc',
    maxComplexity: 10,
    generate: generateNecessityOfParentheses,
    validate: validateNecessityOfParentheses,
    component: NecessityOfParentheses,
  },
  pythagoras: {
    id: 'pythagoras',
    nameKey: 'exercise.pythagoras.name',
    descriptionKey: 'exercise.pythagoras.desc',
    maxComplexity: 10,
    generate: generatePythagoras,
    validate: validatePythagoras,
    component: Pythagoras,
    instructionComponent: PythagorasInstructions,
    prerequisites: [{ typeId: 'squares', complexity: 5 }],
  },
  interiorAngles: {
    id: 'interiorAngles',
    nameKey: 'exercise.interiorAngles.name',
    descriptionKey: 'exercise.interiorAngles.desc',
    maxComplexity: 9,
    generate: generateInteriorAngles,
    validate: trimCompare,
    component: InteriorAngles,
    instructionComponent: InteriorAnglesInstructions,
  },
  fractionTrivia: {
    id: 'fractionTrivia',
    nameKey: 'exercise.fractionTrivia.name',
    descriptionKey: 'exercise.fractionTrivia.desc',
    maxComplexity: 10,
    generate: generateFractionTrivia,
    validate: validateFractionTrivia,
    component: FractionTrivia,
  },
};
