import useMitt from '@/composables/useMitt';

export const usePlayerMultiplierStore = defineStore('player-multiplier', () => {
  const multiplier = ref(1);

  function getMultiplier () {
    return multiplier.value
  }

  const emitter = useMitt();

  emitter.on('setMultiplier', m => {
    multiplier.value = m;
  })

  return { getMultiplier }
});
