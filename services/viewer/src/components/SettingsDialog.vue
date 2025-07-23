<template>
  <v-dialog
    v-model="active"
    max-width="1000"
  >
    <v-card :flat="true">
      <v-card-title class="text-h4">{{ t('fabButton.settings-dialog.title') }}</v-card-title>
      <v-divider />
      <v-card class="d-flex flex-column" flat>
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
      </v-card>
      <v-divider />
      <v-card v-if="allPortals.length > 1" :flat="true">
        <v-card-text class="text-h6">{{ t('fabButton.settings-dialog.portals-section.title') }}</v-card-text>
        <div
          class="d-flex flex-column flex-wrap px-4"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in allPortals"
            :key="index"
            v-model="shownPortals[index]"
            class="ma-0"
            :color="value.color || 'primary'"
            hide-details
            :label="t(`drawer-custom.portals.${value.name}.title`)"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary" @click="checkAll">{{ t('fabButton.settings-dialog.portals-section.select-all') }}</v-btn>
          <v-btn color="primary" @click="uncheckAll">{{ t('fabButton.settings-dialog.portals-section.select-none') }}</v-btn>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <div
          class="d-flex justify-space-between align-center pr-4"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            {{ t('fabButton.settings-dialog.review-titles-section.title') }}
          </v-card-title>
          <div>
            <v-switch
              v-model="showTitles"
              class="ma-0 pa-0"
              color="primary"
              hide-details
              inset
              style="margin-top: 2px;"
            />
          </div>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <v-card-text class="text-h6">
          {{ t('fabButton.settings-dialog.filter-section.title') }}
        </v-card-text>
        <v-text-field
          v-model="filter"
          class="mx-4"
          :clearable="true"
          color="primary"
          :placeholder="t('fabButton.settings-dialog.filter-section.placeholder')"
        />
      </v-card>
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import initialConfig from '@/assets/config.json';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const { config: currentConfig } = storeToRefs(useViewerConfigStore());
  const allPortals = initialConfig.drawerParams.portalSection.portals;
  const emitter = useMitt();
  const active = ref(false);
  emitter.on('showSettings', () => {
    active.value = true;
  });

  const showMinimap = ref(currentConfig.value.minimapParams.include as boolean);
  const shownPortals = reactive<Record<string, boolean>>(
    Object.keys(initialConfig.drawerParams.portalSection.portals).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = true
      return acc
    }, {})
  );
  const showTitles = ref(currentConfig.value.mapParams.popupText.publication_title as boolean);
  const filter = ref(usePlatformFilterStore().getFilter());

  watch(showMinimap, () => {
    currentConfig.value.minimapParams.include = showMinimap.value;
  });

  watch(shownPortals, () => {
    currentConfig.value.drawerParams.portalSection.portals = Object.fromEntries(
      Object.entries(allPortals).filter(([key]) => shownPortals[key])
    ) as unknown as typeof currentConfig.value.drawerParams.portalSection.portals;
  });

  watch(showTitles, () => {
    currentConfig.value.mapParams.popupText.publication_title = showTitles.value;
  });

  watch(filter, () => {
    usePlatformFilterStore().setFilter(filter.value);
  });

  function changeAll (check: boolean) {
    Object.keys(allPortals).forEach(key => {
      shownPortals[key] = check;
    });
  }

  function checkAll () {
    changeAll(true);
  }

  function uncheckAll (){
    changeAll(false);
  }

</script>

<style lang="scss">

</style>
