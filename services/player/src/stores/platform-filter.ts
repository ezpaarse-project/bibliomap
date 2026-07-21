import { defineStore } from 'pinia';

export const usePlatformFilterStore = defineStore('platform-filter', () => {
  const filter = ref<string[]>([]);

  function setFilter (newFilter: string[]) {
    filter.value = newFilter.map(f => f.toUpperCase());
  }

  function getFilter () {
    return filter.value;
  }

  return {
    filter,
    setFilter,
    getFilter,
  };
});
