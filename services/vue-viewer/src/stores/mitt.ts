// stores/mittStore.ts
import { defineStore } from 'pinia';
import mitt from 'mitt';

type Events = {
  centerMap: null;
};

export const useMittStore = defineStore('mitt', () => {
  const emitter = mitt<Events>();

  return { emitter };
});
