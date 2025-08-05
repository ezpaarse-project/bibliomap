<template>
  <v-btn v-tooltip="{text: t('fabButton.tooltips.settings'), location: 'bottom'}" color="blue-grey-darken-4" icon="mdi-cog" @click="emitter.emit('showSettings', null)" />
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
</script>
