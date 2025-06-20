import { defineStore } from 'pinia';
import useMitt from '@/composables/useMitt';
import { useIndexedDBStore } from './indexed-db';

export const usePlayTimesStore = defineStore('play-times', () => {
  const startDatetime = ref(null);
  const endDatetime = ref(null);

  const emitter = useMitt();

  async function setStartEndDatetime () {
    emitter.emit('loading', null);
    await getStartDatetimeFromDB();
    await getEndDatetimeFromDB();
    emitter.emit('stop', null);
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

  async function getStartEndDatetime () {
    if (!startDatetime.value || !endDatetime.value) await setStartEndDatetime();
    return {
      startDatetime: startDatetime.value,
      endDatetime: endDatetime.value,
    };
  }

  function clearTimes () {
    startDatetime.value = null;
    endDatetime.value = null;
  }

  emitter.on('filesChanged', () => {
    clearTimes();
  });

  return { getStartEndDatetime };
});
