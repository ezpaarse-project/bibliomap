import { defineStore } from 'pinia';
import initConfig from '@/assets/config.json'

export const useConfigStore = defineStore('viewer-config', () => {
  const config = ref(initConfig) as Ref<Record<string, any>>;

  return { config };
});
