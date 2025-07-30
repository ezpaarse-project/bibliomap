<template>
  <v-list-item>
    <v-row class="d-flex align-center justify-space-around" no-gutters>
      <v-col class="pa-0 ma-0 d-flex justify-center" cols="1">
        <img
          v-if="props.icon"
          alt="icon"
          height="60"
          :src="getIconUrl(props.icon)"
          width="60"
        >
      </v-col>
      <v-col class="pa-0 ma-0" cols="8">
        <p class="text-center mx-2 mb-2" style="font-size: 14px">{{ t('drawer-custom.description') }}</p>
      </v-col>
    </v-row>
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
