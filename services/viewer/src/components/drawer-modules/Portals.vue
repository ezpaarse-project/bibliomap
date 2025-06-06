<template>
  <div class="portals-component">
    <a
      v-for="portalName in portalStore.getAllPortalNames()"
      :key="portalName"
      class="anchor"
      target="_blank"
    >
      <v-list-item class="portal-list-element">

        <v-tooltip
          :disabled="!countStore.getCountOfPortal(portalName)"
          location="right"
        >
          <template #activator="{ props }">
            <div class="portal-list-item" v-bind="props">
              <div class="portal-container">
                <div class="portal-title-container">
                  <h3 class="title-font">{{ t(`drawer-custom.portals.${portalName}.title`) }}</h3>
                  <p v-if="t(`drawer-custom.portals.${portalName}.subtitle`)">{{ t(`drawer-custom.portals.${portalName}.subtitle`) }}</p>
                </div>
              </div>
              <v-chip
                :color="portalStore.getPortalColor(portalName)"
                variant="flat"
              >
                {{ countStore.getCountOfPortal(portalName) }}
              </v-chip>
            </div>
          </template>
          <div>
            <div
              v-for="mime in countStore.getMimeInPortal(portalName)"
              :key="mime"
            >
              {{ mime }}: {{ countStore.getCountOfPortalAndMime(portalName, mime) }}
            </div>
          </div>
        </v-tooltip>
      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useEcCountStore } from '@/stores/ec-count';
  import { usePortalsStore } from '@/stores/portals.ts';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const countStore = useEcCountStore();
  const portalStore = usePortalsStore();
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
