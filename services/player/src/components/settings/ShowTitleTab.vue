<template>
  <v-row class="pa-4" :flat="true">
    <div class="d-flex justify-space-between align-center pr-4 w-100" style="height: 72px;">
      <v-card-title class="text-h6" style="font-weight: 400;">
        {{ t('fab.settings-dialog.review-titles-section.title') }}
      </v-card-title>
      <div>
        <v-switch v-model="showTitles" class="ma-0 pa-0" color="primary" :hide-details="true" inset
          style="margin-top: 2px;" />
      </div>
    </div>
  </v-row>
</template>

<script setup lang="ts">

import { useConfigStore } from '@/stores/config';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { config: currentConfig } = storeToRefs(useConfigStore());

const showTitles = ref(currentConfig.value.mapParams.popupText.publication_title as boolean);
</script>