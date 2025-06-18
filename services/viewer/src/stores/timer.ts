import useMitt from '@/composables/useMitt';
import { usePlayTimesStore } from '@/stores/play-times.ts';
import { usePlayerMultiplierStore } from '@/stores/player-multiplier.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

export const useTimerStore = defineStore('timer', () => {
  const timer = ref<number | null>(null);
  let interval;

  const emitter = useMitt();

  function createInterval (m) {

    return setInterval(() => {
      timer.value = timer.value + 1000;
      if (timer.value >= usePlayTimesStore().endDatetime) {
        emitter.emit('stop');
      }
    }, 1000 / m)
  }

  emitter.on('play', async () => {
    if (!timer.value) {
      const times = await usePlayTimesStore().getStartEndDatetime();
      timer.value = times.startDatetime;
    }

    if (!interval) interval = createInterval(usePlayerMultiplierStore().getMultiplier());
  });

  emitter.on('pause', () => {
    clearInterval(interval);
    interval = null;
  });

  emitter.on('loading', () => {
    clearInterval(interval);
    interval = null;
  });

  emitter.on('stop', () => {
    clearInterval(interval);
    timer.value = null;
    interval = null;
  });

  emitter.on('setMultiplier', m => {
    if (usePlayStateStore().state !== PlayState.PLAYING) return;
    clearInterval(interval);
    interval = createInterval(m)
  });

  return { timer };
});
