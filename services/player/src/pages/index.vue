<template>
  <v-app>
    <v-main>
      <Drawer />
      <InformationDrawer />
      <SettingsDialog />
      <v-container class="position-relative" fluid>
        <div class="position-absolute" style="top: 0; left: 0; z-index: 10;">
          <StateCard />
        </div>

        <div class="position-absolute" style="top: 0; right: 0; z-index: 10;">
          <Minimap />
        </div>

        <div class="position-absolute" style="bottom: 0; right: 0; z-index: 10;">
          <FabButton class="mb-4 mr-2" />
        </div>
      </v-container>
    </v-main>
    <WorldMap style="z-index: 0;" />
    <ProgressBar />
    <FileTooLargeDialog />
    <EventInfoSheet />
  </v-app>
</template>

<script lang="ts" setup>
  import Drawer from '@/components/menu/Drawer.vue';
  import WorldMap from '@/components/map/WorldMap.vue';
  import SettingsDialog from '@/components/settings/Dialog.vue';
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

  .position-relative {
    position: relative;
    height: 100%;
  }
  .position-absolute {
    position: absolute;
    margin: 16px;
  }
</style>
