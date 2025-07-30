<template>
  <div class="bubble">
    <div
      class="bubble-circle"
      :style="{ width: size + 'px', height: size + 'px', background: gradient}"
    />
    <div
      class="bubble-pulse"
      :style="{ width: size * 2 + 'px', height: size * 2 + 'px', boxShadow: `1 1 8 0 black`}"
    />
  </div>
</template>
<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const { config } = storeToRefs(useViewerConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize || 60);

  const props = defineProps<{
    colors?: string[]
  }>()

  const gradient = computed(() => {
    if (!props.colors || props.colors.length === 0) return 'transparent'
    return `linear-gradient(to right, ${props.colors.join(', ')})`
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
