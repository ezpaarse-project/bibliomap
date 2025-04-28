<template>
  <main>
    <LeftDrawer />
    <InfoMap />
  </main>
</template>

<script lang="ts" setup>
import LeftDrawer from '@/components/LeftDrawer.vue';
import InfoMap from '@/components/WorldMap.vue';
//
</script>

<style>
html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
