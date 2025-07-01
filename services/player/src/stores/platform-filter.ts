import { defineStore } from 'pinia';

export const usePlatformFilterStore = defineStore('platform-filter', () => {
  const filter = ref('');

  function isNameOkay (name: string) {
    return !filter.value || (filter.value && name && (filter.value.toUpperCase().includes(name.toUpperCase()) || name.toUpperCase().includes(filter.value.toUpperCase())));
  }

  return {
    filter,
    isNameOkay,
  };
});
