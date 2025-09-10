<template>
  <v-btn v-tooltip="{ text: t('fabButton.tooltips.counter'), location: 'left'}" color="indigo" icon="mdi-counter" @click="showCounterDrawer" />
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
