<template>
  <div class="counter-container">
    <v-badge v-for="(key, value) in counts" :key="value" :content="key"><v-chip>{{ value }}</v-chip></v-badge>
    <v-badge v-if="props.showTotal" :content="total"><v-chip>Total</v-chip></v-badge>
  </div>
</template>

<script setup lang='ts'>
  import config from '@/assets/config.json';
  import type { Log } from '@/pages/index.vue';
  import { useSocketStore } from '@/stores/socket';

  const counts = reactive({} as Record<string, number>);
  const total = ref(0);

  const props = config.counter;

  const mimes = config.mimes;
  Object.keys(mimes).forEach(key => {
    if (mimes[key].count) counts[key] = 0;
    console.log('COUNT', counts);
  });

  const io = useSocketStore().getSocket();
  io?.on('log', (log: Log) => {
    if (log.mime && Object.keys(counts).includes(log.mime)) {
      counts[log.mime] += 1;
      total.value += 1;
    }
  });
</script>

<style lang="scss">
  .counter-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    margin: 1rem .5rem;
    flex-wrap: wrap;
  }
</style>
