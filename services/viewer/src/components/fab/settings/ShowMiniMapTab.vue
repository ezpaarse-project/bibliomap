<template>
  <div
    class="d-flex justify-space-between align-center pr-4"
    style="height: 72px;"
  >
    <v-card-title class="text-h6" style="font-weight: 400;">
      {{ t('fabButton.settings-dialog.minimap-section.title') }}
    </v-card-title>
    <div>
      <v-switch
        v-model="showMinimap"
        class="ma-0 pa-0"
        color="primary"
        hide-details
        inset
        style="margin-top: 2px;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

  import { useConfigStore } from '@/stores/config';

  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const { config: currentConfig } = storeToRefs(useConfigStore());

  const showMinimap = ref(currentConfig.value.minimapParams.include as boolean);

  watch(showMinimap, () => {
    currentConfig.value.minimapParams.include = showMinimap.value;
  });
</script>
