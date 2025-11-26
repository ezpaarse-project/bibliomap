<template>
  <v-row v-if="fields.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">
      {{ t('fab.settings-dialog.portals-section.title') }}
    </v-card-text>

    <div class="d-flex flex-row flex-wrap px-4" style="gap: 4px; max-height: 300px; overflow-y: auto;">
      <v-checkbox
        v-for="field in fields"
        :key="field.name"
        v-model="checkboxModel[field.name]"
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
import { computed, ref, watch } from 'vue';
import { useSortFieldStore } from '@/stores/sort-field';
import { useConfigStore } from '@/stores/config';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

const { t } = useI18n();

const fieldStore = useSortFieldStore();
const configStore = useConfigStore();

const { fields } = storeToRefs(fieldStore);
const { config: currentConfig } = storeToRefs(configStore);

const localShown = ref<Record<string, boolean>>({});

watch(
  fields,
  () => {
    localShown.value = Object.fromEntries(
      fields.value.map(f => [f.name, true])
    );
  },
  { immediate: true }
);

const checkboxModel = computed({
  get: () => localShown.value,
  set: (val: Record<string, boolean>) => {
    localShown.value = val;
    currentConfig.value.drawerParams.portalSection.portals =
      fields.value.filter(f => val[f.name]);
  }
});

function selectAll() {
  checkboxModel.value = Object.fromEntries(
    fields.value.map(f => [f.name, true])
  );
}

function selectNone() {
  checkboxModel.value = Object.fromEntries(
    fields.value.map(f => [f.name, false])
  );
}
</script>
