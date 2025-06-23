import useMitt from '@/composables/useMitt';
import { useIndexedDBStore } from './indexed-db';
import { useViewerConfigStore } from './viewer-config';
import { usePlayStateStore } from './play-state';
import type { EC } from './ec-count';

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
    if (!db) return;
    return new Promise<void>(resolve => {
      emitter.emit('loading', null);
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll();
      request.onsuccess = event => {
        const target = event.target as IDBRequest<EC[]>;
        if (!target) return ;
        const allEvents = target.result;

        const mimeNames = new Set(
          allEvents
            .map(event => event?.log?.mime ? event?.log?.mime.split('+') : [])
            .flat()
            .filter(name => typeof name === 'string')
            .sort()
        );

        mimes.value = Array.from(mimeNames).map(mime => ( {
          name: mime,
          color: viewerConfig.value?.mapParams?.attributesColors?.mimes[mime as keyof typeof viewerConfig.value.mapParams.attributesColors.mimes]
            ? viewerConfig.value.mapParams.attributesColors.mimes[mime as keyof typeof viewerConfig.value.mapParams.attributesColors.mimes].color
            : '#7F8C8D',
        })).sort((a, b) => a.name.localeCompare(b.name));
        usePlayStateStore().stop();

        resolve();
      }
    });
  }

  emitter.on('files-loaded', () => {
    setMimes();
  });

  return { mimes };
})
