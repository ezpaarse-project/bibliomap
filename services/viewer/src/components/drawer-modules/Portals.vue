<template>
  <div class="portals-component">
    <a
      v-for="(value) in config.drawerParams.portalSection.portals"
      :key="value.name"
      class="anchor"
      :href="value.url"
      target="_blank"
    >
      <v-list-item class="portal-list-element">

        <v-tooltip
          v-if="counts[value.name.toUpperCase()] && Object.keys(counts[value.name.toUpperCase()]).length > 0"
          location="right"
        >
          <template #activator="{ props }">
            <div class="portal-list-item" v-bind="props">
              <div class="portal-container">
                <img v-if="value.icon" :src="getIconUrl(value.icon)">
                <div>
                  <h3>{{ t(`drawer-custom.portals.${value.name}.title`) }}</h3>
                  <p>{{ t(`drawer-custom.portals.${value.name}.subtitle`) }}</p>
                </div>
              </div>
              <v-chip
                :color="value.color"
                variant="flat"
              >
                {{ Object.values(counts[value.name.toUpperCase()]).reduce((a, b) => a + b, 0) }}
              </v-chip>
            </div>
          </template>
          <div>
            <div
              v-for="(val, subKey) in counts[value.name.toUpperCase()]"
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
                <h3>{{ t(`drawer-custom.portals.${value.name}.title`) }}</h3>
                <p>{{ t(`drawer-custom.portals.${value.name}.subtitle`) }}</p>
              </div>
            </div>
            <v-chip
              v-if="counts[value.name.toUpperCase()]"
              :color="value.color"
              variant="flat"
            >
              {{ Object.values(counts[value.name.toUpperCase()]).reduce((a, b) => a + b, 0) }}
            </v-chip>
          </div>
        </template>

      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useLogEventsStore } from '@/stores/log-events';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const { t } = useI18n();

  const counts = useLogEventsStore().count;

  config.drawerParams.portalSection.portals.forEach(p => {
    counts[p.name.toUpperCase()] = {};
  });

  const getIconUrl = (iconName: string): string => {
    const str = `../../assets/${iconName}`
    return new URL(str, import.meta.url).href;
  };
</script>

<style lang="scss">
  .anchor{
    text-decoration: none;
    color: inherit;
    z-index: 100;
  }
  .portals-component{
    margin: .5rem 0;
  }
  .portal-list-element{
    background-color: white;
    transition: filter 0.2s ease-in-out;
  }
  .portal-list-element:hover{
      filter: brightness(0.8);
  }
  .portal-list-item{
    width: 100%;
    height: 100%;
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
