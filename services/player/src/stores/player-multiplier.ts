export const usePlayerMultiplierStore = defineStore('player-multiplier', () => {
  const multiplier = ref(1);

  return { multiplier }
});
