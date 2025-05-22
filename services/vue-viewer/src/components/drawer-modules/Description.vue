<template>
  <v-list-item>
    <div class="description-section-item">
      <img v-if="props.icon" alt="icon" :src="getIconUrl(props.icon)">
      <span>{{ t('drawer-custom.description') }}</span>
    </div>
  </v-list-item>
</template>
<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const config = useViewerConfigStore().config;
  const props = config.drawerParams.descriptionSection;

  const getIconUrl = (iconName: string): string => {
    return new URL(`../../assets/${iconName}`, import.meta.url).href;
  };
</script>
