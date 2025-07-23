<template>
  <v-tooltip location="left" :text="t('fabButton.tooltips.info')">
    <template #activator="{ props: infoProps }">
      <v-btn color="blue" icon="mdi-information" v-bind="infoProps" @click="emitter.emit('showInfoDialog', null)" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
