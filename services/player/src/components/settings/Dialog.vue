<template>
  <v-dialog
    v-model="active"
    max-width="1000"
    scrollable
  >
    <v-card flat>
      <v-card-title class="text-h4">{{ t('fab.settings-dialog.title') }}</v-card-title>
      <v-divider />
      <ShowMiniMapTab />
      <v-divider />
      <FieldFilterTab />
      <v-divider />
      <MimeFilterTab />
      <v-divider />
      <SpeedTab />
      <v-divider />
      <BubbleTab />
      <v-divider />
      <LocalisationTab />
      <v-divider />
      <ShowTitleTab />
      <v-divider />
      <v-row class="pa-4 d-flex align-center" :flat="true">
        <v-card-text class="text-h6">
          {{ t('fab.settings-dialog.filter-section.title') }}
        </v-card-text>
        <v-text-field
          v-model="filter"
          class="mx-4"
          :clearable="true"
          color="primary"
          :placeholder="t('fab.settings-dialog.filter-section.placeholder')"
        />
      </v-row>
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useConfigStore } from '@/stores/config';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';
  import { type Field, useSortFieldStore } from '@/stores/sort-field';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';
  import { useBlurStore } from '@/stores/blur';
  import { type Mime, useMimeStore } from '@/stores/mime';

  import ShowMiniMapTab from '@/components/settings/ShowMiniMapTab.vue';
  import FieldFilterTab from '@/components/settings/FieldFilterTab.vue';
  import MimeFilterTab from '@/components/settings/MimeFilterTab.vue';
  import SpeedTab from '@/components/settings/SpeedTab.vue';
  import BubbleTab from '@/components/settings/BubbleTab.vue';
  import LocalisationTab from '@/components/settings/LocalisationTab.vue';
  import ShowTitleTab from '@/components/settings/ShowTitleTab.vue';

  const { t } = useI18n();

  const { config: currentConfig } = storeToRefs(useConfigStore());
  const { fields: allFields } = storeToRefs(useSortFieldStore());
  const { mimes: allMimes } = storeToRefs(useMimeStore());
  const { blur } = storeToRefs(useBlurStore());
  const bubbleSize = ref(currentConfig.value.mapParams.bubbleSize || 60);
  const popupSize = ref(currentConfig.value.mapParams.popupSize || 30);
  const bubbleDuration = ref(currentConfig.value.mapParams.bubbleDuration || 5);
  const emitter = useMitt();
  const active = ref(false);
  const counter = ref(0);
  const counterActive = ref(true);
  const { multiplier } = storeToRefs(usePlayerMultiplierStore());
  const opacity = ref(1);
  const locked = ref(false);

  const formatKmLabel = (value: number) => `~ ${Math.round(value * 111)} km`;

  emitter.on('showSettings', () => {
    active.value = true;
  });

  function createInterval () {
    return setInterval(() => {
      if (!counterActive.value) return;
      counter.value += 100 / bubbleDuration.value;
      if (counter.value > bubbleDuration.value * (100 / bubbleDuration.value)) {
        counter.value = 0;
        counterActive.value = false;
        opacity.value = 0;
        setTimeout(() => {
          counterActive.value = true;
          opacity.value = 1;
        }, 3000);
      }
    }, 1000);
  }

  const interval = ref(createInterval());

  watch(bubbleDuration, () => {
    clearInterval(interval.value);
    counter.value = 0;
    interval.value = createInterval();
  })

  watch(bubbleSize, (currentBubbleSize: number, previousBubbleSize: number) => {
    currentConfig.value.mapParams.bubbleSize = currentBubbleSize;
    if (!locked.value) return;
    popupSize.value += currentBubbleSize - previousBubbleSize;
  });

  watch(popupSize, () => {
    currentConfig.value.mapParams.popupSize = popupSize.value;
  })

  watch(bubbleDuration, () => {
    currentConfig.value.mapParams.bubbleDuration = bubbleDuration.value;
  })

  const showMinimap = ref(currentConfig.value.minimapParams.include as boolean);

  const shownMimes = ref<Record<string, boolean>>({});

  const shownFields = ref(
    allFields.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = true
      return acc
    }, {})
  );

  function resetShownFields () {
    shownFields.value = allFields.value.map(p => p.name).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = true
      return acc
    }, {})
  }

  function resetShownMimes () {
    shownMimes.value = allMimes.value.reduce((acc: Record<string, boolean>, mime) => {
      acc[mime.name] = true;
      return acc;
    }, {});
  }

  const showTitles = ref(currentConfig.value.mapParams.popupText.publication_title as boolean);
  const { filter } = storeToRefs(usePlatformFilterStore());

  watch(showMinimap, () => {
    currentConfig.value.minimapParams.include = showMinimap.value;
  });

  watch(allFields, () => {
    resetShownFields();
  }, { deep: true });

  watch(allMimes, () => {
    resetShownMimes();
  }, { deep: true })

  watch(shownFields, () => {
    currentConfig.value.drawerParams.portalSection.portals = allFields.value.filter(p => shownFields.value[p.name])
  }, { deep: true });

  watch(shownMimes, () => {
    useMimeStore().shownMimes = allMimes.value.filter(p => shownMimes.value[p.name])
  }, { deep: true })

  watch(showTitles, () => {
    currentConfig.value.mapParams.popupText.publication_title = showTitles.value;
  });

  function changeAll (check: boolean, all: Ref<Field[] | Mime[]>, shown: Ref<Record<string, boolean>>) {
    all.value.forEach(key => {
      shown.value[key.name] = check;
    });
  }

  function checkAllFields () {
    changeAll(true, allFields, shownFields);
  }

  function uncheckAllFields (){
    changeAll(false, allFields, shownFields);
  }

  function checkAllMimes () {
    changeAll(true, allMimes, shownMimes);
  }

  function uncheckAllMimes () {
    changeAll(false, allMimes, shownMimes);
  }

</script>
