<template>
  <div class="card-version-container">
    <v-card density="comfortable" :flat="true" height="65" width="200">
      <v-card-title class="justify-center text-body-1 pb-0">Bibliomap Player 6.0</v-card-title>
      <v-card-text class="justify-center text-caption pt-0">
        {{ t('version-card.connection') }}
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
<style lang="scss">
  .card-version-container{
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    opacity: .75;
    margin: .5rem;
  }
  .justify-center{
    text-align: center;
  }
</style>
