import { usePlayTimeframeStore } from '@/stores/play-timeframe';
import { usePlayerMultiplierStore } from '@/stores/player-multiplier.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

export const useTimerStore = defineStore('timer', () => {
  const timer = ref(0);
  let interval: ReturnType<typeof setInterval> | null = null;

  const { multiplier } = storeToRefs(usePlayerMultiplierStore());
  const { state } = storeToRefs(usePlayStateStore());
  const { timeframe } = storeToRefs(usePlayTimeframeStore());

  function createInterval (multiplier: number) {
    return setInterval(async () => {
      if (!timer.value) return ;
      timer.value = timer.value + 1000;
      if(!timeframe || !timeframe.value.endDatetime) return;
      if (timer.value >= timeframe.value.endDatetime) {
        usePlayStateStore().stop();
        if (interval) clearInterval(interval);
        timer.value = timeframe.value.startDatetime || 0;
      }
    }, 1000 / multiplier);
  }

  watch(state, async () => {
    switch(state.value) {
      case (PlayState.PLAYING):
        if (!timer.value) {
          timer.value = timeframe.value.startDatetime || 0;
        }
        if (!interval) interval = createInterval(multiplier.value);
        break;
      case (PlayState.STOPPED):
        if (interval) clearInterval(interval);
        interval = null;
        timer.value = timeframe.value.startDatetime || 0;
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

  watch (timeframe, () => {
    timer.value = timeframe.value.startDatetime || 0;
  })

  watch (timer, () => {
    if (timer.value % 1000 > 0) timer.value = Math.floor(timer.value / 1000) * 1000;
  })

  return { timer };
});
