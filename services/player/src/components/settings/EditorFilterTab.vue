<template>
  <v-row class="pa-4 d-flex align-center" :flat="true">
        <v-card-text class="text-h6">
          {{ t('fab.settings-dialog.filter-section.title') }}
        </v-card-text>
        <v-text-field
          v-model="filter"
          class="mx-4"
          :clearable="true"
          color="primary"
          :placeholder="t('fab.settings-dialog.filter-section.placeholder')"
        />
      </v-row>
</template>

<script setup lang="ts">

import { usePlatformFilterStore } from '@/stores/platform-filter';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { filter } = storeToRefs(usePlatformFilterStore());

</script>