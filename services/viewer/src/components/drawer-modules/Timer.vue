<template>
  <v-tooltip :disabled="playState !== PlayState.STOPPED" location="top">
    <template #activator="{ props }">
      <div class="time-container" v-bind="props">
        <div class="timer-multiplier-container">
          <v-chip :disabled="!timer">{{ timer ? new Date(timer).toLocaleString() : "" }}</v-chip>
        </div>

        <v-slider
          v-model="timer"
          class="w-100"
          :disabled="playState === PlayState.STOPPED"
          :max="sliderMax"
          :min="sliderMin"
          prepend-icon="mdi-play"
          :step="1000"
        />

        <v-number-input
          v-model="multiplier"
          class="w-100"
          dense
          :disabled="playState === PlayState.STOPPED"
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
  import { useReplayTimerStore } from '@/stores/player-timer.ts';
  import { usePlayTimesStore } from '@/stores/play-times.ts';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();

  const { timer } = storeToRefs(useReplayTimerStore());
  const { state: playState } = storeToRefs(usePlayStateStore());
  const multiplier = ref(1);

  const sliderMin = ref(0);
  const sliderMax = ref(0);
  const timerValue = ref(0);

  watch(timer, () => {
    timerValue.value = new Date(timer.value);
  });

  watch(multiplier, () => {
    emitter.emit('setMultiplier', multiplier.value);
  })

  emitter.on('play', async () => {
    const playTimes = await usePlayTimesStore().getStartEndDatetime();
    sliderMin.value = playTimes.startDatetime;
    sliderMax.value = playTimes.endDatetime;
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
