<template>
  <v-btn v-tooltip="{text: t('appbar.tooltips.info'), location: 'bottom'}" icon="mdi-information" @click="emitter.emit('showInfoDialog', null)" />
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
