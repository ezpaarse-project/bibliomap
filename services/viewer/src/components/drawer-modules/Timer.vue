<template>
  <v-tooltip :disabled="playState !== PlayState.STOPPED && playState !== PlayState.LOADING" location="top">
    <template #activator="{ props }">
      <div class="time-container" v-bind="props">
        <div class="timer-multiplier-container">
          <v-chip :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING">{{ timer ? new Date(timer).toLocaleString() : "" }}</v-chip>
        </div>

        <v-slider
          v-model="timerValue"
          class="w-100"
          :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING"
          :max="sliderMax"
          :min="sliderMin"
          prepend-icon="mdi-play"
          :step="1000"
        />

        <v-number-input
          v-model="multiplier"
          class="w-100"
          dense
          :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING"
          hide-details="auto"
          :label="t('drawer.timer.multiplier-field')"
          :min="1"
        />
      </div>
    </template>
    <span>{{ t('drawer.timer.tooltips.stopped') }}</span>
  </v-tooltip>
</template>


<script setup lang="ts">
  import { useTimerStore } from '@/stores/timer.ts';
  import { usePlayTimesStore } from '@/stores/play-times.ts';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();

  const { timer } = storeToRefs(useTimerStore());
  const timerValue = ref(0);

  const { state: playState } = storeToRefs(usePlayStateStore());
  const multiplier = ref(1);

  const sliderMin = ref(0);
  const sliderMax = ref(0);

  watch(multiplier, () => {
    emitter.emit('setMultiplier', multiplier.value);
  })

  watch(timer, () => {
    if (!timer.value) {
      timerValue.value = 0; return
    }
    timerValue.value = timer.value;
  })

  watch(timerValue , () => {
    timer.value = timerValue.value;
  })

  emitter.on('files-loaded', async () => {
    const playTimes = await usePlayTimesStore().getStartEndDatetime();
    sliderMin.value = playTimes.startDatetime || 0;
    sliderMax.value = playTimes.endDatetime || Number.POSITIVE_INFINITY;
    timer.value = sliderMin.value;
  })

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
