<template>
  <PlayingCard v-if="state === PlayState.PLAYING" />
  <PauseCard v-if="state === PlayState.PAUSED" />
  <StoppedCard v-if="state === PlayState.STOPPED" />
  <LoadingCard v-if="state === PlayState.LOADING" />
</template>

<script setup lang='ts'>
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  const { state } = storeToRefs(usePlayStateStore());
</script>
