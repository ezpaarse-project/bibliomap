<template>
  <v-row class="d-flex flex-row w-full align-center pa-8" flat>
    <v-col>
      <v-row class="d-flex flex-row align-center" :flat="true">
        <v-col cols="2">
          <v-btn :active="locked" flat icon="mdi-lock" @click="locked = !locked" />
        </v-col>
        <v-col cols="10">
          <v-card-text class="text-h6">
            {{ t('fab.settings-dialog.bubble-section.bubble-size') }}
          </v-card-text>
          <v-slider v-model="bubbleSize" :max="90" :min="20" thumb-label width="300" />
          <v-card-text class="text-h6">
            {{ t('fab.settings-dialog.bubble-section.popup-size') }}
          </v-card-text>
          <v-slider v-model="popupSize" :disabled="locked" :max="90" :min="20" thumb-label width="300" />
        </v-col>
      </v-row>
      <v-card-text class="text-h6">
        {{ t('fab.settings-dialog.bubble-section.bubble-duration') }}
      </v-card-text>
      <div>
        <v-slider v-model="bubbleDuration" :max="30" :min="1" :step="1" thumb-label />
      </div>
    </v-col>
    <v-row class="d-flex justify-space-around align-center">
      <!-- DEMO BUBBLE-->
      <div class="event-bubble" :style="{ opacity: opacity }">
        <div class="bubble-container">
          <div class="bubble-info">
            <BubbleInfo mime="HTML" :other="[t('fab.settings-dialog.bubble-section.publication-title')]" r-type="ARTICLE"
              :title="t('fab.settings-dialog.bubble-section.bubble-title')" />
          </div>
          <MulticolorBubble />
        </div>
      </div>
      <v-progress-circular :model-value="counter" size="90" />
    </v-row>
  </v-row>
</template>

<script setup lang="ts">

import MulticolorBubble from '@/components/bubble/MulticolorBubble.vue';
import BubbleInfo from '@/components/bubble/BubbleInfo.vue';
import { useConfigStore } from '@/stores/config';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const { config: currentConfig } = storeToRefs(useConfigStore());

const popupSize = ref(currentConfig.value.mapParams.popupSize || 30);
const bubbleDuration = ref(currentConfig.value.mapParams.bubbleDuration || 5);
const bubbleSize = ref(currentConfig.value.mapParams.bubbleSize || 60);
const opacity = ref(1);
const counter = ref(0);
const locked = ref(false);

watch(bubbleSize, (currentBubbleSize: number, previousBubbleSize: number) => {
    currentConfig.value.mapParams.bubbleSize = currentBubbleSize;
    if (!locked.value) return;
    popupSize.value += currentBubbleSize - previousBubbleSize;
  });

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
