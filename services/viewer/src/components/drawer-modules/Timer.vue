<template>
  <ReplayTimer v-if="replayMode" />
  <LiveTimer v-else />
</template>


<script setup lang="ts">
  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
</script>

<style lang="scss">
  .time-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: .5rem;
    gap: .5rem;
  }

  .timer-multiplier-container{
    display: flex;
    gap: .5rem;
  }

  .start-end-dates{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: wrap;
    gap: .5rem;
  }
</style>
