# Pythagoras — Distractor button on every exercise

## Goal

Show the "Doesn't work" (`cannot_compute`) button on **every** Pythagoras exercise, not just non-right triangles. Currently the button is hidden for solvable right triangles (`Pythagoras.svelte:131` checks `isNonRight`). This change makes it always visible, turning it into a **distractor** for right triangles: clicking it is correct only for non-right triangles and incorrect for solvable ones.

## Motivation

Consistent with the `areaAndPerimeter` distractor pattern (see `.opencode/plans/perimeter.md` Tier H + D4–D6). Trains students to verify the presence of a right angle before reaching for the "doesn't work" answer.

## Changes

### 1. `src/lib/components/exercises/Pythagoras.svelte`

- **Remove** the `isNonRight` guard on the `submitExtra` snippet so the "Doesn't work" button always renders (even for right triangles).
- The button renders alongside the numeric input. For right triangles, clicking it submits `"cannot_complete"` — which `validatePythagoras` will reject (since `exercise.answer` is a numeric fraction). `Feedback` already handles both answer types correctly (lines 172–182).

```diff
 {#snippet submitExtra()}
-  {#if isNonRight && feedback === null}
+  {#if feedback === null}
     <button class="cannot-compute-link" onclick={handleCannotCompute} title={cannotComputeShort}>
       {cannotComputeShort}
     </button>
   {/if}
 {/snippet}
```

- For feedback display on right triangles where user clicked "Doesn't work" (incorrect), the existing `{:else}` branch at line 178 handles it fine — it shows `correctLatex={data.answerLatex}`.

### 2. (Optional) i18n — new feedback key for distractor trap

The existing `feedback.pythagoras.cannotCompute` message is shown via `correctMessage` only when the answer is actually `cannot_compute` (line 175). When a user clicks "Doesn't work" on a right triangle, they'll get the generic incorrect feedback. Consider adding a more instructive message:

```ts
'feedback.pythagoras.distractorTrap': {
  en: 'There is a right angle, so the Pythagorean theorem can be applied. Try calculating the missing side.',
  de: 'Es gibt einen rechten Winkel, also kann der Satz des Pythagoras angewendet werden. Versuche die fehlende Seite zu berechnen.',
},
```

Then in `Pythagoras.svelte`, add a case: if `exercise.answer !== 'cannot_compute' && userInput === 'cannot_compute'`, show this message.

### 3. Test updates (`src/lib/exercises/pythagoras.test.ts`)

- Add tests for the right-triangle distractor scenario:
  - Generate a right triangle exercise, submit `"cannot_compute"`, expect `validatePythagoras` to return `false`.
  - Verify that for every generated right triangle, a numeric answer is still accepted and `"cannot_compute"` is rejected.
  - (Component test, if applicable) Verify the button renders even when `isRight === true`.

### 4. No changes needed

- **Generator** (`pythagoras.ts`): unchanged — `validatePythagoras` already rejects `"cannot_compute"` when `exercise.answer !== "cannot_compute"`.
- **ExerciseShell** (`ExerciseShell.svelte`): no changes — `submitExtra` slot already works unconditionally.
- **Registration / discipline**: unchanged.
- **Complexity scaling**: the button now appears at all complexities (0–10), matching the goal of "every exercise".

## Acceptance criteria

1. "Doesn't work" button visible on all Pythagoras exercises before submission.
2. On non-right triangles: clicking "Doesn't work" → correct (`cannot_compute`).
3. On right triangles: clicking "Doesn't work" → incorrect; student must enter the numeric answer.
4. Existing right-triangle flow (numeric input, submit) unaffected.
5. All existing tests pass.
