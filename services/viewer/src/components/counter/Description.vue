<template>
  <v-row class="d-flex align-center justify-space-around" no-gutters>
    <v-col class="d-flex justify-center" cols="1">
      <img
        v-if="props.icon"
        alt="icon"
        class="ml-4"
        height="60"
        :src="getIconUrl(props.icon)"
        width="60"
      >
    </v-col>
    <v-col cols="8">
      <p class="text-center" style="font-size: 14px">{{ t('drawer-custom.description') }}</p>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
  import { useConfigStore } from '@/stores/config';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const config = useConfigStore().config;
  const props = config.drawerParams.descriptionSection;

  const getIconUrl = (iconName: string): string => {
    return new URL(`../../assets/${iconName}`, import.meta.url).href;
  };
</script>
