<template>
  <div class="counter-container">
    <v-tooltip v-for="(value, key) in counts" :key="key" location="top" :text="`${value} consultations de fichiers ${key}`">
      <template #activator="{ props }">
        <v-badge :content="value">
          <v-chip v-bind="props" :color="mimes[key as keyof typeof mimes].color" variant="flat">
            {{ key }}
          </v-chip>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip v-if="counterProps.showTotal" location="top" :text="`Nombre total de consultations : ${total}`">
      <template #activator="{ props }">
        <v-badge :content="total">
          <v-chip v-bind="props">Total</v-chip>
        </v-badge>
      </template>
    </v-tooltip>
  </div>
</template>


<script setup lang='ts'>
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/pages/index.vue';
  import { useSocketStore } from '@/stores/socket';

  const counts = reactive({} as Record<string, number>);
  const total = ref(0);

  const config = ref(useViewerConfigStore().config);
  const counterProps = config.value.counter;
  const mimes = config.value.mimes;

  Object.keys(mimes).forEach(key => {
    if (mimes[key as keyof typeof mimes].count) counts[key] = 0;
  });

  const io = useSocketStore().getSocket();
  io?.on('log', (log: Log) => {
    if (log.mime && Object.keys(counts).includes(log.mime) && log.ezproxyName && Object.keys(config.value.portals).includes(log.ezproxyName)) {
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
