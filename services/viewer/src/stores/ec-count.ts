import { defineStore } from 'pinia';
import { usePortalsStore } from '@/stores/portals.ts';
import useMitt from '@/composables/useMitt';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { useCountSectionsStore } from './count-sections.ts';
import { usePlayTimesStore } from '@/stores/play-times.ts';
import type { Log } from '@/main.ts';

export type EC = {
  datetime: string,
  log: Log,
}

export const useEcCountStore = defineStore('ec-count', () => {
  const count = ref({});

  const portalsStore = usePortalsStore();

  const emitter = useMitt();

  const { timer } = storeToRefs(useTimerStore());
  const { sections } = storeToRefs(useCountSectionsStore());

  let currentRequestToken = 0;

  emitter.on('files-loaded', async () => {
    const portals = await portalsStore.getPortals();
    portals.forEach(portal => {
      count.value[portal.name.toUpperCase()] = {};
    })
  });

  async function createCountFromEvents (events) {
    const countObject = {};
    const portalNames = (await usePortalsStore().getPortals()).map(portal => portal.name.toUpperCase());
    portalNames.forEach(portal => {
      countObject[portal.toUpperCase()] = {};
    });
    events.forEach(event => {
      const portal = event.ezproxyName.toUpperCase();
      const mime = event.mime.toUpperCase();
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
    return new Promise(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');
      const range = IDBKeyRange.bound(start, end, start !== end && lowerOpen, end !== start && upperOpen);
      const results = [];
      index.openCursor(range).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value.log);
          cursor.continue();
        } else {
          resolve(results);
        }
      }
    });
  }

  const previousTimestamp = ref(null);
  const currentSection = ref(0);
  const timestampBorders = ref({});

  async function updateSection (timestamp: number) {
    const previousSection = currentSection.value;
    for(let i = 0; i < sections.value.length - 1; i++) {
      if (timestamp >= sections.value[i].datetime) {
        currentSection.value = i;
      }
    }
    if (currentSection.value === previousSection) currentSection.value = sections.value.length - 1;
    if (currentSection.value === -1) {
      currentSection.value = 0;
      timestampBorders.value = {};
    }
    timestampBorders.value = { start: sections.value[currentSection.value].datetime, end: currentSection.value + 1 < sections.value.length ? sections.value[currentSection.value + 1].datetime : Number.POSITIVE_INFINITY };
  }

  async function updateCount (timestamp: number) {
    if (!timestamp) return;
    const requestToken = ++currentRequestToken;

    const startEndTimes = await usePlayTimesStore().getStartEndDatetime();
    if (requestToken !== currentRequestToken) return;

    if (Object.keys(timestampBorders.value).length === 0) {
      timestampBorders.value = { start: startEndTimes.startDatetime, end: sections.value[0].datetime };
    }

    if (timestamp > timestampBorders.value.end || timestamp < timestampBorders.value.start) {
      updateSection(timestamp);
    }

    const events = await getEventsBetween(sections.value[currentSection.value].datetime, timestamp, false);
    if (requestToken !== currentRequestToken) return;

    const currentEventCount = await createCountFromEvents(events);
    if (requestToken !== currentRequestToken) return;

    count.value = mergeCounts(currentSection.value > 0 ? sections.value[currentSection.value -1].count : {}, currentEventCount);
  }

  function mergeCounts (previousSectionCount, currentCount) {
    Object.keys(previousSectionCount).forEach(portal => {
      Object.keys(previousSectionCount[portal]).forEach(mime => {
        if (!currentCount[portal]) currentCount[portal] = {};
        if (!currentCount[portal][mime]) currentCount[portal][mime] = 0;
        if (previousSectionCount[portal] && previousSectionCount[portal][mime]) currentCount[portal][mime] = previousSectionCount[portal][mime] + currentCount[portal][mime];
      });
    });
    return currentCount;
  }

  watch(timer, () => {
    if (usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) return;
    updateCount(timer.value)
  });

  emitter.on('play', async () => {
    previousTimestamp.value = useTimerStore().timer;
  });

  return { getCountOfPortal, getCountOfMime, getTotalCount, getCountOfPortalAndMime, getMimeInPortal };
});
