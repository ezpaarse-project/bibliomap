export const usePortalsStore = defineStore('portals', () => {
  const portals = [];

  function getRandomHexColor () {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
  }

  function getAllPortalNames () {
    return portals.map(p => p.name);
  }

  function appendPortal (name: string) {
    portals.push({ name, color: getRandomHexColor() });
  }

  function getPortalColor (name: string) {
    return portals.filter(p => p.name === name);
  }

  return { portals, appendPortal, getPortalColor, getAllPortalNames };
})
