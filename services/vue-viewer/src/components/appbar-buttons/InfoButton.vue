<template>
  <v-tooltip location="bottom" :text="t('appbar.tooltips.info')">
    <template #activator="{ props: infoProps }">
      <v-btn icon="mdi-information" v-bind="infoProps" @click="emitter.emit('showInfoDialog', null)" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
