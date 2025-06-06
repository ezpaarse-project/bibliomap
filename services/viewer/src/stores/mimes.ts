export const useMimesStore = defineStore('mimes', () => {
  const mimes = [];

  function getRandomHexColor () {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
  }

  function getAllMimeNames () {
    return Object.keys(mimes);
  }

  function appendMime (name: string) {
    mimes.push({ name, color: getRandomHexColor() });
  }

  function getMimeColor (name: string) {
    return mimes.filter(m => m.color === name);
  }

  return { mimes, appendMime, getAllMimeNames, getMimeColor };
})
