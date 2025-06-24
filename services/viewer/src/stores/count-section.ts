import { useIndexedDBStore } from './indexed-db';
import { usePlayStateStore } from './play-state';
import { useSortFieldStore } from './sort-field';

export type Count = {
  [portal: string]: {
    [mime: string]: number
  }
}

export type Section = {
  datetime: number | null,
  count: Count
}

export const useCountSectionStore = defineStore('count-section', () => {
  const EVENTS_PER_SECTION = 100;

  const { db } = storeToRefs(useIndexedDBStore());
  const { fieldIdentifier, fields } = storeToRefs(useSortFieldStore());
  const sections = ref([] as Section[]);

  function createSections (eventsPerSection: number = EVENTS_PER_SECTION) {

    usePlayStateStore().loading();
    if (!db.value) return;
    const sections = [] as Section[];

    return new Promise(resolve => {
      if (!db.value) {
        resolve(null);
        return;
      }
      const tx = db.value.transaction('events', 'readwrite');
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

          if(!(log['geoip-latitude'] && log['geoip-longitude'])) {
            cursor.continue();
            return;
          }
          if (!log[fieldIdentifier.value]) log[fieldIdentifier.value] = 'UNKNOWN';
          log[fieldIdentifier.value].split('+').forEach((field: string) => {

            if (!section.datetime) {
              section.datetime = datetime;
            }

            const sectionCount: Count = section.count;

            if (!sectionCount[field.toUpperCase()]) sectionCount[field.toUpperCase()] = {};

            if (!sectionCount[field.toUpperCase()][log.mime]) sectionCount[field.toUpperCase()][log.mime] = 0;

            sectionCount[field.toUpperCase()][log.mime] += 1;
          });

          if (Object.values(section.count)
            .flatMap(Object.values)
            .reduce((sum, val) => sum + val, 0) > eventsPerSection * (sections.length + 1) - 1) {
            sections.push({ ...section });
            section = { datetime: null, count: JSON.parse(JSON.stringify(section.count)) }
          }
          cursor.continue();

        } else {
          usePlayStateStore().stop();
          sections.push(section);
          resolve(sections.length ? sections : null);
        }
      }
    });
  }

  watch (fields, async () => {
    sections.value = await createSections() as Section[];
  });

  return { sections };
});
