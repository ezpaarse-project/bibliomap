import { useIndexedDBStore } from './indexed-db';
import { usePortalsStore } from './portals';
import useMitt from '@/composables/useMitt';
import { PlayState, usePlayStateStore } from './play-state';

export type Count = {
  [portal: string]: {
    [mime: string]: number
  }
}

export type Section = {
  datetime: number | null,
  count: Count
}

export const useCountSectionsStore = defineStore('count-sections', () => {
  const EVENTS_PER_SECTION = 100;

  const emitter = useMitt();
  const sections = ref([] as Section[]);

  async function createSections (eventsPerSection: number = EVENTS_PER_SECTION) {

    if (usePlayStateStore().state !== PlayState.LOADING) emitter.emit('loading', null);
    const db = await useIndexedDBStore().getDB();
    if (!db) return;
    const portals = await usePortalsStore().getPortals()
    const portalNames = (portals).map(portal => portal.name.toUpperCase());
    const sections = [] as Section[];

    return new Promise(resolve => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const index = store.index('by_date');
      let section = { datetime: null, count: ({} as Count) } as Section;

      index.openCursor().onsuccess = (event: Event) => {
        const target = event.target as IDBOpenDBRequest;
        if (!target) return;
        const cursor = target.result instanceof IDBCursorWithValue ? target.result : null;
        if (cursor) {
          const log = cursor.value.log;
          const datetime = cursor.value.datetime;

          if(!log.ezproxyName) {
            cursor.continue();
            return;
          }
          log.ezproxyName.split('+').forEach((portal: string) => {
            if (!portalNames.includes(portal.toUpperCase())) {
              return;
            }

            if (!section.datetime) {
              section.datetime = datetime;
            }

            const sectionCount: Count = section.count;

            if (!sectionCount[portal.toUpperCase()]) sectionCount[portal.toUpperCase()] = {}

            if (!sectionCount[portal.toUpperCase()][log.mime]) sectionCount[portal.toUpperCase()][log.mime] = 0

            sectionCount[portal.toUpperCase()][log.mime] += 1;
          });

          if (Object.values(section.count)
            .flatMap(Object.values)
            .reduce((sum, val) => sum + val, 0) > eventsPerSection * (sections.length + 1) - 1) {
            sections.push({ ...section });
            section = { datetime: null, count: JSON.parse(JSON.stringify(section.count)) }
          }
          cursor.continue();

        } else {
          if (usePlayStateStore().state !== PlayState.STOPPED) emitter.emit('stop', null);
          sections.push(section);
          resolve(sections.length ? sections : null);
        }
      }
    });
  }

  emitter.on('files-loaded', async () => {
    sections.value = await createSections() as Section[];
  });

  return { sections };
});
