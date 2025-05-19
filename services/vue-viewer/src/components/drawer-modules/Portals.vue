<template>
  <div class="portals-component">
    <v-list-item v-for="(value, key) in config.drawerParams.portalSection.portals" :key="key">
      <v-tooltip
        v-if="counts[key] && Object.keys(counts[key]).length > 0"
        location="right"
      >
        <template #activator="{ props }">
          <div class="portal-list-item" v-bind="props">
            <div class="portal-container">
              <img v-if="value.icon" :src="getIconUrl(value.icon)">
              <div>
                <h3>{{ t(`drawer-custom.portals.${key}.title`) }}</h3>
                <p>{{ t(`drawer-custom.portals.${key}.subtitle`) }}</p>
              </div>
            </div>
            <v-chip
              :color="config.drawerParams.portalSection.portals[key].color"
              variant="flat"
            >
              {{ Object.values(counts[key]).reduce((a, b) => a + b, 0) }}
            </v-chip>
          </div>
        </template>
        <div>
          <div
            v-for="(val, subKey) in counts[key]"
            :key="subKey"
          >
            {{ subKey }}: {{ val }}
          </div>
        </div>
      </v-tooltip>
      <template v-else>
        <div class="portal-list-item">
          <div class="portal-container">
            <img v-if="value.icon" :src="getIconUrl(value.icon)">
            <div>
              <h3>{{ t(`drawer-custom.portals.${key}.title`) }}</h3>
              <p>{{ t(`drawer-custom.portals.${key}.subtitle`) }}</p>
            </div>
          </div>
          <v-chip
            v-if="counts[key]"
            :color="config.drawerParams.portalSection.portals[key].color"
            variant="flat"
          >
            {{ Object.values(counts[key]).reduce((a, b) => a + b, 0) }}
          </v-chip>
        </div>
      </template>
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

  const counts = reactive({} as Record<string, Record<string, number>>);

  Object.keys(config.value.drawerParams.portalSection.portals).forEach(key => {
    counts[key] = {};
  });

  const io = useSocketStore().getSocket();
  io?.on('log', (log: Log) => {
    if (usePlatformFilterStore().getFilter() && log.platform_name && !((usePlatformFilterStore().getFilter().toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(usePlatformFilterStore().getFilter().toUpperCase())))) return;
    if (!log.ezproxyName || !Object.keys(counts).includes(log.ezproxyName.toUpperCase()) || !log.mime) return;
    if (!counts[log.ezproxyName.toUpperCase()][log.mime]) counts[log.ezproxyName.toUpperCase()][log.mime] = 0;
    counts[log.ezproxyName.toUpperCase()][log.mime] += 1;
  });

  const getIconUrl = (iconName: string): string => {
    const str = `../../assets/${iconName}`
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
