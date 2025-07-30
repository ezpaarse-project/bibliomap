import { useIndexedDBStore } from './indexed-db';
import { useViewerConfigStore } from './viewer-config';
import { usePlayStateStore } from './play-state';
import { usePlayerFileStore } from './player-file';
import type { EC } from './ec-count';
import useMitt from '@/composables/useMitt';

export type Mime = {
  name: string;
  color: string;
}

export const useMimeStore = defineStore('mime', () => {

  const emitter = useMitt();

  const mimes = ref([] as Mime[]);
  const shownMimes = ref([] as Mime[]);
  const { files } = storeToRefs(usePlayerFileStore());
  const { db } = storeToRefs(useIndexedDBStore());

  async function setMimes () {
    mimes.value = [];
    const { config: viewerConfig } = storeToRefs(useViewerConfigStore());
    if (!db.value) return;
    return new Promise<void>(resolve => {
      if (!db.value) {
        resolve();
        return;
      }
      usePlayStateStore().loading();
      const tx = db.value.transaction('events', 'readonly');
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

        const defaultColor = '#7F8C8D';
        Array.from(mimeNames).forEach(mimeName => {
          const color = viewerConfig.value?.mapParams?.attributesColors?.mimes[mimeName as keyof typeof viewerConfig.value.mapParams.attributesColors.mimes]
            ? viewerConfig.value.mapParams.attributesColors.mimes[mimeName as keyof typeof viewerConfig.value.mapParams.attributesColors.mimes].color
            : defaultColor
          mimes.value.push({
            name: mimeName,
            color,
          });
        })
        mimes.value.sort((a, b) => a.name.localeCompare(b.name));
        usePlayStateStore().loaded();
        shownMimes.value = [...mimes.value];
        resolve();
      }
    });
  }

  watch(files, () => {
    setMimes();
  });

  emitter.on('resetFileField', () => {
    mimes.value = [];
  })

  return { mimes, shownMimes };
})
