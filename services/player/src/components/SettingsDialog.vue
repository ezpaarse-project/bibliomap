<template>
  <v-dialog
    v-model="active"
    max-width="1000"
    scrollable
  >
    <v-card flat>
      <v-card-title class="text-h4">{{ t('appbar.settings-dialog.title') }}</v-card-title>
      <v-divider />
      <v-row class="d-flex flex-column pa-4" flat>
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
      </v-row>
      <v-divider />
      <v-row v-if="allFields.length > 1" class="pa-4" flat>
        <v-card-text class="text-h6">{{ t('appbar.settings-dialog.portals-section.title') }}</v-card-text>
        <div
          class="d-flex flex-row flex-wrap px-4 justify-flex-start"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in allFields"
            :key="index"
            v-model="shownFields[value.name]"
            class="checkbox"
            :color="value.color || 'primary'"
            :hide-details="true"
            :label="value.name"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary" @click="checkAllFields">{{ t('appbar.settings-dialog.portals-section.select-all') }}</v-btn>
          <v-btn color="primary" @click="uncheckAllFields">{{ t('appbar.settings-dialog.portals-section.select-none') }}</v-btn>
        </div>
      </v-row>
      <v-divider />
      <v-row v-if="allMimes.length > 1" class="pa-4" flat>
        <v-card-text class="text-h6">{{ t('appbar.settings-dialog.mimes-section.title') }}</v-card-text>
        <div
          class="d-flex flex-row flex-wrap px-4 justify-flex-start"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in allMimes"
            :key="index"
            v-model="shownMimes[value.name]"
            class="checkbox"
            :color="value.color || 'primary'"
            :hide-details="true"
            :label="value.name"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary" @click="checkAllMimes">{{ t('appbar.settings-dialog.portals-section.select-all') }}</v-btn>
          <v-btn color="primary" @click="uncheckAllMimes">{{ t('appbar.settings-dialog.portals-section.select-none') }}</v-btn>
        </div>
      </v-row>
      <v-divider />
      <v-row class="pa-4" :flat="true">
        <div
          class="d-flex justify-space-between align-center pr-4 w-100"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            {{ t('appbar.settings-dialog.multiplier-section.title') }}
          </v-card-title>
          <div>
            <v-number-input
              v-model="multiplier"
              dense
              hide-details="auto"
            />
          </div>
        </div>
      </v-row>
      <v-divider />
      <v-row class="d-flex flex-row w-full align-center pa-8" flat>
        <v-col>
          <v-row class="d-flex flex-row align-center" :flat="true">
            <v-col cols="2">
              <v-btn
                :active="locked"
                flat
                icon="mdi-lock"
                @click="locked = !locked"
              />
            </v-col>
            <v-col cols="10">
              <v-card-text class="text-h6">
                {{ t('appbar.settings-dialog.bubble-section.bubble-size') }}
              </v-card-text>
              <v-slider
                v-model="bubbleSize"
                :max="90"
                :min="20"
                thumb-label
                width="300"
              />
              <v-card-text class="text-h6">
                {{ t('appbar.settings-dialog.bubble-section.popup-size') }}
              </v-card-text>
              <v-slider
                v-model="popupSize"
                :disabled="locked"
                :max="90"
                :min="20"
                thumb-label
                width="300"
              />
            </v-col>
          </v-row>
          <v-card-text class="text-h6">
            {{ t('appbar.settings-dialog.bubble-section.bubble-duration') }}
          </v-card-text>
          <div>
            <v-slider
              v-model="bubbleDuration"
              :max="30"
              :min="1"
              :step="1"
              thumb-label
            />
          </div>
        </v-col>
        <v-row class="d-flex justify-space-around align-center">
          <!-- DEMO BUBBLE-->
          <div class="event-bubble" :style="{opacity: opacity}">
            <div class="bubble-container">
              <div class="bubble-info">
                <BubbleInfo
                  mime="HTML"
                  :other="[t('appbar.settings-dialog.bubble-section.publication-title')]"
                  r-type="ARTICLE"
                  :title="t('appbar.settings-dialog.bubble-section.bubble-title')"
                />
              </div>
              <MulticolorBubble />
            </div>
          </div>
          <v-progress-circular :model-value="counter" size="90" />
        </v-row>
      </v-row>
      <v-divider />
      <v-row align="center" class="pa-6" :flat="true" justify="space-between">
        <v-col cols="auto">
          <v-card-text class="text-h6">
            {{ t('appbar.settings-dialog.blur-section.title') }}
          </v-card-text>
          <v-slider
            v-model="blur"
            :max="1"
            :min="0"
            :step="0.01"
            thumb-label
            width="300"
          />
        </v-col>
        <v-col align="center" cols="auto">
          <v-card-text class="text-h5">
            ± {{ formatKmLabel(blur) }}
          </v-card-text>
        </v-col>
        <v-col cols="auto">
          <SettingsMap />
        </v-col>
      </v-row>
      <v-divider />
      <v-row class="pa-4" :flat="true">
        <div
          class="d-flex justify-space-between align-center pr-4 w-100"
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
      </v-row>
      <v-divider />
      <v-row class="pa-4 d-flex align-center" :flat="true">
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
      </v-row>
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';
  import { type Field, useSortFieldStore } from '@/stores/sort-field';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';
  import { useBlurStore } from '@/stores/blur';
  import { type Mime, useMimeStore } from '@/stores/mime';
  import MulticolorBubble from './event-bubble-components/MulticolorBubble.vue';

  const { t } = useI18n();

  const { config: currentConfig } = storeToRefs(useViewerConfigStore());
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

<style lang="scss" scoped>

  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  .event-bubble {
  position: relative;
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 1s ease-in;
}

.bubble-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble-core {
  z-index: 0;
}

.bubble-info {
  position: absolute;
  bottom: 100%;
  z-index: 1;
}

  .popup-title {
    font-size: 14px;
  }

  .checkbox {
    width: 15rem;
  }

  @keyframes multicolor-animation {
    0% {
      background-color: hsl(0, 100%, 50%);
    }
    25% {
      background-color: hsl(90, 100%, 50%);
    }
    50% {
      background-color: hsl(180, 100%, 50%);
    }
    75% {
      background-color: hsl(270, 100%, 50%);
    }
    100% {
      background-color: hsl(360, 100%, 50%);
    }
  }

  @keyframes pulsate {

    $ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";

    0% {
      transform: scale(0.1, 0.1);
      -ms-filter: $ms-filter;
      filter: alpha(opacity=0);
    }
    25% {
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    75% {
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    100% {
      transform: scale(1.2, 1.2);
      -ms-filter: $ms-filter;
      opacity: 0;
    }
  }

</style>
