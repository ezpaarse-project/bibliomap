<template>
  <v-row v-if="allFields.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">{{ t('fab.settings-dialog.portals-section.title') }}</v-card-text>
    <div class="d-flex flex-row flex-wrap px-4 justify-flex-start" style="gap: 4px; max-height: 300px; overflow-y: auto;">
      <v-checkbox v-for="(value, index) in allFields" :key="index" v-model="shownFields[value.name]" class="checkbox"
        :color="value.color || 'primary'" :hide-details="true" :label="value.name" />
    </div>
    <div class="pa-4">
      <v-btn class="mr-4" color="primary" @click="checkAllFields">
        {{ t('fab.settings-dialog.portals-section.select-all') }}
      </v-btn>
      <v-btn color="primary" @click="uncheckAllFields">{{ t('fab.settings-dialog.portals-section.select-none') }}</v-btn>
    </div>
  </v-row>
</template>

<script setup lang="ts">

import { type Field, useSortFieldStore } from '@/stores/sort-field';
import { type Mime } from '@/stores/mime';
import { useI18n } from 'vue-i18n';
import { useConfigStore } from '@/stores/config';

const { t } = useI18n();

const { config: currentConfig } = storeToRefs(useConfigStore());
const { fields: allFields } = storeToRefs(useSortFieldStore());

const shownFields = ref(
  allFields.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
    acc[key] = true
    return acc
  }, {})
);

function resetShownFields() {
  shownFields.value = allFields.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
    acc[key] = true
    return acc
  }, {})
}

watch(shownFields, () => {
  currentConfig.value.drawerParams.portalSection.portals = allFields.value.filter(p => shownFields.value[p.name])
}, { deep: true });

function changeAll(check: boolean, all: Ref<Field[] | Mime[]>, shown: Ref<Record<string, boolean>>) {
  all.value.forEach(key => {
    shown.value[key.name] = check;
  });
}

watch(allFields, () => {
  resetShownFields();
}, { deep: true });

function checkAllFields() {
  changeAll(true, allFields, shownFields);
}

function uncheckAllFields() {
  changeAll(false, allFields, shownFields);
}

</script>