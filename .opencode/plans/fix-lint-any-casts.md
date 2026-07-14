# Fix `as any` casts — typed card data interfaces

## Problem

16 `@typescript-eslint/no-explicit-any` lint errors in test files, plus pervasive `as any` and `Record<string, unknown>` casts in card templates and generator wrappers — all from accessing `exercise.data` properties ad-hoc.

## Solution

Define one named TypeScript interface per card pattern so the contract between generators and cards is typed.

---

### Step 1 — Create `src/lib/components/cards/cardData.ts`

```ts
export interface TextInputCardData {
  promptKey?: string;
  promptArgs?: (string | number)[];
  promptMath?: string;
  promptKeySuffix?: string;
  prefixLatex?: string;
  suffixLatex?: string;
  correctLatex?: string;
  formatNumbers?: boolean;
}

export interface BatchChoiceCardData {
  promptKey?: string;
  rows: { latex: string; latex2?: string }[];
  buttons: string[];
}

export interface SingleChoiceCardData {
  promptKey?: string;
  promptArgs?: (string | number)[];
  promptArgKeys?: string[];
  promptText?: string;
  options: { label?: string; latex?: string; text?: string; textDe?: string }[];
}

export interface MultiChoiceCardData {
  promptKey?: string;
  layout?: 'grid';
  options: { label?: string; latex?: string; text?: string; textDe?: string }[];
}

export interface PrimeFactorsCardData {
  promptKey?: string;
  primes: number[];
}
```

### Step 2 — Update card templates (7 files)

| File                            | Change                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `TextInputCard.svelte:14`       | `as any` → `as TextInputCardData`                                                                                        |
| `BatchChoiceCard.svelte:10-12`  | Inline type → `BatchChoiceCardData`                                                                                      |
| `SingleChoiceCard.svelte:11-19` | Inline type → `SingleChoiceCardData`                                                                                     |
| `MultiChoiceCard.svelte:11-17`  | Inline type → `MultiChoiceCardData`                                                                                      |
| `PrimeFactorsCard.svelte:11`    | Inline type → `PrimeFactorsCardData`                                                                                     |
| `FractionInputCard.svelte:26`   | `(exercise.data as any)?.promptArgs` → intersection `MultiplicationFractionData & { promptArgs?: (string \| number)[] }` |
| `MultiFieldCard.svelte:33`      | `contexts[i] as any` → type as `InputContext[]`                                                                          |

### Step 3 — Update generator wrappers (4 files)

Replace property mutations (`(ex.data as Record<string, unknown>).x = y`) with typed object assignment:

- `linearEquations.ts:371-375` — `ex.data = { ...base, promptKey, promptMath, ... } as TextInputCardData & LinearEquationsData`
- `percent.ts:243-266` — Same per variant
- `roundingSigfigs.ts:131-133` — Same
- `necessityOfParentheses.ts:204-206` — `as BatchChoiceCardData & NecessityOfParenthesesData`

### Step 4 — Fix test casts (5 files, 16 errors)

- `linearEquations.test.ts:152,160,166` → `as TextInputCardData`; `:174` → `as LinearEquationsData`
- `necessityOfParentheses.test.ts:164,173,179` → `as BatchChoiceCardData`
- `percent.test.ts:386` → `as TextInputCardData`; `:401,412,423` → use `getData(ex).variant`
- `roundingSigfigs.test.ts:112` → `as TextInputCardData`
- `termTransformationsTrivia.test.ts:265` → `as SingleChoiceCardData`; `:276` → `as BatchChoiceCardData`; drop callback param types (`o: any`, `r: any`) — inferred from typed `options`/`rows`

### Verification

```sh
npm run lint   # 0 errors
npm test       # all pass
```
