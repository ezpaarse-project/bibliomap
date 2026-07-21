<template>
  <div>
    <ReplayCard v-if="replayMode" />
    <LiveCard v-else />
  </div>
</template>

<script setup lang='ts'>
  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
</script>
