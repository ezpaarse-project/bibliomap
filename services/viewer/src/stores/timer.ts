import { usePlayTimesStore } from '@/stores/play-times.ts';
import { usePlayerMultiplierStore } from '@/stores/player-multiplier.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

export const useTimerStore = defineStore('timer', () => {
  const timer = ref<number | null>(null);
  let interval: ReturnType<typeof setInterval> | null = null;

  const { multiplier } = storeToRefs(usePlayerMultiplierStore());
  const { state } = storeToRefs(usePlayStateStore());

  function createInterval (multiplier: number) {
    return setInterval(async () => {
      if (!timer.value) return ;
      timer.value = timer.value + 1000;
      const timeframe = await usePlayTimesStore().getStartEndDatetime()
      if(!timeframe || !timeframe.endDatetime) return;
      if (timer.value >= timeframe.endDatetime) {
        usePlayStateStore().stop();
        if (interval) clearInterval(interval);
        const timeframe = await usePlayTimesStore().getStartEndDatetime();
        timer.value = timeframe.startDatetime;
      }
    }, 1000 / multiplier);
  }

  watch(state, async () => {
    switch(state.value) {
      case (PlayState.PLAYING):
        if (!timer.value) {
          const times = await usePlayTimesStore().getStartEndDatetime();
          timer.value = times.startDatetime;
        }
        if (!interval) interval = createInterval(multiplier.value);
        break;
      case (PlayState.STOPPED):
        if (interval) clearInterval(interval);
        interval = null;
        timer.value = null;
        break;
      case (PlayState.LOADING):
        if (interval) clearInterval(interval);
        interval = null;
        break;
      case (PlayState.PAUSED):
        if (interval) clearInterval(interval);
        interval = null;
        break;
    }
  });

  watch (multiplier, (m: number) => {
    if (usePlayStateStore().state !== PlayState.PLAYING) return;
    if (interval) clearInterval(interval);
    interval = createInterval(m)
  });

  return { timer };
});
