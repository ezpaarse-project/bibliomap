import Papa from 'papaparse';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import type { Log } from '@/main';
import { usePlayStateStore } from './play-state';

export const usePlayerFileStore = defineStore('player-file', () => {

  const files = ref([] as File[]);
  const { db } = storeToRefs(useIndexedDBStore());

  async function setFiles (newFiles: File[]) {
    usePlayStateStore().loading();
    await clearDB();
    await insertFilesIntoDB(newFiles);
    usePlayStateStore().loaded();
    files.value = newFiles;
  }

  async function insertEachLineIntoDB (file: File, db: IDBDatabase) {
    return new Promise<void>(resolve => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        async complete (results: Papa.ParseResult<Log>) {
          const data = results.data;
          for (const item of data) {
            await insertEventIntoDB(item, db);
          }
          resolve();
        },
      });
    });
  }

  async function insertEventIntoDB (item: Log, db: IDBDatabase) {
    return new Promise<void>(resolve => {
      const tx = db.transaction('events', 'readwrite');

      const toInsert = {
        datetime: new Date(item.datetime).getTime(), log: {
          ...item,
        },
      };

      const request = tx.objectStore('events').add(toInsert);
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async function insertFilesIntoDB (files: File[]) {
    if (!db.value) return;
    for (const file of files) {
      await insertEachLineIntoDB(file, db.value);
    }
  }

  async function clearDB () {
    if (!db.value) return;
    return new Promise<void>(resolve => {
      if (!db.value) {
        resolve();
        return;
      }
      const tx = db.value.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        resolve();
      };
    });
  }

  return { files, setFiles };
});
