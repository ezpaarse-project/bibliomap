import Papa from 'papaparse';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import type { Log } from '@/main';
import { usePlayStateStore } from './play-state';
import { useProgressStore } from './progress';
import { useI18n } from 'vue-i18n';
import { useLargeFileStore } from './large-file';
import useMitt from '@/composables/useMitt';

export const usePlayerFileStore = defineStore('player-file', () => {

  const files = ref([] as File[]);
  const { db } = storeToRefs(useIndexedDBStore());
  const { progress, message, active: progressBarActive } = storeToRefs(useProgressStore());
  const { permission, largeFiles, active: filesTooLargeActive } = storeToRefs(useLargeFileStore());
  const emitter = useMitt();

  const { t } = useI18n();

  async function setFiles (newFiles: File[]) {
    console.log(permission.value, newFiles)
    if (areFilesTooLarge(newFiles) && !permission.value) {
      largeFiles.value = newFiles;
      filesTooLargeActive.value = true;
      return;
    }
    console.log('HERE', newFiles.length)
    usePlayStateStore().loading();
    await clearDB();
    await insertFilesIntoDB(newFiles);
    usePlayStateStore().loaded();
    files.value = newFiles;
  }

  function areFilesTooLarge (files: File[]) {
    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }
    return totalSize > 50 * 1024 * 1024;
  }

  async function insertEachLineIntoDB (file: File, db: IDBDatabase) {
    return new Promise<void>(resolve => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        async complete (results: Papa.ParseResult<Log>) {
          const data = results.data;
          const length = data.length;
          for (const item of data) {
            await insertEventIntoDB(item, db);
            progress.value += (100 / length);
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
    if (!db.value || !files.length) return;
    progressBarActive.value = true;
    for (const file of files) {
      progress.value = 0;
      message.value = t('progress-bar.inserting-file', { name: file.name });
      await insertEachLineIntoDB(file, db.value);
    }
    progressBarActive.value = false;
    emitter.emit('filesLoaded', null);
  }

  async function clearDB () {
    if (!db.value) return;
    return new Promise<void>(resolve => {
      console.log('CLEARING DB')
      message.value = t('progress-bar.clearing-db');
      progress.value = -1;
      progressBarActive.value = true;
      if (!db.value) {
        resolve();
        return;
      }
      const tx = db.value.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        progress.value = 100;
        progressBarActive.value = false;
        resolve();
      };
    });
  }

  watch(permission, () => {
    if(permission.value) setFiles(largeFiles.value);
    setFiles([]);
  });

  return { files, setFiles };
});
