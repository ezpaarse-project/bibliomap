import useMitt from '@/composables/useMitt';
import Papa from 'papaparse';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';

export const usePlayerFilesStore = defineStore('player-files', () => {

  const files = ref([]);
  const emitter = useMitt();

  async function setFiles (newFiles) {
    files.value = newFiles;
    emitter.emit('loading', null);
    await clearDB();
    await insertFilesIntoDB();
    emitter.emit('stop', null);
    emitter.emit('files-loaded', null);
  }

  async function insertEachLineIntoDB (file: File, db) {
    return new Promise(resolve => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        async complete (results) {
          const data = results.data;
          for (const item of data) {
            await insertEventIntoDB(item, db);
          }
          resolve();
        },
      });
    });
  }

  async function insertEventIntoDB (item, db) {
    return new Promise(resolve => {
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

  async function insertFilesIntoDB () {
    const db = await useIndexedDBStore().getDB();
    for (const file of files.value) {
      await insertEachLineIntoDB(file, db);
    }
  }

  async function clearDB () {
    const db = await useIndexedDBStore().getDB();
    return new Promise(resolve => {
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
