<template>
  <v-fab
    color="indigo"
    icon
    location="right bottom"
    size="large"
  >
    <v-icon> mdi-menu </v-icon>
    <v-speed-dial v-model="open" activator="parent" location="top center" transition="slide-y">

      <InfoButton v-if="config.dialogDrawerParams.include" key="1" />

      <CounterButton key="2" />

      <SettingsButton key="3" />

      <TranslationButton key="4" />

      <ChangeMapTypeButton key="5" />

      <CenterMapButton key="6" />
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const config = useViewerConfigStore().config;

  const open = ref(false)
</script>
