<template>
  <v-row v-if="allMimes.length > 1" class="pa-4" flat>
    <v-card-text class="text-h6">{{ t('fab.settings-dialog.mimes-section.title') }}</v-card-text>
    <div class="d-flex flex-row flex-wrap px-4 justify-flex-start" style="gap: 4px; max-height: 300px; overflow-y: auto;">
      <v-checkbox v-for="(value, index) in allMimes" :key="index" v-model="shownMimes[value.name]" class="checkbox"
        :color="value.color || 'primary'" :hide-details="true" :label="value.name" />
    </div>
    <div class="pa-4">
      <v-btn class="mr-4" color="primary" @click="checkAllMimes">{{ t('fab.settings-dialog.portals-section.select-all')
      }}</v-btn>
      <v-btn color="primary" @click="uncheckAllMimes">{{ t('fab.settings-dialog.portals-section.select-none') }}</v-btn>
    </div>
  </v-row>
</template>

<script setup lang="ts">

import { type Mime, useMimeStore } from '@/stores/mime';
import { type Field } from '@/stores/sort-field';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
  const { mimes: allMimes } = storeToRefs(useMimeStore());

  const shownMimes = ref<Record<string, boolean>>({});

  function resetShownMimes () {
    shownMimes.value = allMimes.value.reduce((acc: Record<string, boolean>, mime) => {
      acc[mime.name] = true;
      return acc;
    }, {});
  }


  watch(allMimes, () => {
    resetShownMimes();
  }, { deep: true })

  watch(shownMimes, () => {
    useMimeStore().shownMimes = allMimes.value.filter(p => shownMimes.value[p.name])
  }, { deep: true })

  function changeAll (check: boolean, all: Ref<Field[] | Mime[]>, shown: Ref<Record<string, boolean>>) {
    all.value.forEach(key => {
      shown.value[key.name] = check;
    });
  }

  function checkAllMimes () {
    changeAll(true, allMimes, shownMimes);
  }

  function uncheckAllMimes () {
    changeAll(false, allMimes, shownMimes);
  }
</script>