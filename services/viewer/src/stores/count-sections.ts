import { useIndexedDBStore } from './indexed-db';
import { usePortalsStore } from './portals';
import useMitt from '@/composables/useMitt';
import { PlayState, usePlayStateStore } from './play-state';

export const useCountSectionsStore = defineStore('count-sections', () => {
  const EVENTS_PER_SECTION = 100;

  const emitter = useMitt();
  const sections = ref([]);

  async function createSections (eventsPerSection: number = EVENTS_PER_SECTION) {

    if (usePlayStateStore().playState !== PlayState.LOADING) emitter.emit('loading', null);
    const db = await useIndexedDBStore().getDB();
    const portalNames = (await usePortalsStore().getPortals()).map(portal => portal.name.toUpperCase());
    const sections = [];

    return new Promise(resolve => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const index = store.index('by_date');
      let section = { datetime: null, count: {} }

      index.openCursor().onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          const log = cursor.value.log;
          const datetime = cursor.value.datetime;

          if(!log.ezproxyName) {
            cursor.continue();
            return;
          }
          log.ezproxyName.split('+').forEach(portal => {
            if (!portalNames.includes(portal.toUpperCase())) {
              return;
            }

            if (!section.datetime) {
              section.datetime = datetime;
            }

            if (!section.count[portal.toUpperCase()]) section.count[portal.toUpperCase()] = {}

            if (!section.count[portal.toUpperCase()][log.mime]) section.count[portal.toUpperCase()][log.mime] = 0

            section.count[portal.toUpperCase()][log.mime] += 1;
          });

          if (Object.values(section.count)
            .flatMap(Object.values)
            .reduce((sum, val) => sum + val, 0) > eventsPerSection * (sections.length + 1) - 1) {
            sections.push({ ...section });
            section = { datetime: null, count: JSON.parse(JSON.stringify(section.count)) }
          }
          cursor.continue();

        } else {
          if (usePlayStateStore().playState !== PlayState.STOPPED) emitter.emit('stop', null);
          sections.push(section);
          resolve(sections.length ? sections : null);
        }
      }
    });
  }

  emitter.on('files-loaded', async () => {
    sections.value = await createSections();
  });

  return { sections };
});
