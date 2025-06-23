import Papa from 'papaparse';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import type { Log } from '@/main';
import { usePlayStateStore } from './play-state';

export const usePlayerFilesStore = defineStore('player-files', () => {

  const files = ref([] as File[]);

  async function setFiles (newFiles: File[]) {
    usePlayStateStore().loading();
    await clearDB();
    await insertFilesIntoDB(newFiles);
    usePlayStateStore().stop();
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
          datetime: item.datetime,
          ezproxyName: item.ezproxyName || item['bib-groups'] || null,
          'geoip-latitude': item['geoip-latitude'] || null,
          'geoip-longitude': item['geoip-longitude'] || null,
          platform_name: item.platform_name || null,
          mime: item.mime || null,
          rtype: item.rtype || null,
        },
      };

      const request = tx.objectStore('events').add(toInsert);
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async function insertFilesIntoDB (files: File[]) {
    const db = await useIndexedDBStore().getDB();
    if (!db) return;
    for (const file of files) {
      await insertEachLineIntoDB(file, db);
    }
  }

  async function clearDB () {
    const db = await useIndexedDBStore().getDB();
    if (!db) return;
    return new Promise<void>(resolve => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        resolve();
      };
    });
  }

  return { files, setFiles };
});
