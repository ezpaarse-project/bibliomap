import { useProgressStore } from './progress';
import { useI18n } from 'vue-i18n';

export enum PlayState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  LOADING = 'LOADING'
}

export const usePlayStateStore = defineStore('play-state', () => {

  const { t } = useI18n();

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

  watch(loadCounter, () => {
    useProgressStore().progress = 100 / loadCounter.value;
  })

  function loading () {
    if (state.value !== PlayState.LOADING) previousState.value = state.value;
    state.value = PlayState.LOADING;
    loadCounter.value++;
    const progressStore = useProgressStore();
    if (!progressStore.active) {
      progressStore.active = true;
      progressStore.message = t('progress-bar.sim-loading');
    }
  }

  function loaded () {
    loadCounter.value--;
    if (loadCounter.value === 0) {
      state.value = previousState.value || PlayState.STOPPED;
      const progressStore = useProgressStore();
      if (progressStore.active) {
        progressStore.active = false;
      }
    }
  }

  return { state, play, pause, stop, loading, loaded };
});
