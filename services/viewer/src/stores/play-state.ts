import useMitt from '@/composables/useMitt';

export enum PlayState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  LOADING = 'LOADING'
}

export const usePlayStateStore = defineStore('play-state', () => {

  const emitter = useMitt();

  const state = ref(PlayState.STOPPED);

  function play () {
    state.value = PlayState.PLAYING;
  }

  function pause () {
    state.value = PlayState.PAUSED;
  }

  function stop () {
    state.value = PlayState.STOPPED;
  }

  function loading () {
    state.value = PlayState.LOADING;
  }

  emitter.on('play', play);
  emitter.on('pause', pause);
  emitter.on('stop', stop);
  emitter.on('loading', loading);
  emitter.on('filesChanged', stop);

  return { state, play, pause, stop, loading };
});
