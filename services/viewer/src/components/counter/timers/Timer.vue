<template>
  <ReplayTimer v-if="replayMode" />
  <LiveTimer v-else />
</template>

<script setup lang="ts">
  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
</script>
