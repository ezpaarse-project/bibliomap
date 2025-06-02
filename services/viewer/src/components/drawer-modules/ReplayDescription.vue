<template>
  <div class="replay-description-container">
    <span>{{ description[0] === '$' ? t(`replay-description.${description.slice(1)}`) : description }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useReplayConfigStore } from '@/stores/replay-config';

  const description = storeToRefs(useReplayConfigStore()).config.description;
  const { t } = useI18n();
</script>
<style>

</style>