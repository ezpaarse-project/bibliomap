import { defineStore } from 'pinia';
import initConfig from '@/assets/config.json'

export const useViewerConfigStore = defineStore('viewer-config', {
  state: () => ({
    config: initConfig,
  }),
});
