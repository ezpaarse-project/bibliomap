<template>
  <main>
    <Drawer />
    <WorldMap />
    <Minimap v-if="config.minimapParams.include" />
    <VersionCard />
    <DialogDrawer />
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

  export type Log = {
    datetime: string,
    url?: string,
    domain?: string,
    publication_title?: string,
    ezproxyName: string,
    'geoip-latitude': number,
    'geoip-longitude': number,
    mime?: string,
    platform_name: string | null | undefined,
    rtype?: string,
  }

  const socket = io('localhost:27780');

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
