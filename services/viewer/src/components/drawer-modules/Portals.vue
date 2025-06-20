<template>
  <div v-if="portals && portals.length > 0" class="portals-component">
    <a
      v-for="{name, color} in portals"
      :key="name"
      class="anchor"
      target="_blank"
    >
      <v-list-item class="portal-list-element">

        <v-tooltip
          :disabled="!countStore.getCountOfPortal(name)"
          location="right"
        >
          <template #activator="{ props }">
            <div class="portal-list-item" v-bind="props">
              <div class="portal-container">
                <div class="portal-title-container">
                  <h3 class="title-font">{{ name.toUpperCase() }}</h3>
                </div>
              </div>
              <v-chip
                :color="color"
                variant="flat"
              >
                {{ countStore.getCountOfPortal(name) }}
              </v-chip>
            </div>
          </template>
          <div>
            <div
              v-for="mime in countStore.getMimeInPortal(name)"
              :key="mime"
            >
              {{ mime }}: {{ countStore.getCountOfPortalAndMime(name, mime) }}
            </div>
          </div>
        </v-tooltip>
      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useEcCountStore } from '@/stores/ec-count';
  import { type Portal, usePortalsStore } from '@/stores/portals.ts';
  import useMitt from '@/composables/useMitt';

  const emitter = useMitt();

  const countStore = useEcCountStore();
  const portalStore = usePortalsStore();

  const portals = ref([] as Portal[])

  emitter.on('files-loaded', async () => {
    const fetchedPortals = await portalStore.getPortals();
    if (!fetchedPortals) return;
    portals.value = fetchedPortals;
  })
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
