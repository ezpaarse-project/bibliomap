<template>
  <v-card density="comfortable" :flat="true">
    <v-card-text>
      {{ t('version-card.connection') }}
    </v-card-text>
  </v-card>

</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
