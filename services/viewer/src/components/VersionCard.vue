<template>
  <v-card density="comfortable" :flat="true">
    <v-card-title class="text-body-1 pb-0">Bibliomap 6.0.0</v-card-title>
    <v-card-text class="text-caption pt-0">
      {{ t('version-card.connection') }}
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
