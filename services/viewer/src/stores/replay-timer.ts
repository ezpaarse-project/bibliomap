import { useReplayConfigStore } from './replay-config';
import { useSocketStore } from './socket';

export const useReplayTimerStore = defineStore('timer', () => {
  const timer = ref<number | null>(null);
  const io = useSocketStore().socket;
  const { config: replayConfig } = storeToRefs(useReplayConfigStore());

  io.on('timeUpdate', (t: number) => {
    timer.value = t;
  });

  watchEffect(onCleanup => {
    const config = replayConfig?.value;
    if (!config) return;

    const intervalWaitTime = 1000 / config.replayMultiplier;

    const interval = setInterval(() => {
      if (timer.value !== null) {
        timer.value += 1000;
      }
    }, intervalWaitTime);

    onCleanup(() => {
      clearInterval(interval);
    });
  });


  return { timer };
});
