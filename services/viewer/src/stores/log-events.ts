import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useViewerConfigStore } from './viewer-config';
import useMitt from '@/composables/useMitt';
import { usePlatformFilterStore } from './platform-filter';

const emitter = useMitt();

export const useLogEventsStore = defineStore('log-events', () => {
  const count = reactive({} as Record<string, Record<string, number>>);
  const filter = usePlatformFilterStore().filter;

  const config = useViewerConfigStore().config
  const portals = config.drawerParams.portalSection.portals.map(portal => portal.name.toUpperCase());

  portals.forEach(portal => {
    count[portal] = {};
  });

  function increment (portal: string, mime: string) {
    if (!count[portal]) return;
    if (!count[portal][mime]) count[portal][mime] = 0;
    count[portal][mime] += 1;
  }

  function reset () {
    Object.keys(count).forEach(portal => {
      count[portal] = {};
    });
  }

  const socketStore = useSocketStore();
  const io = socketStore.socket;

  io.on('log', log => {
    if (!log.mime) return;
    if (filter && log.platform_name && !((filter.toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(filter.toUpperCase())))) return;
    emitter.emit('log', log);
    increment(log.ezproxyName.toUpperCase(), log.mime);
  });

  io.on('reset', () => {
    reset();
  });

  return { count };
});
