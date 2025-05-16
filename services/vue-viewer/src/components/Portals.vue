<template>
  <div class="portals-component">
    <v-list-item v-for="(value, key) in config.portals" :key="key">
      <div class="portal-list-item">
        <div class="portal-container">
          <img v-if="value.icon" :src="getIconUrl(value.icon)">
          <div>
            <h3>{{ t(`drawer-custom.portals.${key}.title`) }}</h3>
            <p>{{ t(`drawer-custom.portals.${key}.subtitle`) }}</p>
          </div>
        </div>
        <v-chip v-if="counts[key] != null" :color="config.portals[key].color" variant="flat">{{ counts[key] }}</v-chip>
      </div>
    </v-list-item>
  </div>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import { useSocketStore } from '@/stores/socket';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import { useI18n } from 'vue-i18n';

  const config = ref(useViewerConfigStore().config);
  const { t } = useI18n();

  const counts = reactive({} as Record<string, number>);

  Object.keys(config.value.portals).forEach(key => {
    counts[key] = 0;
  });

  const io = useSocketStore().getSocket();
  io?.on('log', (log: Log) => {
    if (usePlatformFilterStore().getFilter() && log.platform_name && !((usePlatformFilterStore().getFilter().toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(usePlatformFilterStore().getFilter().toUpperCase())))) return;
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
