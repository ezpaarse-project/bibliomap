<template>
  <v-row v-if="mimes.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">
      {{ t('fab.settings-dialog.mimes-section.title') }}
    </v-card-text>

    <div class="d-flex flex-row flex-wrap px-4" style="gap: 4px; max-height: 300px; overflow-y: auto;">
      <v-checkbox
        v-for="mime in mimes"
        :key="mime.name"
        v-model="checkboxModel[mime.name]"
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
import { computed, ref, watch } from 'vue';
import { useMimeStore } from '@/stores/mime';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useMimeStore();
const { mimes } = storeToRefs(store);

const localShown = ref<Record<string, boolean>>({});

watch(mimes, () => {
  localShown.value = Object.fromEntries(
    mimes.value.map(m => [m.name, true])
  );
}, { immediate: true });

const checkboxModel = computed({
  get: () => localShown.value,
  set: (val: Record<string, boolean>) => {
    localShown.value = val;

    store.shownMimes = mimes.value.filter(m => val[m.name]);
  }
});

function selectAll() {
  const all = Object.fromEntries(mimes.value.map(m => [m.name, true]));
  checkboxModel.value = all;
}

function selectNone() {
  const none = Object.fromEntries(mimes.value.map(m => [m.name, false]));
  checkboxModel.value = none;
}
</script>