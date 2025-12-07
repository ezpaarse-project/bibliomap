<template>
  <v-row class="d-flex flex-row w-full align-center pa-8" flat>
    <v-col>
      <v-row class="d-flex flex-row align-center" flat>
        <v-col cols="2">
          <v-btn :active="locked" flat icon="mdi-lock" @click="locked = !locked" />
        </v-col>

        <v-col cols="10">
          <v-card-text class="text-h6">
            {{ t('fab.settings-dialog.bubble-section.bubble-size') }}
          </v-card-text>

          <v-slider
            v-model="bubbleSize"
            :max="90"
            :min="20"
            thumb-label
            width="300"
          />

          <v-card-text class="text-h6">
            {{ t('fab.settings-dialog.bubble-section.popup-size') }}
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
        {{ t('fab.settings-dialog.bubble-section.bubble-duration') }}
      </v-card-text>

      <v-slider
        v-model="bubbleDuration"
        :max="30"
        :min="1"
        :step="1"
        thumb-label
      />
    </v-col>

    <!-- Bubble preview -->
    <v-row class="d-flex justify-space-around align-center">
      <div class="event-bubble" :style="{ opacity }">
        <div class="bubble-container">
          <div class="bubble-info">
            <BubbleInfo
              mime="HTML"
              :other="[t('fab.settings-dialog.bubble-section.publication-title')]"
              r-type="ARTICLE"
              :title="t('fab.settings-dialog.bubble-section.bubble-title')"
            />
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
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const { config } = storeToRefs(useConfigStore());

const bubbleSize = computed({
  get: () => config.value.mapParams.bubbleSize ?? 60,
  set: v => (config.value.mapParams.bubbleSize = v),
});

const popupSize = computed({
  get: () => config.value.mapParams.popupSize ?? 30,
  set: v => (config.value.mapParams.popupSize = v),
});

const bubbleDuration = computed({
  get: () => config.value.mapParams.bubbleDuration ?? 5,
  set: v => (config.value.mapParams.bubbleDuration = v),
});

const opacity = ref(1);
const counter = ref(0);
const locked = ref(false);
const counterActive = ref(true);

watch(bubbleSize, (cur, prev) => {
  if (!locked.value) return;
  popupSize.value += cur - prev;
});

let intervalId: number | undefined;

function startInterval() {
  intervalId = window.setInterval(() => {
    if (!counterActive.value) return;

    counter.value += 100 / bubbleDuration.value;

    if (counter.value >= 100) {
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

function restartInterval() {
  clearInterval(intervalId);
  counter.value = 0;
  startInterval();
}

watch(bubbleDuration, restartInterval);

startInterval();

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style lang="scss" scoped>
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

.bubble-info {
  position: absolute;
  bottom: 100%;
  z-index: 1;
}
</style>
