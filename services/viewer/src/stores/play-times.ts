import { usePlayerFilesStore } from './player-files';
import { defineStore } from 'pinia';
import Papa from 'papaparse';

export const usePlayTimesStore = defineStore('play-times', () => {
  const startDatetime = ref(null);
  const endDatetime = ref(null);

  async function getStartEndDatetimeOfFile (file: File) {
    return new Promise(resolve => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete (results) {
          const data = results.data as { datetime: string }[];

          if (data.length === 0) {
            resolve({ startDatetime: null, endDatetime: null });
            return;
          }

          resolve({
            startDatetime: new Date(data[0].datetime).getTime(),
            endDatetime: new Date(data[data.length - 1].datetime).getTime(),
          });
        },
      });
    });
  }
  async function setStartEndDatetime () {
    const files = usePlayerFilesStore().files;
    if (!files.length) return;

    const startEndDatetimesPromises = []
    const startEndDatetimes = []

    files.forEach(file => {
      startEndDatetimesPromises.push(getStartEndDatetimeOfFile(file));
    });

    for (const promise of startEndDatetimesPromises) {
      startEndDatetimes.push(await promise);
    }

    startDatetime.value = Math.min(...startEndDatetimes.map(startEndDatetime => startEndDatetime.startDatetime));
    endDatetime.value = Math.max(...startEndDatetimes.map(startEndDatetime => startEndDatetime.endDatetime));
  }

  async function getStartEndDatetime () {
    if (!startDatetime.value || !endDatetime.value) await setStartEndDatetime();
    return {
      startDatetime: startDatetime.value,
      endDatetime: endDatetime.value,
    };
  }

  function resetStartEndDatetime () {
    startDatetime.value = null;
    endDatetime.value = null;
  }

  return { getStartEndDatetime, resetStartEndDatetime };
});
