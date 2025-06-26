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
      <v-row v-if="allPortals.length > 1" class="pa-4" flat>
        <v-card-text class="text-h6">{{ t('appbar.settings-dialog.portals-section.title') }}</v-card-text>
        <div
          class="d-flex flex-column flex-wrap px-4 justify-flex-start"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in allPortals"
            :key="index"
            v-model="shownPortals[value.name]"
            class="checkbox"
            :color="value.color || 'primary'"
            :hide-details="true"
            :label="value.name"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary" @click="checkAll">{{ t('appbar.settings-dialog.portals-section.select-all') }}</v-btn>
          <v-btn color="primary" @click="uncheckAll">{{ t('appbar.settings-dialog.portals-section.select-none') }}</v-btn>
        </div>
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
      <v-row class="d-flex flex-row w-full align-center pa-8" flat>
        <div>
          <v-card-text class="text-h6">
            {{ t('appbar.settings-dialog.bubble-section.bubble-size') }}
          </v-card-text>
          <v-slider
            v-model="bubbleSize"
            :max="50"
            :min="5"
            thumb-label
            width="400"
          />
          <v-card-text class="text-h6">
            {{ t('appbar.settings-dialog.bubble-section.bubble-duration') }}
          </v-card-text>
          <div>
            <v-slider
              v-model="bubbleDuration"
              :max="500"
              :min="1"
              :step="1"
              thumb-label
            />
          </div>
        </div>
        <div class="visual-container">
          <div class="container-test" :style="{transform: `scale(${bubbleSize / 30})`, opacity: opacity}">
            <div class="bubble-popup-test">
              <p class="title-font popup-title-test"><strong>{{ t('appbar.settings-dialog.bubble-section.bubble-title') }}</strong></p>
              <p v-if="showTitles" class="body-font">{{ t('appbar.settings-dialog.bubble-section.publication-title') }}</p>
              <div class="types-container-test">
                <p class="title-font" :style="{backgroundColor: '#7F8C8D'}">{{ t('appbar.settings-dialog.bubble-section.rtype') }}</p>
                <p class="title-font" :style="{backgroundColor: '#D35400'}">{{ t('appbar.settings-dialog.bubble-section.mime') }}</p>
              </div>
            </div>
            <div class="bubble">
              <div
                class="bubble-circle-test multicolor"
                :style="{ width: '60px', height: '60px'}"
              />
              <div
                class="bubble-pulse-test"
                :style="{ width: '120px', height: '120px', boxShadow: '1px 1px 8px 0 black', animation: 'pulsate 1s ease-in-out infinite'}"
                width:
              />
            </div>
          </div>
          <v-progress-circular :model-value="counter" size="90" />
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
  import { useSortFieldStore } from '@/stores/sort-field';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';

  const { t } = useI18n();
  const { config: currentConfig } = storeToRefs(useViewerConfigStore());
  const { fields: allPortals } = storeToRefs(useSortFieldStore());
  const bubbleSize = ref(currentConfig.value.mapParams.bubbleSize || 60);
  const bubbleDuration = ref(currentConfig.value.mapParams.bubbleDuration || 5);
  const emitter = useMitt();
  const active = ref(false);
  const counter = ref(0);
  const counterActive = ref(true);
  const { multiplier } = storeToRefs(usePlayerMultiplierStore());
  const opacity = ref(1);

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
    }, 1000 / multiplier.value)
  }

  const interval = ref(createInterval());

  watch([multiplier, bubbleDuration], () => {
    clearInterval(interval.value);
    counter.value = 0;
    interval.value = createInterval();
  })

  watch(bubbleSize, () => {
    currentConfig.value.mapParams.bubbleSize = bubbleSize.value;
  });

  watch(bubbleDuration, () => {
    currentConfig.value.mapParams.bubbleDuration = bubbleDuration.value;
  })

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

<style lang="scss" scoped>

  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  .visual-container {
    margin: 0 5% 0 auto;
    display: flex;
    flex-direction: row;
    width: 40%;
    height: 60px;
    justify-content: space-between;
  }

  .container-test {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    width: 100%;
    transition: opacity var(--opacity-transition-speed) ease-in;
    transform-origin: center center;
  }

  .bubble-test {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .bubble-circle-test {
    border-radius: 100%;
    box-shadow: $box-shadow;
    position: absolute;
  }

  .bubble-pulse-test {
    animation: pulsate var(--pulsate-speed) ease-in-out infinite;
    position: absolute;
    border-radius: 100%;
  }

  .bubble-popup-test {
    background-color: rgba(255, 255, 255, 0.75);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    z-index: 2;
    bottom: 100%;
    padding: .2em 1em;
    box-shadow: $box-shadow;
    min-width: 100px;
    max-width: 300px;
    white-space: normal;
    font-size: 14px;

    p {
      color: black;
      margin: 0;
    }

    .types-container-test {
      display: flex;
      justify-content: center;
      gap: .5em;
      font-size: 10px;

      p{
        margin: 3px;
        padding: 5px 8px;
        font-size: 1.2em;
        border-radius: 3px;
        color: #fff;
        box-sizing: border-box;
      }
    }
  }

  .multicolor {
    animation: multicolor-animation 7s ease-in-out infinite;
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
