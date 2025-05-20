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
  import { io } from 'socket.io-client';
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const websocketUrl = import.meta.env.VITE_ENRICHER_WEBSOCKET_URL;
  const socket = io(websocketUrl);

  const socketStore = useSocketStore();
  socketStore.setSocket(socket);

  const config = ref(useViewerConfigStore().config);

  onMounted(() => {
    socket.on('connect', () => console.log('Enricher connected'));
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
