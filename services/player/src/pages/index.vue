<template>
  <main>
    <Drawer />
    <WorldMap />
    <Minimap v-if="config.minimapParams.include" />
    <VersionCard />
    <InformationDrawer />
    <SettingsDialog />
    <ProgressBar />
    <FileTooLargeDialog />
  </main>
</template>

<script lang="ts" setup>
  import Drawer from '@/components/Drawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const config = useViewerConfigStore().config;
</script>

<style>
html {
  overflow: auto;
}
</style>
