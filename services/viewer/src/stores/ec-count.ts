import { defineStore } from 'pinia';
import { usePortalsStore } from '@/stores/portals.ts';
import useMitt from '@/composables/useMitt';
import { useTimerStore } from './timer.ts';
import { useIndexedDBStore } from '@/stores/indexed-db.ts';
import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
import { usePlayTimesStore } from '@/stores/play-times.ts';
import { useMimesStore } from '@/stores/mimes.ts';

export const useEcCountStore = defineStore('ec-count', () => {
  const count = reactive({} as Record<string, Record<string, number>>);
  const completeCount = ref({});

  const portalsStore = usePortalsStore();

  const emitter = useMitt();

  const { timer } = storeToRefs(useTimerStore());

  emitter.on('files-loaded', async () => {
    const portals = await portalsStore.getPortals();
    portals.forEach(portal => {
      count[portal.name.toUpperCase()] = {};
    })
  });

  function increment (portal: string, mime: string) {
    portal.split('+').forEach((portal: string) => {
      if (!count[portal.toUpperCase()]) return;
      if (!count[portal.toUpperCase()][mime]) count[portal.toUpperCase()][mime] = 0;
      count[portal.toUpperCase()][mime] += 1;
    });
  }

  function putEventsInCountObject (events, countObject) {
    events.forEach(event => {
      const portal = event.ezproxyName.toUpperCase();
      const mime = event.mime.toUpperCase();
      portal.split('+').forEach((portal: string) => {
        // console.log(portal, countObject[portal] !== undefined);
        if (countObject[portal] === undefined) return;
        // console.log(mime, countObject[portal][mime])
        if (!countObject[portal][mime]) countObject[portal][mime] = 0;
        countObject[portal][mime] += 1;
      });
    });
  }

  async function getCompleteCount () {
    if (usePlayStateStore().playState !== PlayState.LOADING) emitter.emit('loading', null);
    const db = await useIndexedDBStore().getDB();
    return new Promise(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async event => {
        const allEvents = event.target.result.map(event => event.log);
        const portals = await portalsStore.getPortals();

        const newCompleteCount = {};
        portals.forEach(portal => {
          newCompleteCount[portal.name.toUpperCase()] = {};
        });
        putEventsInCountObject(allEvents, newCompleteCount);
        if (usePlayStateStore().playState !== PlayState.PLAYING) emitter.emit('play', null);
        resolve(newCompleteCount);
      }
    });
  }

  function decrement (portal: string, mime: string) {
    portal.split('+').forEach((portal: string) => {
      if (!count[portal.toUpperCase()]) return;
      if (!count[portal.toUpperCase()][mime]) count[portal.toUpperCase()][mime] = 0;
      count[portal.toUpperCase()][mime] -= 1;
    });
  }

  function resetCount () {
    Object.keys(count).forEach(portal => {
      count[portal.toUpperCase()] = {};
    });
  }

  function getCountOfPortal (portal: string) {
    return Object.values(count[portal.toUpperCase()]).reduce((a, b) => a + b, 0);
  }

  function getCountOfMime (mime: string) {
    return Object.values(count).reduce((a, b) => a + (b[mime.toUpperCase()] || 0), 0);
  }

  function getTotalCount () {
    return Object.values(count)
      .flatMap(Object.values)
      .reduce((sum, val) => sum + val, 0);
  }

  function getCountOfPortalAndMime (portal: string, mime: string) {
    return count[portal.toUpperCase()][mime];
  }

  function getMimeInPortal (portal: string) {
    return Object.keys(count[portal.toUpperCase()]);
  }

  const previousTimestamp = ref(null);

  async function getEventsBetween (start: number, end: number, lowerOpen: boolean = true, upperOpen: boolean = true) {
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

  function changeCount (events, add: boolean) {
    for (const event of events) {
      if (!event.ezproxyName) continue;
      if (add) {
        increment(event.ezproxyName.toUpperCase(), event.mime || 'unknown');
      } else {
        decrement(event.ezproxyName.toUpperCase(), event.mime || 'unknown');
      }
    }
  }

  async function changeCountByRange (timestamp: number) {
    const forward = timestamp >= previousTimestamp.value;
    const eventsPromise = getEventsBetween(Math.min(previousTimestamp.value, timestamp), Math.max(timestamp, previousTimestamp.value), forward, !forward);
    changeCount((await eventsPromise), forward);
  }

  async function updateTimer (timestamp: number) {
    const startEndTimes = await usePlayTimesStore().getStartEndDatetime();

    if (!previousTimestamp.value || Math.abs(startEndTimes.startDatetime - timestamp) <= Math.abs(startEndTimes.endDatetime - timestamp)) {
      console.log('HERE')
      const events = await getAllEventsBefore(timestamp);
      resetCount();
      for (const event of events) {
        if (!event.ezproxyName) continue;
        increment(event.ezproxyName.toUpperCase(), event.mime || 'unknown');
      }
      previousTimestamp.value = timestamp;
    }
    else {
      console.log('ICI');

      const newCount = (await getCurrentEventCountFromCompleteCount(timestamp));

      const portalNames = (await usePortalsStore().getPortals()).map(portal => portal.name.toUpperCase());
      const mimeNames = (await useMimesStore().getMimes()).map(mime => mime.name.toUpperCase());

      portalNames.forEach(portal => {
        mimeNames.forEach(mime => {
          if (!newCount[portal]) count[portal] = {};
          if (!newCount[portal][mime]) count[portal][mime] = 0;
          else count[portal][mime] = newCount[portal][mime];
        });
      });

      previousTimestamp.value = timestamp;
    }
    // else {
    //   console.log('THERE');
    //   changeCountByRange(timestamp);
    // }
  }

  async function getAllEventsBefore (timestamp: number) {
    const db = await useIndexedDBStore().getDB();
    return new Promise(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');

      const range = IDBKeyRange.upperBound(timestamp, true);

      const results = [];
      index.openCursor(range).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value.log);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  async function getAllEventsAfter (timestamp: number) {
    const db = await useIndexedDBStore().getDB();
    return new Promise(resolve => {
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const index = store.index('by_date');

      const range = IDBKeyRange.lowerBound(timestamp, true);

      const results = [];
      index.openCursor(range).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value.log);
          cursor.continue();
        } else {
          resolve(results)
        }
      };
    });
  }

  async function getCurrentEventCountFromCompleteCount (timestamp: number) {
    const eventsAfterCount = {};
    putEventsInCountObject(await getAllEventsAfter(timestamp), eventsAfterCount);
    const newCount = {};
    const portalNames = (await usePortalsStore().getPortals()).map(portal => portal.name.toUpperCase());
    const mimeNames = (await useMimesStore().getMimes()).map(mime => mime.name.toUpperCase());

    portalNames.forEach(portal => {
      mimeNames.forEach(mime => {
        if (!newCount[portal]) newCount[portal] = {};
        if (!completeCount.value[portal][mime]) newCount[portal][mime] = 0;
        else newCount[portal][mime] = completeCount.value[portal][mime] - (eventsAfterCount[portal] ? eventsAfterCount[portal][mime] : 0);
      })
    })
    return newCount;
  }

  watch(timer, () => {
    if (usePlayStateStore().state !== PlayState.PLAYING && usePlayStateStore().state !== PlayState.PAUSED) return;
    updateTimer(timer.value)
  });

  emitter.on('play', async () => {
    console.log(useTimerStore().timer);
    previousTimestamp.value = useTimerStore().timer;
    if (!Object.keys(completeCount.value).length) completeCount.value = await getCompleteCount();
    updateTimer(timer.value);
  });

  return { getCountOfPortal, getCountOfMime, getTotalCount, getCountOfPortalAndMime, getMimeInPortal };
});
