<script lang="ts">
  interface Point {
    x: number;
    y: number;
  }

  let {
    vertices,
    padding = 28,
    children,
    overlays,
  }: {
    vertices: Point[];
    padding?: number;
    children?: import('svelte').Snippet;
    overlays?: import('svelte').Snippet<[{ pct: (x: number, y: number) => string }]>;
  } = $props();

  const viewBounds = $derived.by(() => {
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  });
  const viewBoxAttr = $derived(`${viewBounds.minX} ${viewBounds.minY} ${viewBounds.width} ${viewBounds.height}`);

  function pct(x: number, y: number): string {
    const left = ((x - viewBounds.minX) / viewBounds.width) * 100;
    const top = ((y - viewBounds.minY) / viewBounds.height) * 100;
    return `left: ${left}%; top: ${top}%;`;
  }
</script>

<div class="svg-container">
  <svg viewBox={viewBoxAttr}>
    {#if children}
      {@render children()}
    {/if}
  </svg>

  {#if overlays}
    {@render overlays({ pct })}
  {/if}
</div>

<style>
  .svg-container {
    position: relative;
    display: block;
    max-width: 360px;
    margin: 0.5rem auto;
  }

  .svg-container :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }

  :global(.svg-overlay) {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
</style>
