export enum PlayState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  LOADING = 'LOADING'
}

export const usePlayStateStore = defineStore('play-state', () => {

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

  return { state, play, pause, stop, loading };
});
