<template>
  <div class="bubble">
    <div
      class="bubble-circle"
      :style="{ width: size + 'px', height: size + 'px', background: gradient}"
    />
    <div
      v-if="state === PlayState.PLAYING"
      class="bubble-pulse"
      :style="{ width: size * 2 + 'px', height: size * 2 + 'px', boxShadow: `0 0 8px 0 black`}"
    />
  </div>
</template>
<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';

  const { config } = storeToRefs(useViewerConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize || 60);
  const { state } = storeToRefs(usePlayStateStore());

  const props = defineProps<{
    colors?: string[]
  }>()

  const gradient = computed(() => {
    if (!props.colors || props.colors.length === 0) return 'transparent';
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

  @keyframes pulsate {

  $ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";

  0% {
    transform: scale(0.1, 0.1);
    -ms-filter: $ms-filter;
    filter: alpha(opacity=0);
  }
  25% {
    opacity: 1;
    -ms-filter: none;
    filter: none;
  }
  75% {
    opacity: 1;
    -ms-filter: none;
    filter: none;
  }
  100% {
    transform: scale(1.2, 1.2);
    -ms-filter: $ms-filter;
    opacity: 0;
  }
}
</style>
