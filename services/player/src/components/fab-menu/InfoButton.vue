<template>
  <span>
    <v-btn v-tooltip="{text: t('appbar.tooltips.info'), location: 'right'}" icon="mdi-information" @click="emitter.emit('showInfoDialog', null)" />
  </span>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
