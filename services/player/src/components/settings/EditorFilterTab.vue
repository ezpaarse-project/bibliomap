<template>
  <div>
    <v-card-text class="text-h6">
      {{ t('fab.settings-dialog.filter-section.title') }}
    </v-card-text>
    <v-combobox
      v-model="filter"
      chips
      class="mx-4"
      :clearable="true"
      color="primary"
      multiple
      :placeholder="t('fab.settings-dialog.filter-section.placeholder')"
    >
      <template #chip="{ props }">
        <v-chip v-bind="props" label>
          <template #close>
            <v-icon icon="$close" size="14" />
          </template>
        </v-chip>
      </template>
    </v-combobox>
  </div>
</template>

<script setup lang="ts">

  import { useConfigStore } from '@/stores/config';
  import { usePlatformFilterStore } from '@/stores/platform-filter';

  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const { config: currentConfig } = storeToRefs(useConfigStore());


  const showTitles = ref(currentConfig.value.mapParams.popupText.publication_title as boolean);
  const filter = ref(usePlatformFilterStore().getFilter());

  watch(showTitles, () => {
    currentConfig.value.mapParams.popupText.publication_title = showTitles.value;
  });

  watch(filter, () => {
    usePlatformFilterStore().setFilter(filter.value);
  });

</script>
