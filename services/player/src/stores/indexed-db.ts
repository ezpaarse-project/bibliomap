export const useIndexedDBStore = defineStore('indexed-db', () => {
  const db = ref<IDBDatabase | null>(null);

  function openDB () {
    return new Promise<void>((resolve, rejects) => {
      const openRequest = indexedDB.open('ECs', 1);

      openRequest.onupgradeneeded = event => {
        const target = event.target as IDBOpenDBRequest;
        if (!target) rejects();
        db.value = target.result;

        if (!db.value.objectStoreNames.contains('events')) {
          const store = db.value.createObjectStore('events', { autoIncrement: true });
          store.createIndex('by_date', 'datetime', { unique: false });
        }
      };

      openRequest.onsuccess = () => {
        db.value = openRequest.result;
        resolve();
      }
    });
  }

  openDB();

  return { db }
});
