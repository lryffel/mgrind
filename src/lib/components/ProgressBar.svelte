<script lang="ts">
  let { value }: { value: number } = $props();
</script>

<div
  class="progress-bar"
  class:full={value >= 1}
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin="0"
  aria-valuemax="1"
>
  <div class="progress-gradient" style="clip-path: inset(0 {100 - value * 100}% 0 0 round 0.3125rem)"></div>
</div>
