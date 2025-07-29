<template>
  <v-tooltip :disabled="playState !== PlayState.STOPPED && playState !== PlayState.LOADING" location="top">
    <template #activator="{ props }">
      <div class="time-container" v-bind="props">
        <div class="timer-multiplier-container">
          <v-chip :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING">{{ timer ? new Date(timer).toLocaleString() : "" }}</v-chip>
        </div>

        <v-slider
          v-model="timer"
          class="w-100"
          :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING"
          :max="timeframe.endDatetime || Number.POSITIVE_INFINITY"
          :min="timeframe.startDatetime || 0"
          prepend-icon="mdi-play"
          :step="1000"
        />

        <v-number-input
          v-model="multiplier"
          class="w-100"
          dense
          hide-details="auto"
          :label="t('drawer.timer.multiplier-field')"
          :max="100"
          :min="1"
        />
      </div>
    </template>
    <span>{{ t('drawer.timer.tooltips.stopped') }}</span>
  </v-tooltip>
</template>


<script setup lang="ts">
  import { useTimerStore } from '@/stores/timer.ts';
  import { usePlayTimeframeStore } from '@/stores/play-timeframe';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import { useI18n } from 'vue-i18n';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';

  const { t } = useI18n();

  const { timer } = storeToRefs(useTimerStore());
  const { timeframe } = storeToRefs(usePlayTimeframeStore());

  const { state: playState } = storeToRefs(usePlayStateStore());
  const { multiplier } = storeToRefs(usePlayerMultiplierStore());

</script>

<style lang="scss" scoped>
.time-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: .5rem;
  gap: .5rem;
}

.timer-multiplier-container {
  display: flex;
  gap: .5rem;
  align-items: center;
}

.start-end-dates {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
}
</style>
