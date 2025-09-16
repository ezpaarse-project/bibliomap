<template>
  <div class="bubble">
    <div
      class="bubble-circle"
      :style="{ width: size + 'px', height: size + 'px', background: color, opacity: 0.3 }"
    />
    <div
      class="bubble-pulse"
      :style="{ width: size * 2 + 'px', height: size * 2 + 'px', opacity: 0.3, boxShadow: `0 0 8px 0 ${props.color}` }"
    />
  </div>
</template>

<script setup lang="ts">
  import { useConfigStore } from '@/stores/config';

  const { config } = storeToRefs(useConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize / 2 || 30);

  const props = defineProps({
    color: String,
  })
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
</style>
