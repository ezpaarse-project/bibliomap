<template>
  <v-tooltip location="left" :text="t('fabButton.tooltips.counter')">
    <template #activator="{ props: centerMapProps }">
      <v-btn color="indigo" icon="mdi-counter" v-bind="centerMapProps" @click="showCounterDrawer" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const emitter = useMitt();
  function showCounterDrawer () {
    emitter.emit('showCounterDrawer', null);
  }

</script>
