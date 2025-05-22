import { defineStore } from 'pinia';

export const usePlatformFilterStore = defineStore('platform-filter', () => {
  const filter = ref('');

  function setFilter (newFilter: string) {
    filter.value = newFilter;
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
