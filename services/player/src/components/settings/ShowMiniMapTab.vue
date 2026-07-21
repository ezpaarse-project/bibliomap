<template>
  <v-row class="d-flex flex-column pa-4" flat>
    <div class="d-flex justify-space-between align-center pr-4" style="height: 72px;">
      <v-card-title class="text-h6" style="font-weight: 400;">
        {{ t('fab.settings-dialog.minimap-section.title') }}
      </v-card-title>
      <div>
        <v-switch v-model="showMinimap" class="ma-0 pa-0" color="primary" :hide-details="true" inset
          style="margin-top: 2px;" />
      </div>
    </div>
  </v-row>
</template>

<script setup lang="ts">

import { useConfigStore } from '@/stores/config';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useConfigStore();
const { config } = storeToRefs(store);

const showMinimap = computed({
  get: () => config.value.minimapParams.include,
  set: (value: boolean) => {
    config.value.minimapParams.include = value;
  }
});

</script>