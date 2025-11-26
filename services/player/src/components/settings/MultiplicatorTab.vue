<template>
  <v-row class="pa-4" :flat="true">
    <div class="d-flex justify-space-between align-center pr-4 w-100" style="height: 72px;">
      <v-card-title class="text-h6" style="font-weight: 400;">
        {{ t('fab.settings-dialog.multiplier-section.title') }}
      </v-card-title>
      <div>
        <v-number-input v-model="multiplier" dense hide-details="auto" />
      </div>
    </div>
  </v-row>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { usePlayerMultiplierStore } from '@/stores/player-multiplier';

const { multiplier } = storeToRefs(usePlayerMultiplierStore());

</script>