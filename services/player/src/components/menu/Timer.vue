<template>
  <div class="w-100 d-flex ga-2 justify-start">
    <v-btn :disabled="playState === PlayState.LOADING" flat
      :icon="playState === PlayState.PLAYING ? 'mdi-pause' : 'mdi-play'"
      @click="playState === PlayState.PLAYING ? pause() : play()" />
    <v-slider v-model="timer" :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING" hide-details
      :max="timeframe.endDatetime || Number.POSITIVE_INFINITY" :min="timeframe.startDatetime || 0" />
  </div>
</template>


<script setup lang="ts">
import { useTimerStore } from '@/stores/timer.ts';
import { usePlayTimeframeStore } from '@/stores/play-timeframe';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

const { timer } = storeToRefs(useTimerStore());
const { timeframe } = storeToRefs(usePlayTimeframeStore());

const { state: playState } = storeToRefs(usePlayStateStore());

const play = () => {
  usePlayStateStore().play();
};

const pause = () => {
  usePlayStateStore().pause();
}

</script>

