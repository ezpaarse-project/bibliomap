<template>
  <v-btn v-tooltip="{text: t('appbar.tooltips.center-map'), location: 'right'}" icon="mdi-target" @click="centerMap" />
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
