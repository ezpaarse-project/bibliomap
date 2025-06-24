export enum PlayState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  LOADING = 'LOADING'
}

export const usePlayStateStore = defineStore('play-state', () => {

  const state = ref(PlayState.STOPPED);
  const previousState = ref(null as PlayState | null);
  const loadCounter = ref(0);

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
    if (state.value !== PlayState.LOADING) previousState.value = state.value;
    state.value = PlayState.LOADING;
    loadCounter.value++;
  }

  function loaded () {
    loadCounter.value--;
    if (loadCounter.value === 0) state.value = previousState.value || PlayState.STOPPED;
  }

  return { state, play, pause, stop, loading, loaded };
});
