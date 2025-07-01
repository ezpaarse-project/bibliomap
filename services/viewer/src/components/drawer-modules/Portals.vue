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
          :disabled="!countStore.getCountOfPortal(value.name.toUpperCase())"
          location="right"
        >
          <template #activator="{ props }">
            <div class="portal-list-item" v-bind="props">
              <div class="portal-container">
                <img v-if="value.icon" :src="getIconUrl(value.icon)">
                <div class="portal-title-container">
                  <h3 class="title-font">{{ t(`drawer-custom.portals.${value.name}.title`) }}</h3>
                  <p v-if="t(`drawer-custom.portals.${value.name}.subtitle`)">{{ t(`drawer-custom.portals.${value.name}.subtitle`) }}</p>
                </div>
              </div>
              <v-chip
                :color="value.color"
                variant="flat"
              >
                {{ countStore.getCountOfPortal(value.name.toUpperCase()) }}
              </v-chip>
            </div>
          </template>
          <div>
            <div
              v-for="mime in countStore.getMimeInPortal(value.name.toUpperCase())"
              :key="mime"
            >
              {{ mime }}: {{ countStore.getCountOfPortalAndMime(value.name.toUpperCase(), mime) }}
            </div>
          </div>
        </v-tooltip>
      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useEcCountStore } from '@/stores/ec-count';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const { t } = useI18n();

  const countStore = useEcCountStore();

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
  }
  .portal-title-container{
    display: flex;
    flex-direction: column;
    justify-content: center;
    h3{
      font-size: 16px;
      font-weight: bold;
    }
    p{
      font-size: 12px;
    }
  }
</style>
