<template>
  <v-card-text>
    <i18n-t keypath="info.example.text">
      <template #link>
        <a href="https://github.com/ezpaarse-project/bibliomap/tree/development/services/player/demo-files"
          target="_blank" rel="noopener noreferrer">
          {{ t('info.example.link') }}
        </a>
      </template>
    </i18n-t>
  </v-card-text>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
