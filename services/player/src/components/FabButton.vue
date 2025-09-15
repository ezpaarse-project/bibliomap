<template>
  <v-fab
    color="indigo"
    icon
    location="right bottom"
    size="large"
  >
    <v-icon> mdi-menu </v-icon>
    <v-speed-dial v-model="open" activator="parent" location="top center" transition="slide-y">
      <InfoButton key="1" />
      <SettingsButton key="2" />
      <ChangeMapTypeButton key="3" />
      <TranslationButton key="4" />
      <CenterMapButton key="5" />
      <CounterButton key="6" />
    </v-speed-dial>
  </v-fab>
</template>

<script setup lang="ts">
  import TranslationButton from '@/components/fab/TranslationButton.vue';
  import ChangeMapTypeButton from '@/components/fab/ChangeMapTypeButton.vue';
  import SettingsButton from '@/components/fab/SettingsButton.vue';
  import InfoButton from '@/components/fab/InfoButton.vue';
  import CenterMapButton from '@/components/fab/CenterMapButton.vue';

  const open = ref(false)
</script>
