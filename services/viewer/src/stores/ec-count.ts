import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { usePlatformFilterStore } from './platform-filter';
import { usePortalsStore } from '@/stores/portals.ts';
import { useMimesStore } from '@/stores/mimes.ts';

export const useEcCountStore = defineStore('ec-count', () => {
  const count = reactive({} as Record<string, Record<string, number>>);
  const filter = usePlatformFilterStore().filter;

  const portalsStore = usePortalsStore();
  const mimesStore = useMimesStore();

  function increment (portal: string, mime: string) {
    if (!portalsStore.getAllPortalNames().includes(portal)) {
      portalsStore.appendPortal(portal);
      count[portal] = {};
    }
    if (!mimesStore.getAllMimeNames().includes(mime)) {
      mimesStore.appendMime(mime);
    }
    if (!count[portal][mime]) count[portal][mime] = 0;
    count[portal][mime] += 1;
  }

  function reset () {
    Object.keys(count).forEach(portal => {
      count[portal.toUpperCase()] = {};
    });
  }

  function getCountOfPortal (portal: string) {
    return Object.values(count[portal]).reduce((a, b) => a + b, 0);
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
    return count[portal][mime];
  }

  function getMimeInPortal (portal: string) {
    return Object.keys(count[portal]);
  }

  const socketStore = useSocketStore();
  const socket = socketStore.socket;

  socket.on('log', log => {
    if (filter && log.platform_name && !((filter.toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(filter.toUpperCase())))) return;
    if (!log.ezproxyName) return;
    log.ezproxyName.split('+').forEach((portal: string) => {
      increment(portal.toUpperCase(), log.mime || 'unknown');
    })
  });

  socket.on('replayConfig', () => {
    reset();
  });

  return { getCountOfPortal, getCountOfMime, getTotalCount, getCountOfPortalAndMime, getMimeInPortal };
});
