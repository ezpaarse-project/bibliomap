<template>
  <div class="card-version-container">
    <ReplayCard v-if="replayMode" />
    <LiveCard v-else />
  </div>
</template>

<script setup lang='ts'>
  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
</script>

<style scoped lang="scss">
  .card-version-container {
    z-index: 1000;
    position: relative;
    top: calc(100dvh - 90px);
    left: 20px;
    opacity: 1;
    max-width: 110px;
  }
</style>
