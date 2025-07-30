import { defineStore } from 'pinia';
import { type Field, useSortFieldStore } from '@/stores/sort-field.ts';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { type Count, useCountSectionStore } from './count-section.ts';
import { usePlayTimeframeStore } from '@/stores/play-timeframe.ts';
import { usePlayerFileStore } from '@/stores/player-file.ts';
import type { Log } from '@/main.ts';
import { useViewerConfigStore } from './viewer-config.ts';

export type EC = {
  datetime: string,
  log: Log,
}

export const useEcCountStore = defineStore('ec-count', () => {
  const count = ref({} as Count);

  const { config: viewerConfig } = storeToRefs(useViewerConfigStore());
  const { files } = storeToRefs(usePlayerFileStore());
  const { timer } = storeToRefs(useTimerStore());
  const { sections } = storeToRefs(useCountSectionStore());
  const { state } = storeToRefs(usePlayStateStore());
  const { timeframe } = storeToRefs(usePlayTimeframeStore());
  const { db } = storeToRefs(useIndexedDBStore());
  const { fieldIdentifier } = storeToRefs(useSortFieldStore());

  const fields = ref(viewerConfig.value.drawerParams.portalSection.portals as Field[]);

  watch(() => viewerConfig.value.drawerParams.portalSection.portals, () => {
    fields.value = viewerConfig.value.drawerParams.portalSection.portals;
  });

  let currentRequestToken = 0;

  watch(files, async () => {
    await resetCount();
    if ((usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) || !timer.value) return;
    updateCount(timer.value)
  });

  async function createCountFromEvents (events: Log[]) {
    const countObject = {} as Count;
    const fieldNames = fields.value.map(field => field.name.toUpperCase());

    fieldNames.forEach(f => {
      const field = f.length ? f.toUpperCase() : 'UNKNOWN';
      countObject[field] = {};
    });

    events.forEach(event => {
      const rawFieldValue = event[fieldIdentifier.value];

      if (typeof rawFieldValue !== 'string') return;

      const mime = event.mime ? event.mime.toUpperCase() : 'UNKNOWN';

      rawFieldValue.toUpperCase().split('+').forEach(f => {
        const field = f.length ? f.toUpperCase() : 'UNKNOWN';
        if (!countObject[field]) return;
        if (!countObject[field][mime]) countObject[field][mime] = 0;
        countObject[field][mime] += 1;
      });
    });

    return countObject;
  }

  function getCountOfField (field: string) {
    if (!count.value[field.toUpperCase()]) return 0;
    return Object.values(count.value[field.toUpperCase()]).reduce((a, b) => a + b, 0);
  }

  /**
   * Returns the total number of events for a given mime type. If the mime type is not present in any field, returns 0.
   * @param {string} mime - The mime type to count.
   * @return {number} - The total number of events for the given mime type.
   */
  function getCountOfMime (mime: string) {
    return Object.values(
      Object.fromEntries(
        Object.entries(count.value)
          .filter(([key]) => fields.value.map(f => f.name.toUpperCase()).includes(key.toUpperCase()))
      )
    )
      .reduce((a, b) => a + (b[mime.toUpperCase()] || 0), 0);
  }

  function getTotalCount () {
    // Gives the total count by summing each mime of each field.
    return Object.entries(count.value)
      .filter(([key]) => fields.value.map(f => f.name.toUpperCase()).includes(key.toUpperCase())).map(([, value]) => Object.values(value))
      .flatMap(Object.values)
      .reduce((sum, val) => sum + val, 0);
  }

  function getCountOfFieldAndMime (field: string, mime: string) {
    if (!field) field = 'UNKNOWN';
    return count.value[field.toUpperCase()][mime];
  }

  function getMimeInField (field: string) {
    if (!count.value[field.toUpperCase()]) return [];
    return Object.keys(count.value[field.toUpperCase()]);
  }

  async function getEventsBetween (start: number, end: number, lowerOpen: boolean = true, upperOpen: boolean = true) {
    if (start > end) return [];
    if (!db.value) return [];
    return new Promise(resolve => {
      if (!db.value) {
        resolve([]);
        return;
      }
      const tx = db.value.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');
      const range = IDBKeyRange.bound(start, end, start !== end && lowerOpen, end !== start && upperOpen);
      const results = [] as Log[];
      index.openCursor(range).onsuccess = event => {
        const target = event.target as IDBOpenDBRequest;
        if (!target) return;
        const cursor = target.result instanceof IDBCursorWithValue ? target.result : null;
        if (cursor) {
          results.push(cursor.value.log);
          cursor.continue();
        } else {
          resolve(results);
        }
      }
    });
  }

  const currentSection = ref(0);
  const timestampBorders = ref({ start: null, end: null } as { start: number | null, end: number | null });

  async function updateSection (timestamp: number) {
    for(let i = 0; i < sections.value.length - 1; i++) {
      const { datetime } = sections?.value?.[i] ?? {}
      if (datetime && timestamp >= datetime) {
        currentSection.value = i;
      }
    }
    timestampBorders.value = { start: sections.value[currentSection.value].datetime, end: currentSection.value + 1 < sections.value.length ? sections.value[currentSection.value + 1].datetime : Number.POSITIVE_INFINITY };
  }

  async function updateCount (timestamp: number) {
    if (!timestamp) return;
    const requestToken = ++currentRequestToken;

    if (requestToken !== currentRequestToken) return;

    if (Object.values(timestampBorders.value).every(v => v === null)) {
      timestampBorders.value = { start: timeframe.value.startDatetime, end: sections.value[0].datetime };
    }

    if (timestamp > (timestampBorders.value.end ?? Number.POSITIVE_INFINITY) || timestamp < (timestampBorders.value.start ?? 0)) {
      updateSection(timestamp);
    }

    const sectionTime = sections.value[currentSection.value].datetime;
    if (!sectionTime) return;

    const events = await getEventsBetween(sectionTime, timestamp, false) as Log[];
    if (requestToken !== currentRequestToken) return;

    const currentEventCount = await createCountFromEvents(events);
    if (requestToken !== currentRequestToken) return;

    count.value = mergeCounts(currentSection.value > 0 ? sections.value[currentSection.value -1].count : {}, currentEventCount);
  }

  function mergeCounts (previousSectionCount: Count, currentCount: Count) {
    Object.keys(previousSectionCount).forEach(field => {
      Object.keys(previousSectionCount[field]).forEach(mime => {
        if (!currentCount[field]) currentCount[field] = {};
        if (!currentCount[field][mime]) currentCount[field][mime] = 0;
        if (previousSectionCount[field] && previousSectionCount[field][mime]) currentCount[field][mime] = previousSectionCount[field][mime] + currentCount[field][mime];
      });
    });
    return currentCount;
  }

  async function resetCount () {
    fields.value.forEach((field: Field) => {
      count.value[field.name.toUpperCase() as string] = {};
    })
  }

  watch(state, async (s: PlayState) => {
    if (s === PlayState.STOPPED) await resetCount()
  })

  watch(timer, () => {
    if ((usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) || !timer.value) return;
    updateCount(timer.value)
  });

  return { getCountOfField, getCountOfMime, getTotalCount, getCountOfFieldAndMime, getMimeInField };
});
