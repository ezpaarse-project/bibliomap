export const usePlayerMultiplierStore = defineStore('player-multiplier', () => {
  const multiplier = ref(1);

  return {
    multiplier: computed({
      get: () => multiplier.value,
      set: value => {
        if (Number.isNaN(value)) return 1;
        multiplier.value = Math.min(100, Math.max(1, value));
      },
    }),
  }
});
