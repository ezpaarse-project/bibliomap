<template>
  <v-app>
    <Drawer />
    <InformationDrawer />
    <SettingsDialog />
    <v-main>
      <v-container class="position-relative" fluid>
        <div class="position-absolute" style="top: 0; left: 0; z-index: 10;">
          <ModeCard />
        </div>

        <div class="position-absolute" style="top: 0; right: 0; z-index: 10;">
          <Minimap />
        </div>

        <div class="position-absolute" style="bottom: 0; right: 0; z-index: 10;">
          <div class="d-flex align-center mb-2">
            <VersionCard />
            <FabButton class="ml-4 mr-2" />
          </div>
        </div>
      </v-container>
    </v-main>
    <WorldMap style="z-index: 0;" />
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import Drawer from '@/components/counter/Drawer.vue';
  import WorldMap from '@/components/map/WorldMap.vue';
  import FabButton from '@/components/fab/FabButton.vue';
  import SettingsDialog from '@/components/fab/settings/Dialog.vue';
  import { useSocketStore } from '@/stores/socket';
  import { type ReplayConfig, useReplayConfigStore } from '@/stores/replay-config';

  const socket = useSocketStore().socket;
  const replayConfigStore = useReplayConfigStore();

  onMounted(() => {
    socket.on('connect', async () => {
      console.log('Enricher connected');
      replayConfigStore.setConfig(await replayConfigStore.fetchReplayConfig() as ReplayConfig);
    });
  })

  onUnmounted(() => {
    socket.off();
  })

</script>
<style>
  html {
    overflow-y: auto;
    overflow-x: hidden;
  }

  .position-relative {
    position: relative;
    height: 100%;
  }
  .position-absolute {
    position: absolute;
    margin: 16px;
  }
</style>
