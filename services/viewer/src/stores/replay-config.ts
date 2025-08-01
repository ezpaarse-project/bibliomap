import { useSocketStore } from './socket';

export type ReplayConfig = {
  replayStartDatetime: number,
  replayEndDatetime: number,
  replayMultiplier: number,
  replayDuration: number,
  description: string,
  timerStart: number
};

export const useReplayConfigStore = defineStore('replay-config', () => {
  const config = ref(null as ReplayConfig | null);
  const socket = useSocketStore().socket;

  socket.on('replayConfig', (replayConfig: ReplayConfig) => {
    config.value = replayConfig;
  });

  function fetchReplayConfig () {

    return new Promise(resolve => {
      socket.emit('replayConfigRequest', socket.id);

      socket.once('replayConfig', (replayConfig: ReplayConfig) => {
        resolve(replayConfig);
      });
    });
  }

  function setConfig (replayConfig: ReplayConfig) {
    config.value = replayConfig;
  }

  return { config, fetchReplayConfig, setConfig };
});
