<template>
  <div>
    <a
      v-for="(value) in portals"
      :key="value.name"
      class="anchor"
      :href="value.url"
      target="_blank"
    >
      <v-list-item>
        <v-tooltip
          :disabled="!countStore.getCountOfPortal(value.name.toUpperCase())"
          location="right"
        >
          <template #activator="{ props }">
            <div class="d-flex align-center justify-between mx-2 my-3" v-bind="props">
              <div class="d-flex align-center">
                <img
                  v-if="value.icon"
                  class="mr-3"
                  height="40"
                  :src="getIconUrl(value.icon)"
                  width="40"
                >
                <div>
                  <h6 class="mb-1">
                    {{ t(`drawer-custom.portals.${value.name}.title`) }}
                  </h6>
                  <p v-if="t(`drawer-custom.portals.${value.name}.subtitle`)" class="mb-0">
                    {{ t(`drawer-custom.portals.${value.name}.subtitle`) }}
                  </p>
                </div>
              </div>

              <v-spacer />

              <v-chip :color="value.color" :style="{ minWidth: 'fit-content' }" variant="flat">
                {{ countStore.getCountOfPortal(value.name.toUpperCase()) }}
              </v-chip>
            </div>
          </template>
          <div class="d-flex flex-row">
            <div
              v-for="mime in countStore.getMimeInPortal(value.name.toUpperCase())"
              :key="mime"
              class="ma-1"
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
  import { useConfigStore } from '@/stores/config';
  import { useEcCountStore } from '@/stores/ec-count';
  import { useI18n } from 'vue-i18n';

  type Portal = {
    name: string,
    url: string,
    icon?: string,
    color: string
  }

  const configStore = useConfigStore();
  const { t } = useI18n();

  const portals = computed(() => configStore.config.drawerParams.portalSection.portals as Portal[]);

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
  .portal-list-element:hover{
      filter: brightness(0.8);
  }
</style>
