# Einheiten umrechnen (unit conversion)

## Description

Convert a quantity from one unit to another within the same category (length, mass, volume, time). Single-step and multi-step conversions, metric (powers of 10) and time (factors 60, 24).

## Acceptance Criteria

### Unit categories

| Category | Units             |
| :------- | :---------------- |
| Length   | mm, cm, dm, m, km |
| Mass     | mg, g, kg, t      |
| Volume   | mL, cL, dL, L     |
| Time     | s, min, h, d      |

### Generation

Pick category, source and target units (indices from category's ordered unit list), source value, and compute result = source × conversion factor.

- Conversion factor: metric categories → powers of 10; time → 60 (s↔min, min↔h), 24 (h↔d), 3600 (s↔h).
- Source values chosen so result is always terminating (no repeating decimals).
- At low levels, direction favours `to smaller unit` (multiply → fewer decimals). At higher levels, both directions appear.
- **No-calculator guarantee:** all conversions involve at most 3-digit source values and factors that are powers of 10, 60, 24, or 3600 — simple mental arithmetic. No imperial units (only metric and time).

### Complexity scaling

| Level | Category     |         Steps         | Source              | Decimals         |
| ----: | :----------- | :-------------------: | :------------------ | :--------------- |
|     0 | length       |           1           | integer 1–999       | 0                |
|     1 | length       |           1           | 1–999 with decimals | ≤1               |
|     2 | length, mass |           1           | integer             | 0                |
|     3 | metric any   |           1           | integer, decimal    | ≤1               |
|     4 | metric       |           1           | mixed directions    | ≤1               |
|     5 | metric       |     2 (e.g. mm→m)     | integer             | 0                |
|     6 | metric       |          2–3          | ≤1 decimal          | ≤2               |
|     7 | time         | 1 (s↔min, min↔h, h↔d) | divisible source    | 0                |
|     8 | time         |        1 mixed        | any integer         | ≤2               |
|     9 | time         |     2 (s↔h ×3600)     | integer             | ≤3               |
|    10 | mixed        |          1–3          | ≤3 decimals         | ≤4, may be small |

### Pattern

Use `pattern: 'text-input'`. No custom component needed — `CardRegistry.svelte` routes `text-input` to `TextInputCard.svelte`, which already renders a `NumericInput` after the prompt.

### Data representation

- Prompt rendered as a single LaTeX expression: `3.5\ \mathrm{m} = ?\ \mathrm{cm}` with the `?` via `\boxed{?}` or just a placeholder. Use `\mathrm{}` for units.
- Data shape: `{ promptKey: 'exercise.unitConversion.prompt', unitFrom: string, unitTo: string }`. The `TextInputCard` renders `promptKey` as the prompt label.
- `exercise.prompt`: the LaTeX conversion expression.
- `exercise.answer`: numeric string (e.g. `"350"`).

### Validation

Custom `validateUnitConversion(answer, exercise)`:

- Parse as float (accept `.` and `,` decimal separator).
- Compare absolute difference to correct value with tolerance `1e-9`.
- Reject NaN, Infinity, empty.

### i18n

| Key                              | en                                 | de                                     |
| -------------------------------- | ---------------------------------- | -------------------------------------- |
| `exercise.unitConversion.name`   | "Unit Conversion"                  | "Einheiten umrechnen"                  |
| `exercise.unitConversion.desc`   | "Convert quantities between units" | "Rechne Grössen zwischen Einheiten um" |
| `exercise.unitConversion.prompt` | "Convert."                         | "Rechne um."                           |

### Discipline

- `numbers` (add exercise type id `unitConversion`).

### Test coverage

1. Deterministic generation.
2. Correct results for all categories and step counts (verify against known factors).
3. All categories active in their complexity bands.
4. Source values produce terminating decimal results.
5. Validation: correct answer passes; off-by-factor-10 fails; wrong unit result fails; comma-decimal accepted; fraction rejected.
6. Edge: zero source (0 g = 0 mg); identity conversion excluded; time conversion always uses divisible source.
7. Complexity clamping.

## Progress

## Blockers

## Notes

Original: `TODO.md` — New Exercise Types
