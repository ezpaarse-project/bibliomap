<template>
  <v-app>
    <v-main>
      <Drawer />
      <InformationDrawer />
      <SettingsDialog />
      <div class="h-100 w-100 d-flex flex-column justify-end">
        <v-row align="start" class="pa-0" justify="space-between">
          <v-col class="ma-4" cols="auto" style="z-index: 1000;">
            <StateCard />
          </v-col>
          <v-col cols="auto">
            <Minimap class="ma-6 mr-14" style="z-index: 1000;" />
          </v-col>
        </v-row>

        <v-row align="end" class="pa-0" justify="end">
          <v-col class="mr-6 pa-0 d-flex align-center justify-space-around" cols="auto" style="z-index: 1000;">
            <FabButton />
          </v-col>
        </v-row>
      </div>
    </v-main>
    <v-container />
    <WorldMap style="z-index: 0;" />
    <ProgressBar />
    <FileTooLargeDialog />
    <EventInfoSheet />
  </v-app>
</template>

<script lang="ts" setup>
  import Drawer from '@/components/Drawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { onBeforeUnmount, onMounted } from 'vue';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { usePlayerFileStore } from '@/stores/player-file';

  const { state } = storeToRefs(usePlayStateStore());
  const { files } = storeToRefs(usePlayerFileStore());

  function handleBeforeUnload (event: BeforeUnloadEvent) {
    if (state.value === PlayState.STOPPED && !files.value.length) return;

    event.preventDefault();
    event.returnValue = '';
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

</script>

<style>
html {
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
