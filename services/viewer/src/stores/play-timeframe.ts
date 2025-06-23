import { defineStore } from 'pinia';
import { useIndexedDBStore } from './indexed-db';
import { usePlayStateStore } from './play-state';
import { usePlayerFileStore } from './player-file';

export const usePlayTimeframeStore = defineStore('play-timeframe', () => {
  const timeframe = ref({ startDatetime: null, endDatetime: null });

  const { files } = storeToRefs(usePlayerFileStore());

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
          timeframe.value.startDatetime = cursor.value.datetime;
          resolve();
        } else {
          timeframe.value.startDatetime = null;
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
          timeframe.value.endDatetime = cursor.value.datetime;
          resolve();
        } else {
          timeframe.value.endDatetime = null;
          resolve();
        }
      }
    });
  }

  watch(files, () => {
    setTimeframe();
  });

  return { timeframe };
});
