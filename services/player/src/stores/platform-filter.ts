import { defineStore } from 'pinia';

export const usePlatformFilterStore = defineStore('platform-filter', () => {
  const filter = ref('');

  function isNameOkay (name: string) {
    if (!filter.value) return true;
    if (!name) return false;

    const nameUpper = name.toUpperCase();
    const filterUpper = filter.value.toUpperCase();

    return filterUpper.includes(nameUpper) || nameUpper.includes(filterUpper);
  }

  return {
    filter,
    isNameOkay,
  };
});
