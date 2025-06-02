<template>
  <div class="replay-description-section">
    <span class="bold">{{ t('drawer.replay-description.replay-label') }}</span><span>{{ descriptionText }}</span>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useReplayConfigStore } from '@/stores/replay-config';

  const { config } = storeToRefs(useReplayConfigStore());
  const { t, locale } = useI18n();

  const descriptionText = ref('');

  watch([config, locale], () => {
    descriptionText.value = getReplayDescriptionText(config.value?.description || '');
  });

  function getReplayDescriptionText (description: string) {
    if(description[0] === '$') {
      return t(`replay-descriptions.${description.slice(1)}`);
    }
    return description;
  }
</script>
<style lang="scss">
  .replay-description-section{
    font-size: 14px;
    margin: 1rem .5rem;
    span{
      display: inline;
    }
  }
  .bold{
    font-weight: bold;
  }
</style>
