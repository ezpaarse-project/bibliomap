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
      <CounterButton key="2" />
      <SettingsButton key="3" />
      <TranslationButton key="4" />
      <ChangeMapTypeButton key="5" />
      <CenterMapButton key="6" />
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
