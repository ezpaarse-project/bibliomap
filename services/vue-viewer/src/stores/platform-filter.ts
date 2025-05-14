import { defineStore } from 'pinia';

export const usePlatformFilterStore = defineStore('platform-filter', {
  state: () => ({
    filter: '',
  }),
  actions: {
    setFilter (filter: string) {
      this.filter = filter;
    },
    getFilter () {
      return this.filter;
    },
  },
});
