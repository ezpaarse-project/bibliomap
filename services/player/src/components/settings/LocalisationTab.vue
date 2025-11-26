<template>
  <v-row align="center" class="pa-6" :flat="true" justify="space-between">
    <v-col cols="auto">
      <v-card-text class="text-h6">
        {{ t('fab.settings-dialog.blur-section.title') }}
      </v-card-text>
      <v-slider v-model="blur" :max="1" :min="0" :step="0.01" thumb-label width="300" />
    </v-col>
    <v-col align="center" cols="auto">
      <v-card-text class="text-h5">
        ± {{ formatKmLabel(blur) }}
      </v-card-text>
    </v-col>
    <v-col cols="auto">
      <SettingsMap />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

import SettingsMap from '@/components/settings/SettingsMap.vue';

import { useBlurStore } from '@/stores/blur';
import { useI18n } from 'vue-i18n';

const { blur } = storeToRefs(useBlurStore());
const { t } = useI18n();

const formatKmLabel = (value: number) => `~ ${Math.round(value * 111)} km`;

</script>