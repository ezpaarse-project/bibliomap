<template>
  <v-btn v-tooltip="{text: t('appbar.tooltips.settings'), location: 'bottom'}" :disabled="state === PlayState.LOADING" icon="mdi-cog" @click="emitter.emit('showSettings', null)" />
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
  const { state } = storeToRefs(usePlayStateStore());
</script>
