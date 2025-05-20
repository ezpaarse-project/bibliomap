<template>
  <div class="card-version-container">
    <LiveCard v-if="config.realTimeMode" />
    <ReplayCard v-else />
  </div>
</template>

<script setup lang="ts">
  import config from '@/assets/config.json';
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
