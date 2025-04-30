<template>
  <main>
    <LeftDrawer />
    <WorldMap :io="socket" />
  </main>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import LeftDrawer from '@/components/LeftDrawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { io } from 'socket.io-client';

  export interface Log {
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


  onMounted(() => {
    socket.on('connect', () => console.log('Enricher connected'));
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
