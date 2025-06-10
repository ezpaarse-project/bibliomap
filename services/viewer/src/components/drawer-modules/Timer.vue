<template>
  <v-tooltip :disabled="playState !== PlayState.STOPPED" location="top">
    <template #activator="{ props }">
      <div class="time-container" v-bind="props">
        <div class="timer-multiplier-container">
          <v-chip :hidden="playState === PlayState.STOPPED">{{ timer }}</v-chip>
        </div>

        <v-slider
          class="w-100"
          :disabled="playState === PlayState.STOPPED"
          prepend-icon="mdi-play"
        />

        <v-number-input
          v-model="multiplier"
          class="w-100"
          dense
          :disabled="playState === PlayState.STOPPED"
          hide-details="auto"
          :label="t('drawer.timer.multiplier-field')"
        />
      </div>
    </template>
    <span>{{ t('drawer.timer.tooltips.stopped') }}</span>
  </v-tooltip>
</template>


<script setup lang="ts">
  import { useReplayTimerStore } from '@/stores/replay-timer';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const { timer } = storeToRefs(useReplayTimerStore());
  const { state: playState } = storeToRefs(usePlayStateStore());
  const multiplier = ref(1);

</script>

<style lang="scss">
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
