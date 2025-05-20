<template>
  <v-tooltip location="bottom" :text="t('appbar.tooltips.center-map')">
    <template #activator="{ props: centerMapProps }">
      <v-btn icon="mdi-target" v-bind="centerMapProps" @click="centerMap" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const emitter = useMitt();
  function centerMap () {
    emitter.emit('centerMap', null);
  }

</script>
