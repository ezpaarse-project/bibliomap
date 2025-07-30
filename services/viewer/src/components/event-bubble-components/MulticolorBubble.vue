<template>
  <div class="bubble">
    <div
      class="bubble-circle multicolor"
      :style="{width: size, height: size}"
    />
    <div
      class="bubble-pulse"
      :style="{width: size*2, height: size*2, boxShadow: `1 1 8 0 ${color}`}"
    />
  </div>
</template>
<script lang="ts" setup>
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const { config } = storeToRefs(useViewerConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize || 60);

  function getRandomHexColor () {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
  }

  const color = getRandomHexColor();
</script>
<style lang="scss" scoped>
$box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  .bubble {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .bubble-circle {
    border-radius: 100%;
    box-shadow: $box-shadow;
    position: absolute;
  }

  .bubble-pulse {
    animation: pulsate 1s ease-in-out infinite;
    position: absolute;
    border-radius: 100%;
  }

  .multicolor {
    animation: multicolor-animation 7s ease-in-out infinite;
  }

  @keyframes multicolor-animation {
    0% {
      background-color: hsl(0, 100%, 50%);
    }
    25% {
      background-color: hsl(90, 100%, 50%);
    }
    50% {
      background-color: hsl(180, 100%, 50%);
    }
    75% {
      background-color: hsl(270, 100%, 50%);
    }
    100% {
      background-color: hsl(360, 100%, 50%);
    }
  }
</style>
