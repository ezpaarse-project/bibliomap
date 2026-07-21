<template>
  <div class="bauble" :style="baubleStyle">
    <div class="hook"></div>
    <div class="highlight"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const { config } = storeToRefs(useConfigStore())

const props = defineProps({
  color: {
    type: String,
    default: '#c1121f'
  }
})

const size = computed(() => config.value.mapParams.bubbleSize || 80)

const baubleStyle = computed(() => ({
  width: size.value + 'px',
  height: size.value + 'px',
  background: `radial-gradient(circle at top left, #ffffff88, ${props.color} 70%)`
}))
</script>

<style lang="scss" scoped>
.bauble {
  position: absolute;
  border-radius: 50%;
  animation: breathe 2.5s ease-in-out infinite;
  box-shadow: inset -8px -12px 15px rgba(0, 0, 0, 0.35),
              0 8px 15px rgba(0,0,0,0.5);
}

.highlight {
  position: absolute;
  top: 18%;
  left: 22%;
  width: 25%;
  height: 35%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: rotate(-20deg);
  filter: blur(2px);
}

.hook {
  position: absolute;
  top: -8%;
  left: 50%;
  width: 16px;
  height: 16px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: linear-gradient(#ddd, #fcdf03);
  border: 1px solid #fcbe03;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

@keyframes breathe {
  0%   { transform: translate(-50%, -50%) scale(1); }
  50%  { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.bauble {
  top: 25px;
  left: 50%;
}
</style>
