export const usePlayerFilesStore = defineStore('player-files', () => {
  const files = ref([]);

  return { files };
});
