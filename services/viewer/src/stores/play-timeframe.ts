import { defineStore } from 'pinia';
import { useIndexedDBStore } from './indexed-db';
import { usePlayStateStore } from './play-state';
import { usePlayerFilesStore } from './player-files';

export const usePlayTimeframeStore = defineStore('play-timeframe', () => {
  const startDatetime = ref(null);
  const endDatetime = ref(null);

  const { files } = storeToRefs(usePlayerFilesStore());

  async function setTimeframe () {
    usePlayStateStore().loading();
    await getStartDatetimeFromDB();
    await getEndDatetimeFromDB();
    usePlayStateStore().stop();
  }

  async function getStartDatetimeFromDB () {
    const db = await useIndexedDBStore().getDB();
    if (!db) return;
    return new Promise<void>(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');

      const request = index.openCursor();

      request.onsuccess = event => {
        const target = event.target as IDBRequest<IDBCursorWithValue>;
        if (!target) return;
        const cursor = target.result;
        if (cursor) {
          startDatetime.value = cursor.value.datetime;
          resolve();
        } else {
          startDatetime.value = null;
          resolve();
        }
      }
    });
  }

  async function getEndDatetimeFromDB () {
    const db = await useIndexedDBStore().getDB();
    if (!db) return;
    return new Promise<void>(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');

      const request = index.openCursor(null, 'prev');

      request.onsuccess = event => {
        const target = event.target as IDBRequest<IDBCursorWithValue>;
        if (!target) return;
        const cursor = target.result;
        if (cursor) {
          endDatetime.value = cursor.value.datetime;
          resolve();
        } else {
          endDatetime.value = null;
          resolve();
        }
      }
    });
  }

  async function getTimeframe () {
    if (!startDatetime.value || !endDatetime.value) await setTimeframe();
    return {
      startDatetime: startDatetime.value,
      endDatetime: endDatetime.value,
    };
  }

  function clearTimeframe () {
    startDatetime.value = null;
    endDatetime.value = null;
  }

  watch(files, () => {
    clearTimeframe();
  });

  return { getTimeframe };
});
