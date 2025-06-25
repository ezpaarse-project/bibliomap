<template>
  <v-dialog
    v-model="active"
    max-width="1000"
  >
    <v-card :flat="true">
      <v-card-title class="text-h4">{{ t('appbar.settings-dialog.title') }}</v-card-title>
      <v-divider />
      <v-card class="d-flex flex-column" flat>
        <div
          class="d-flex justify-space-between align-center pr-4"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            {{ t('appbar.settings-dialog.minimap-section.title') }}
          </v-card-title>
          <div>
            <v-switch
              v-model="showMinimap"
              class="ma-0 pa-0"
              color="primary"
              :hide-details="true"
              inset
              style="margin-top: 2px;"
            />
          </div>
        </div>
      </v-card>
      <v-divider />
      <v-card v-if="allPortals.length > 1" :flat="true">
        <v-card-text class="text-h6">{{ t('appbar.settings-dialog.portals-section.title') }}</v-card-text>
        <div
          class="d-flex flex-column flex-wrap px-4"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in allPortals"
            :key="index"
            v-model="shownPortals[value.name]"
            class="ma-0"
            :color="value.color || 'primary'"
            :hide-details="true"
            :label="value.name"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary" @click="checkAll">{{ t('appbar.settings-dialog.portals-section.select-all') }}</v-btn>
          <v-btn color="primary" @click="uncheckAll">{{ t('appbar.settings-dialog.portals-section.select-none') }}</v-btn>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <div
          class="d-flex justify-space-between align-center pr-4"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            {{ t('appbar.settings-dialog.review-titles-section.title') }}
          </v-card-title>
          <div>
            <v-switch
              v-model="showTitles"
              class="ma-0 pa-0"
              color="primary"
              :hide-details="true"
              inset
              style="margin-top: 2px;"
            />
          </div>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <v-card-text class="text-h6">
          {{ t('appbar.settings-dialog.filter-section.title') }}
        </v-card-text>
        <v-text-field
          v-model="filter"
          class="mx-4"
          :clearable="true"
          color="primary"
          :placeholder="t('appbar.settings-dialog.filter-section.placeholder')"
        />
      </v-card>
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';
  import { useSortFieldStore } from '@/stores/sort-field';

  const { t } = useI18n();
  const { config: currentConfig } = storeToRefs(useViewerConfigStore());
  const { fields: allPortals } = storeToRefs(useSortFieldStore());
  const emitter = useMitt();
  const active = ref(false);
  emitter.on('showSettings', () => {
    active.value = true;
  });

  const showMinimap = ref(currentConfig.value.minimapParams.include as boolean);

  const shownPortals = ref(
    allPortals.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
      console.log(key);
      acc[key] = true
      return acc
    }, {})
  );

  function resetShownFields () {
    shownPortals.value = allPortals.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = true
      return acc
    }, {})
  }

  const showTitles = ref(currentConfig.value.mapParams.popupText.publication_title as boolean);
  const { filter } = storeToRefs(usePlatformFilterStore());

  watch(showMinimap, () => {
    currentConfig.value.minimapParams.include = showMinimap.value;
  });

  watch(allPortals, () => {
    resetShownFields();
  })

  watch(shownPortals, () => {
    currentConfig.value.drawerParams.portalSection.portals = allPortals.value.filter(p => shownPortals.value[p.name])
  }, { deep: true });

  watch(showTitles, () => {
    currentConfig.value.mapParams.popupText.publication_title = showTitles.value;
  });

  function changeAll (check: boolean) {
    allPortals.value.forEach(key => {
      shownPortals.value[key.name] = check;
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
