<template>
  <main>
    <Appbar />
    <Drawer />
    <WorldMap />
    <Minimap v-if="config.minimapParams.include" />
    <VersionCard />
    <InformationDrawer />
    <SettingsDialog />
  </main>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import Drawer from '@/components/Drawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { useSocketStore } from '@/stores/socket';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { type ReplayConfig, useReplayConfigStore } from '@/stores/replay-config';

  const socket = useSocketStore().socket;
  const replayConfigStore = useReplayConfigStore();
  const config = useViewerConfigStore().config;

  onMounted(() => {
    socket.on('connect', async () => {
      console.log('Enricher connected');
      replayConfigStore.setConfig(await replayConfigStore.fetchReplayConfig() as ReplayConfig);
      console.log('replayConfig:', replayConfigStore.config);
    });
  })

  onUnmounted(() => {
    socket.off();
  })

</script>

<style>
html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
