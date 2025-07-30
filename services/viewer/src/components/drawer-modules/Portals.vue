<template>
  <div class="portals-component">
    <a
      v-for="(value) in portals"
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
            <v-row
              class="mx-2 my-3 align-center"
              v-bind="props"
              justify="space-between"
              no-gutters
            >
              <v-col class="d-flex align-center" cols="10">
                <img
                  v-if="value.icon"
                  class="mr-3"
                  height="40"
                  :src="getIconUrl(value.icon)"
                  width="40"
                >
                <div class="portal-title-container">
                  <h3 class="mb-1" style="font-size: 16px;">
                    {{ t(`drawer-custom.portals.${value.name}.title`) }}
                  </h3>
                  <p v-if="t(`drawer-custom.portals.${value.name}.subtitle`)" class="mb-0">
                    {{ t(`drawer-custom.portals.${value.name}.subtitle`) }}
                  </p>
                </div>
              </v-col>

              <v-col class="d-flex justify-end" cols="2">
                <v-chip :color="value.color" variant="flat">
                  {{ countStore.getCountOfPortal(value.name.toUpperCase()) }}
                </v-chip>
              </v-col>
            </v-row>
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

  type Portal = {
    name: string,
    url: string,
    icon?: string,
    color: string
  }

  const config = useViewerConfigStore().config;
  const { t } = useI18n();

  const portals = config.drawerParams.portalSection.portals as Portal[];
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
  .portal-list-element{
    background-color: white;
    transition: filter 0.2s ease-in-out;
  }
  .portal-list-element:hover{
      filter: brightness(0.8);
  }
</style>
