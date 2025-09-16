import { defineStore } from 'pinia';
import initConfig from '@/assets/config.json'

export const useConfigStore = defineStore('viewer-config', () => {
  const copyConfig = JSON.parse(JSON.stringify(initConfig));
  const config = ref<typeof initConfig>(copyConfig);

  return { config };
});
