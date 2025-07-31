<template>
  <div class="bubble">
    <div
      class="bubble-circle multicolor"
      :style="{width: size + 'px', height: size + 'px'}"
    />
    <div
      class="bubble-pulse"
      :style="{width: size*2 + 'px', height: size*2 + 'px'}"
    />
  </div>
</template>
<script lang="ts" setup>
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const { config } = storeToRefs(useViewerConfigStore());
  const size = computed(() => config.value.mapParams.bubbleSize || 60);
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
    animation: pulsate 1s ease-in-out infinite, multicolor-pulse 7s ease-in-out infinite;
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

  @keyframes multicolor-pulse {
    0% {
      box-shadow: 0 0 8px 0 hsl(0, 100%, 50%);
    }
    25% {
      box-shadow: 0 0 8px 0 hsl(90, 100%, 50%);
    }
    50% {
      box-shadow: 0 0 8px 0 hsl(180, 100%, 50%);
    }
    75% {
      box-shadow: 0 0 8px 0 hsl(270, 100%, 50%);
    }
    100% {
      box-shadow: 0 0 8px 0 hsl(360, 100%, 50%);
    }
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
