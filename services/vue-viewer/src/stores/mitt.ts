// stores/mittStore.ts
import { defineStore } from 'pinia';
import mitt from 'mitt';
import L from 'leaflet';
import type { Log } from '@/pages/index.vue';

type Events = {
  centerMap: null;
  changeMapType: string;
  minimap: { log: Log; bubble: L.DivIcon };
  showInfoDialog: null;
};

export const useMittStore = defineStore('mitt', () => {
  const emitter = mitt<Events>();

  return { emitter };
});
