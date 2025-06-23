import useMitt from '@/composables/useMitt';
import { usePlayTimesStore } from '@/stores/play-times.ts';
import { usePlayerMultiplierStore } from '@/stores/player-multiplier.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

export const useTimerStore = defineStore('timer', () => {
  const timer = ref<number | null>(null);
  let interval: number | null = null;

  const emitter = useMitt();

  function createInterval (multiplier: number) {
    return setInterval(async () => {
      if (!timer.value) return ;
      timer.value = timer.value + 1000;
      const timeframe = await usePlayTimesStore().getStartEndDatetime()
      if(!timeframe || !timeframe.endDatetime) return;
      if (timer.value >= timeframe.endDatetime) {
        emitter.emit('stop');
      }
    }, 1000 / multiplier)
  }

  emitter.on('play', async () => {
    if (!timer.value) {
      const times = await usePlayTimesStore().getStartEndDatetime();
      timer.value = times.startDatetime;
    }

    if (!interval) interval = createInterval(usePlayerMultiplierStore().getMultiplier());
  });

  emitter.on('pause', () => {
    if (interval) clearInterval(interval);
    interval = null;
  });

  emitter.on('loading', () => {
    if (interval) clearInterval(interval);
    interval = null;
  });

  emitter.on('stop', () => {
    if (interval) clearInterval(interval);
    timer.value = null;
    interval = null;
  });

  emitter.on('setMultiplier', m => {
    if (usePlayStateStore().state !== PlayState.PLAYING) return;
    if (interval) clearInterval(interval);
    interval = createInterval(m)
  });

  return { timer };
});
