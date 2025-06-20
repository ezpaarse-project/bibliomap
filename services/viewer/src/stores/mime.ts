import useMitt from '@/composables/useMitt';
import { useIndexedDBStore } from './indexed-db';
import { useViewerConfigStore } from './viewer-config';

export type Mime = {
  name: string;
  color: string;
}

export const useMimeStore = defineStore('mime', () => {

  const emitter = useMitt();
  const mimes = ref([] as Mime[]);

  async function setMimes () {
    const { config: viewerConfig } = storeToRefs(useViewerConfigStore());
    const db = await useIndexedDBStore().getDB();
    return new Promise(resolve => {
      emitter.emit('loading', null);
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll();
      request.onsuccess = event => {
        const allEvents = event.target.result;

        const mimeNames = new Set(
          allEvents
            .map(event => event?.log?.mime.split('+'))
            .flat()
            .filter(name => typeof name === 'string')
            .sort()
        );

        mimes.value = Array.from(mimeNames).map(mime => ( {
          name: mime,
          color: viewerConfig.value.mapParams.attributesColors.mimes[mime] ? viewerConfig.value.mapParams.attributesColors.mimes[mime].color : '#7F8C8D',
        })).sort((a, b) => a.name.localeCompare(b.name));
        emitter.emit('stop', false);

        resolve();
      }
    });
  }

  emitter.on('files-loaded', () => {
    setMimes();
  });

  emitter.on('files-loaded', () => {
    mimes.value = [];
  })

  return { mimes };
})
