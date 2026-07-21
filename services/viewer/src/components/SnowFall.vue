<template>
  <div class="snow-container" aria-hidden="true">
    <span
      v-for="flake in flakesArray"
      :key="flake.id"
      class="snowflake"
      :style="flake.style"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';

interface Flake {
  id: number;
  style: Record<string, string>;
}

const usingPhone = computed(() => window.innerWidth < 768);


const flakesCount = usingPhone ? 25 : 100;


const flakesArray: Flake[] = reactive([]);

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

onMounted(() => {
  for (let i = 0; i < flakesCount; i++) {
    flakesArray.push({
      id: i,
      style: {
        left: random(0, 100) + '%',
        width: random(3, 10) + 'px',
        height: random(3, 10) + 'px',
        animationDuration: random(9, 20) + 's',
        transform: `translateX(0px) rotate(${random(0, 360)}deg)`,
        opacity: random(0.55, 0.95).toFixed(2),
        filter: `blur(${random(0, 1.2)}px)`,
        animationDelay: '-' + random(0, 20).toFixed(2) + 's',
        '--drift': (Math.random() < 0.5 ? -1 : 1) * random(20, 60) + 'px'
      }
    });
  }
});
</script>

<style scoped>
.snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -10vh;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0) 100%);
  will-change: transform, opacity;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-10vh) translateX(0) rotate(0deg);
  }
  100% {
    transform: translateY(110vh) translateX(var(--drift, 30px)) rotate(360deg);
  }
}
</style>
