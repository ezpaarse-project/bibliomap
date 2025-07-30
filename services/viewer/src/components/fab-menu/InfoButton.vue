<template>
  <v-btn v-tooltip="{text: t('fabButton.tooltips.info'), location: 'bottom'}" icon="mdi-information" @click="emitter.emit('showInfoDialog', null)" />
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
