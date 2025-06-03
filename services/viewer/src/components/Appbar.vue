<template>
  <v-app-bar v-if="props.include" elevation="5" height="48">
    <div class="app-bar-content">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="toggleDrawer"
      />
      <div>
        <CenterMapButton />

        <TranslationButton />

        <ChangeMapTypeButton />

        <SettingsButton />

        <InfoButton v-if="config.dialogDrawerParams.include" />
      </div>

    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const config = useViewerConfigStore().config;
  const props = config.appbarParams;
  const emitter = useMitt();

  function toggleDrawer () {
    emitter.emit('toggleDrawer', null);
  }
</script>
