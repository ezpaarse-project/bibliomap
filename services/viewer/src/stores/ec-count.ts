import { defineStore } from 'pinia';
import { type Portal, usePortalStore } from '@/stores/portal.ts';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { type Count, useCountSectionStore } from './count-section.ts';
import { usePlayTimeframeStore } from '@/stores/play-timeframe.ts';
import { usePlayerFileStore } from '@/stores/player-file.ts';
import type { Log } from '@/main.ts';

export type EC = {
  datetime: string,
  log: Log,
}

export const useEcCountStore = defineStore('ec-count', () => {
  const count = ref({} as Count);

  const portalsStore = usePortalStore();

  const { files } = storeToRefs(usePlayerFileStore());

  const { timer } = storeToRefs(useTimerStore());
  const { sections } = storeToRefs(useCountSectionStore());
  const { state } = storeToRefs(usePlayStateStore());

  let currentRequestToken = 0;

  watch(files, async () => {
    await resetCount()
  });

  async function createCountFromEvents (events: Log[]) {
    const countObject = {} as Count;
    const portalNames = (await usePortalStore().getPortals()).map(portal => portal.name.toUpperCase());
    portalNames.forEach(portal => {
      countObject[portal.toUpperCase()] = {};
    });
    events.forEach(event => {
      const portal = event.ezproxyName.toUpperCase();
      const mime = event.mime ? event.mime.toUpperCase() : 'unknown';
      portal.split('+').forEach((portal: string) => {
        if (countObject[portal] === undefined) return;
        if (!countObject[portal][mime]) countObject[portal][mime] = 0;
        countObject[portal][mime] += 1;
      });
    });
    return countObject;
  }

  function getCountOfPortal (portal: string) {
    return Object.values(count.value[portal.toUpperCase()]).reduce((a, b) => a + b, 0);
  }

  function getCountOfMime (mime: string) {
    return Object.values(count.value).reduce((a, b) => a + (b[mime.toUpperCase()] || 0), 0);
  }

  function getTotalCount () {
    return Object.values(count.value)
      .flatMap(Object.values)
      .reduce((sum, val) => sum + val, 0);
  }

  function getCountOfPortalAndMime (portal: string, mime: string) {
    return count.value[portal.toUpperCase()][mime];
  }

  function getMimeInPortal (portal: string) {
    return Object.keys(count.value[portal.toUpperCase()]);
  }

  async function getEventsBetween (start: number, end: number, lowerOpen: boolean = true, upperOpen: boolean = true) {
    if (start > end) return [];
    const db = await useIndexedDBStore().getDB();
    if (!db) return [];
    return new Promise(resolve => {
      const tx = db.transaction('events', 'readonly');
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

    const startEndTimes = await usePlayTimeframeStore().getTimeframe();
    if (requestToken !== currentRequestToken) return;

    if (Object.values(timestampBorders.value).every(v => v === null)) {
      timestampBorders.value = { start: startEndTimes.startDatetime, end: sections.value[0].datetime };
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
    Object.keys(previousSectionCount).forEach(portal => {
      Object.keys(previousSectionCount[portal]).forEach(mime => {
        if (!currentCount[portal]) currentCount[portal] = {};
        if (!currentCount[portal][mime]) currentCount[portal][mime] = 0;
        if (previousSectionCount[portal] && previousSectionCount[portal][mime]) currentCount[portal][mime] = previousSectionCount[portal][mime] + currentCount[portal][mime];
      });
    });
    return currentCount;
  }

  async function resetCount () {
    const portals = await portalsStore.getPortals();
    portals.forEach((portal: Portal) => {
      count.value[portal.name.toUpperCase() as string] = {};
    })
  }

  watch(state, async () => {
    await resetCount()
  })

  watch(timer, () => {
    if ((usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) || !timer.value) return;
    updateCount(timer.value)
  });

  return { getCountOfPortal, getCountOfMime, getTotalCount, getCountOfPortalAndMime, getMimeInPortal };
});
