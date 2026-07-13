# Interior angle label placement for non-convex polygons

## Description

Angle labels (the `^\circ` readouts and `NumericInput` for the missing angle) are positioned via `labelPos()` in `InteriorAngles.svelte` by offsetting radially outward from the polygon centre `(150, 140)`. For convex polygons this works fine — labels sit outside the shape. For non-convex (concave) polygons, the radial outward direction from centre can place the label _inside_ the polygon, especially at the reflex vertex (angle > 180°), making the label hard to read or overlapping the shape.

## Acceptance Criteria

### Label uses angle bisector + outward normal, not centre radial

Replace `labelPos()` so that the label offset direction is determined locally at each vertex:

1. Compute the interior angle bisector direction from the two adjacent edges.
2. For convex vertices (interior angle ≤ 180°), offset outward along the bisector.
3. For reflex vertices (interior angle > 180°), offset outward along the _reverse_ of the bisector (i.e., the exterior bisector).
4. Offset distance remains `22` px.
5. The arc rendering (`arcPath`) is not affected — arcs are already correct.

### Behaviour must remain correct for convex polygons

The new label placement must produce equivalent (or very similar) results for convex polygons. At convex vertices, the bisector of the interior angle points outward (away from the polygon interior), so the label should end up in approximately the same region as the old centre-radial approach.

### No changes to data model or generator

All changes are confined to the `labelPos()` function in `InteriorAngles.svelte`. No changes to `interiorAngles.ts`, `SvgContainer.svelte`, or any other file.

### Test coverage

1. Non-convex polygon: label positions for all vertices are outside the polygon (point-in-polygon test, or distance from centroid > distance of vertex from centroid).
2. Convex polygon: label positions unchanged within tolerance (< 5 px difference).
3. Reflex vertex label is on the exterior side of the polygon (not inside).

## Progress

## Blockers

## Notes

The bisector direction can be computed from unit vectors along the two edges meeting at the vertex: `bisector = normalize(unit(prev→curr) + unit(curr→next))`. The cross product of the two edge vectors determines convex vs reflex (same sign convention as `arcPath` and `interiorAngleDeg`).
