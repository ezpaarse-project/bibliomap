<template>
  <v-row v-if="fields.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">
      {{ t('fab.settings-dialog.portals-section.title') }}
    </v-card-text>

    <div
      class="d-flex flex-row flex-wrap px-4"
      style="gap: 4px; max-height: 300px; overflow-y: auto;"
    >
      <v-checkbox
        v-for="field in fields"
        :key="field.name"
        :model-value="isChecked(field.name)"
        @update:model-value="toggleField(field.name, $event)"
        :color="field.color || 'primary'"
        :label="field.name"
        hide-details
      />
    </div>

    <div class="pa-4">
      <v-btn class="mr-4" color="primary" @click="selectAll">
        {{ t('fab.settings-dialog.portals-section.select-all') }}
      </v-btn>

      <v-btn color="primary" @click="selectNone">
        {{ t('fab.settings-dialog.portals-section.select-none') }}
      </v-btn>
    </div>
  </v-row>
</template>

<script setup lang="ts">
import { useSortFieldStore } from '@/stores/sort-field';
import { useConfigStore } from '@/stores/config';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

const { t } = useI18n();

const fieldStore = useSortFieldStore();
const configStore = useConfigStore();

const { fields } = storeToRefs(fieldStore);
const { config } = storeToRefs(configStore);


function getSelectedNames(): string[] {
  return config.value.drawerParams.portalSection.portals.map(p => p.name);
}

function setSelectedNames(names: string[]) {
  config.value.drawerParams.portalSection.portals =
    fields.value.filter(f => names.includes(f.name));
}


function isChecked(name: string): boolean {
  return getSelectedNames().includes(name);
}


function toggleField(name: string, checked: boolean) {
  const selected = getSelectedNames();

  if (checked) {
    if (!selected.includes(name)) {
      setSelectedNames([...selected, name]);
    }
  } else {
    setSelectedNames(selected.filter(n => n !== name));
  }
}


function selectAll() {
  setSelectedNames(fields.value.map(f => f.name));
}


function selectNone() {
  setSelectedNames([]);
}
</script>
