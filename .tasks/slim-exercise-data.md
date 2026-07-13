# Slim `ExerciseData`

## Description

`ExerciseData` (defined in `src/lib/types.ts:14-78`) is a flat interface of ~60 optional properties, the vast majority of which are used by exactly one exercise type. This violates the principle that a type should describe a coherent set of data. Reduce the interface to its minimum without changing runtime behaviour or reducing code transparency.

## Current state

| Category           | Count   | Properties                                                 |
| ------------------ | ------- | ---------------------------------------------------------- |
| Shared by 2+ types | 5       | `promptKey`, `fields`, `subType`, `varA`, `varB`           |
| Single-exercise    | ~50     | Everything else (see below)                                |
| Unused (never set) | 4       | `candidates`, `ruleIndices`, `ruleK`, `isNaturalQuestions` |
| **Total**          | **~60** |                                                            |

The flat interface means every consumer sees every property as optional, obscuring which data each exercise type actually carries. Several components already work around this by casting `exercise.data as unknown as LocalType` (Pythagoras, FactoringOut, FactoringOutAndBinomial, several trivia components).

## Approach

1. **Delete** the 4 unused properties from `ExerciseData`.
2. **Keep** only the 5 truly shared properties on `ExerciseData` (`promptKey`, `fields`, `subType`, `varA`, `varB`).
3. **Define** a `Record`-based interface for each exercise type that needs data. Some already exist as local interfaces or exported types — formalise and co-locate them.
4. **Change** `Exercise.data` type from `ExerciseData?` to `unknown`, enforcing that consumers must assert the expected shape (as several already do).
5. **Add** a documented helper `exerciseData<T>(exercise: Exercise): T` if desired, but explicit inline casts are acceptable.

## Per-type data interfaces

Define (or move from local) the following interfaces. Each interface includes `promptKey` if the type uses it, so components don't need to reach through shared properties.

| Exercise type               | Data interface                  | Properties                                                               | Already exists? |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------ | --------------- |
| `simplifyFraction`          | `SimplifyFractionData`          | `promptKey`                                                              | —               |
| `additionFraction`          | `AdditionFractionData`          | `promptKey`                                                              | —               |
| `multiplicationFraction`    | `MultiplicationFractionData`    | `num1`, `den1`, `num2`, `den2`, `op`, `promptKey`                        | —               |
| `binomialFormulas`          | `BinomialFormulasData`          | `fields`, `promptKey`                                                    | —               |
| `collectingTerms`           | `CollectingTermsData`           | `fields`, `promptKey`                                                    | —               |
| `expand`                    | `ExpandData`                    | `fields`, `promptKey`                                                    | —               |
| `expandAndCollect`          | `ExpandAndCollectData`          | `fields`, `promptKey`                                                    | —               |
| `scientificNotation`        | `ScientificNotationData`        | `subType`, `promptKey`                                                   | —               |
| `simplifySymbolicFraction`  | `SymbolicFractionData`          | `mode`, `fields`, `denominatorFields`, `cannotSimplifyType`, `promptKey` | —               |
| `roundingSigfigs`           | `RoundingSigfigsData`           | `sigfigsCount`, `promptKey`                                              | —               |
| `primeFactorisation`        | `PrimeFactorisationData`        | `primes`                                                                 | —               |
| `substitution`              | `SubstitutionData`              | `variable`, `value`, `varB`, `valueB`, `term`, `complexity`              | —               |
| `linearEquations`           | `LinearEquationsData`           | `variable`                                                               | —               |
| `factorEquations`           | `FactorEquationsData`           | `variable`, `numSolutions`                                               | —               |
| `factoringBinomialFormulas` | `FactoringBinomialFormulasData` | `varA`, `varB`, `correctFormula`                                         | —               |
| `factoringOut`              | `FactoringOutData`              | Local `factoringOut.ts:17-23` (4 props)                                  | Yes, local      |
| `factoringOutAndBinomial`   | `FactoringOutAndBinomialData`   | Exported `factoringOutAndBinomial.ts:13-27` (11 props)                   | Yes, exported   |
| `pythagoras`                | `PythagorasData`                | Local `Pythagoras.svelte:16-28` (10 props + `promptKey`)                 | Yes, local      |
| `interiorAngles`            | `InteriorAnglesData`            | Local `interiorAngles.ts:12-15` (2 props)                                | Yes, local      |
| `necessityOfParentheses`    | `NecessityOfParenthesesData`    | `questions`                                                              | —               |
| `signs`                     | `SignsData`                     | Exported `signs.ts:11-14` (2 props)                                      | Yes, exported   |
| `compareFractions`          | `CompareFractionsData`          | Exported `compareFractions.ts:14-17` (2 props)                           | Yes, exported   |
| `fractionTrivia`            | `FractionTriviaData`            | Exported `fractionTrivia.ts:6-14` (7 props)                              | Yes, exported   |
| `numbersTrivia`             | `NumbersTriviaData`             | Exported `numbersTrivia.ts:15-26` (9 props)                              | Yes, exported   |
| `termTransformationsTrivia` | `TermTransformationsTriviaData` | Exported `termTransformationsTrivia.ts:6-16` (9 props)                   | Yes, exported   |

## Migration per file

### `src/lib/types.ts`

```diff
-export interface ExerciseData {
-  num1?: number;
-  den1?: number;
-  ...
-  correctAnswers?: boolean;
-}

+export interface ExerciseData {
+  /** Properties shared across 2+ exercise types */
+  promptKey?: string;
+  fields?: { variablePart: string }[];
+  subType?: string;
+  varA?: string | null;
+  varB?: string;
+}

 export interface Exercise {
   prompt: string;
   answer: string;
-  data?: ExerciseData;
+  data?: unknown;
 }
```

### Components that access `exercise.data.x` directly (no cast)

Must add an explicit cast at the top of the script block, matching the pattern already used by `Pythagoras.svelte:36` and `FactoringOut.svelte:13-21`.

| File                               | Cast to                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `FractionExercise.svelte`          | `MultiplicationFractionData`                                                        |
| `MultiFieldExercise.svelte`        | `BinomialFormulasData \| CollectingTermsData \| ExpandData \| ExpandAndCollectData` |
| `SymbolicFractionExercise.svelte`  | `SymbolicFractionData`                                                              |
| `PrimeFactorisation.svelte`        | `PrimeFactorisationData`                                                            |
| `SubstitutionExercise.svelte`      | `SubstitutionData`                                                                  |
| `LinearEquationsExercise.svelte`   | `LinearEquationsData`                                                               |
| `FactorEquations.svelte`           | `FactorEquationsData`                                                               |
| `NecessityOfParentheses.svelte`    | `NecessityOfParenthesesData`                                                        |
| `Signs.svelte`                     | `SignsData`                                                                         |
| `CompareFractions.svelte`          | `CompareFractionsData`                                                              |
| `InteriorAngles.svelte`            | `InteriorAnglesData`                                                                |
| `RoundingSigfigsExercise.svelte`   | `RoundingSigfigsData`                                                               |
| `FactoringBinomialFormulas.svelte` | `FactoringBinomialFormulasData`                                                     |
| `FractionTrivia.svelte`            | `FractionTriviaData`                                                                |
| `NumbersTrivia.svelte`             | `NumbersTriviaData`                                                                 |
| `TermTransformationsTrivia.svelte` | `TermTransformationsTriviaData`                                                     |

### Components that already cast

`Pythagoras.svelte`, `FactoringOut.svelte`, `FactoringOutAndBinomial.svelte` — the cast target changes from the inline interface to the formalised named interface (imported from the exercise's module).

### Validation functions

Functions that already cast (`validateFractionTrivia`, `validateNumbersTrivia`, `validateTermTransformationsTrivia`, `validateFactoringOut`, `validateFactoringOutAndBinomial`) will cast to the same named interface. `validateSymbolicFraction` (`validation.ts:68-107`) will cast to `SymbolicFractionData`.

### Generators

Each generator's return value currently populates `data` with inline object literals. No change needed except that the object no longer satisfies the old `ExerciseData` interface (it satisfies the per-type interface).

### Tests

Test files that read `exercise.data.*` (`substitution.test.ts`, `primeFactorisation.test.ts`, `fractionTrivia.test.ts`, `numbersTrivia.test.ts`, `termTransformationsTrivia.test.ts`) need the same cast pattern as components, or they can import the per-type interface.

## Acceptance criteria

1. `ExerciseData` in `types.ts` has exactly 5 optional properties: `promptKey`, `fields`, `subType`, `varA`, `varB`.
2. The 4 unused properties (`candidates`, `ruleIndices`, `ruleK`, `isNaturalQuestions`) are deleted.
3. Every component that accesses `exercise.data.*` has an explicit typed cast to the correct per-type interface.
4. Every validation function that accesses `exercise.data.*` has an explicit typed cast.
5. Every test that accesses `exercise.data.*` has an explicit typed cast.
6. All per-type interfaces are defined in the exercise's generator module (next to `generate`, `validate`) and exported.
7. `npm run check` passes.
8. `npm run test` passes.
9. `npm run lint` passes.
10. Behaviour is identical: `exercise.data` carries the same runtime values before and after.

## Progress

## Blockers

## Notes

- `STRUCTURE.md` describes the codebase architecture and documents `ExerciseData`. It must be updated to reflect the slimmer interface and the per-type data interface pattern.

- Some per-type interfaces already exist as local or exported types in generator modules. Move or re-export from those modules rather than duplicating.
- The `mode` property (used only by `simplifySymbolicFraction`) is excluded from the shared set because it is only meaningful inside that one type's data interface.
- The `denominatorFields` property (used only by `simplifySymbolicFraction`) is likewise moved into `SymbolicFractionData`.
- `MultiFieldExercise.svelte` handles 4 exercise types; its cast should use the widest union of those 4 interfaces.
