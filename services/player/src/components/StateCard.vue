<template>
  <div class="card-container">
    <PlayingCard v-if="state === PlayState.PLAYING" />
    <PauseCard v-if="state === PlayState.PAUSED" />
    <StoppedCard v-if="state === PlayState.STOPPED" />
    <LoadingCard v-if="state === PlayState.LOADING" />
  </div>
</template>

<script setup lang='ts'>
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import PlayingCard from '@/components/state-cards/PlayingCard.vue';
  import PauseCard from '@/components/state-cards/PauseCard.vue';

  const { state } = storeToRefs(usePlayStateStore());
</script>

<style scoped lang="scss">
  .card-container {
    z-index: 1000;
    position: relative;
    top: calc(100dvh - 90px);
    left: 20px;
    opacity: 1;
    max-width: 110px;
  }
</style>
