<script lang="ts">
  let { value = 0 }: { value: number } = $props();
</script>

<div class="progress-bar">
  <div class="progress-fill" style="width: {Math.round(value * 100)}%"></div>
</div>

<style>
  .progress-bar {
    width: 300px;
    height: 12px;
    background: #e5e4e7;
    border-radius: 6px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #ff88ff;
    border-radius: 6px;
    transition: width 0.3s ease;
  }
</style>
