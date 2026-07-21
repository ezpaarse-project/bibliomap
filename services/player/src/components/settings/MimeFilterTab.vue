<template>
  <v-row v-if="mimes.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">
      {{ t('fab.settings-dialog.mimes-section.title') }}
    </v-card-text>

    <div
      class="d-flex flex-row flex-wrap px-4"
      style="gap: 4px; max-height: 300px; overflow-y: auto;"
    >
      <v-checkbox
        v-for="mime in mimes"
        :key="mime.name"
        :model-value="isChecked(mime.name)"
        @update:model-value="toggleMime(mime.name, $event)"
        :color="mime.color || 'primary'"
        :label="mime.name"
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
import { useMimeStore } from '@/stores/mime';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useMimeStore();
const { mimes, shownMimes } = storeToRefs(store);

function isChecked(name: string): boolean {
  return shownMimes.value.some(m => m.name === name);
}

function toggleMime(name: string, checked: boolean) {
  if (checked) {
    const mime = mimes.value.find(m => m.name === name);
    if (!mime) return;

    if (!shownMimes.value.some(m => m.name === name)) {
      store.shownMimes.push(mime);
    }
  } else {
    store.shownMimes = shownMimes.value.filter(m => m.name !== name);
  }
}

function selectAll() {
  store.shownMimes = [...mimes.value];
}

function selectNone() {
  store.shownMimes = [];
}
</script>
