<template>
  <div class="portals-component">
    <v-list-item v-for="(value, key) in portals" :key="key">
      <div class="portal-list-item">
        <div class="portal-container">
          <img v-if="value.icon" :src="getIconUrl(value.icon)">
          <div>
            <h3>{{ key }}</h3>
            <p>{{ value.subtitle }}</p>
          </div>
        </div>
        <v-chip v-if="counts[key] != null" :color="portals[key].color" variant="flat">{{ counts[key] }}</v-chip>
      </div>
    </v-list-item>
  </div>
</template>

<script setup lang="ts">
  import config from '@/assets/config.json';
  import type { Log } from '@/pages/index.vue';
  import { useSocketStore } from '@/stores/socket';

  const portals = config.portals;

  const counts = reactive({} as Record<string, number>);

  Object.keys(portals).forEach(key => {
    counts[key] = 0;
  });

  const io = useSocketStore().getSocket();
  io?.on('log', (log: Log) => {
    if (log.ezproxyName && Object.keys(counts).includes(log.ezproxyName.toUpperCase())) {
      counts[log.ezproxyName.toUpperCase()] += 1;
    }
  });

  const getIconUrl = (iconName: string): string => {
    const str = `../assets/${iconName}`
    return new URL(str, import.meta.url).href;
  };
</script>

<style lang="scss">
  .portals-component{
    margin: .5rem 0;
  }
  .portal-list-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .portal-container{
    display: flex;
    height: 3rem;
    margin: .1rem 0;
    gap: 1rem;

    h3{
      font-size: 16px;
      font-weight: normal;
    }
    p{
      font-size: 12px;
    }
  }
</style>
