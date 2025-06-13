export const useIndexedDBStore = defineStore('indexed-db', () => {
  let db;

  function openDB () {
    return new Promise(resolve => {
      const openRequest = indexedDB.open('ECs', 1);

      openRequest.onupgradeneeded = event => {
        db = event.target.result;

        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { autoIncrement: true });
          store.createIndex('by_date', 'datetime', { unique: false });
        }
      };

      openRequest.onsuccess = () => {
        db = openRequest.result;
        resolve();
      }
    });
  }

  async function getDB () {
    if (!db) {
      await openDB();
    }
    return db;
  }

  return { getDB }
});
