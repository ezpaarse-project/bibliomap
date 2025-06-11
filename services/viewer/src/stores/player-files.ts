import { usePlayTimesStore } from './play-times';

export const usePlayerFilesStore = defineStore('player-files', () => {
  const files = ref([]);

  function getFiles () {
    return files.value;
  }

  function setFiles (files) {
    this.files = files;
    usePlayTimesStore().resetStartEndDatetime();
  }

  return { getFiles, setFiles };
});
