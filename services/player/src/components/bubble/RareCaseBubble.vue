<template>
  <div class="bubble">
    <div class="bubble-circle">
      <div class="image-wrapper" :style="{ width: size * 1.5 + 'px', height: size * 1.5 + 'px' }">
        <img
          ref="imageEl"
          src="@/assets/rare-case.png"
          :style="{ width: '100%', height: '100%' }"
        >
        <div
          class="color-overlay"
          :style="{ backgroundColor: `${color}80` }"
        />
      </div>
    </div>

    <div
      v-if="state === PlayState.PLAYING"
      class="bubble-pulse"
      :style="{ width: size * 2 + 'px', height: size * 2 + 'px', boxShadow: `0 0 8px 0 ${color}` }"
    />
  </div>
</template>
<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';

  const { config } = storeToRefs(useViewerConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize || 60);
  const { state } = storeToRefs(usePlayStateStore());

  defineProps({
    color: String,
  });
</script>
<style lang="scss" scoped>
  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  .bubble {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: translateY(20px)
  }

  .bubble-circle {
    border-radius: 100%;
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


.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background-color: rgba(255, 0, 0, 0.2);
  pointer-events: none;
}

.image-wrapper {
  position: relative;
  animation: img-animation 1s ease-in-out infinite;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes img-animation {
  0%{
    transform: scale(1);
  }
  50%{
    transform: scale(1.2);
  }
  100%{
    transform: scale(1);
  }
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  pointer-events: none;

  mask-image: url('@/assets/rare-case.png');
  mask-size: cover;
  mask-repeat: no-repeat;
  mask-position: center;

  -webkit-mask-image: url('@/assets/rare-case.png');
  -webkit-mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}


</style>
