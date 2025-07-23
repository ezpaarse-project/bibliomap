<template>
  <v-tooltip location="left" :text="t('fabButton.tooltips.settings')">
    <template #activator="{ props: settingsProps }">
      <v-btn color="black" icon="mdi-cog" v-bind="settingsProps" @click="emitter.emit('showSettings', null)" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
