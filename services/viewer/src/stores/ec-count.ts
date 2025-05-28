import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useViewerConfigStore } from './viewer-config';
import { usePlatformFilterStore } from './platform-filter';

export const useEcCountStore = defineStore('ec-count', () => {
  const count = reactive({} as Record<string, Record<string, number>>);
  const filter = usePlatformFilterStore().filter;

  const config = useViewerConfigStore().config;
  const portals = config.drawerParams.portalSection.portals.map(portal => portal.name);

  portals.forEach(portal => {
    count[portal.toUpperCase()] = {};
  });

  function increment (portal: string, mime: string) {
    if (!count[portal]) return;
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
    return Object.values(count).reduce((a, b) => a + b[mime], 0);
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

  function isPortalInCount (portal: string) {
    return Object.keys(count).includes(portal);
  }

  const socketStore = useSocketStore();
  const io = socketStore.socket;

  io.on('log', log => {
    if (filter && log.platform_name && !((filter.toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(filter.toUpperCase())))) return;
    log.ezproxyName.split('+').forEach((portal: string) => {
      increment(portal.toUpperCase(), log.mime || 'unknown');
    })
  });

  io.on('reset', () => {
    reset();
  });

  return { getCountOfPortal, getCountOfMime, getTotalCount, getCountOfPortalAndMime, isPortalInCount, getMimeInPortal };
});
