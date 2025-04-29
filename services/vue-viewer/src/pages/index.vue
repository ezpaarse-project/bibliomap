<template>
  <main>
    <LeftDrawer />
    <WorldMap />
  </main>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import LeftDrawer from '@/components/LeftDrawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { io } from 'socket.io-client';
  // import config from 'config';

  // const viewerUrl = `${process.env.BBV_LISTEN_ENRICHER_HOST}:${process.env.BBV_LISTEN_ENRICHER_PORT}`;

  // console.log('viewer url', viewerUrl);

  // To update with all broadcast arguments
  interface Log {
    datetime: string,
    ezProxyName: string,
    'geoip-latitude': number,
    'geoip-longitude': number,
    mime: string,
    Platform_name: string | null | undefined,
    rtype: string | null | undefined,
  }

  const socket = io('localhost:27780');

  const handleLog = (log: Log) => {
    console.log(log);
  }

  onMounted(() => {
    console.log('SOCKET:', socket);
    socket.on('connect', () => console.log('Enricher connected'));
    socket.on('log', handleLog)
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
