import { useIndexedDBStore } from './indexed-db';
import type { EC } from './ec-count';
import { usePlayStateStore } from './play-state';
import { usePlayerFileStore } from './player-file';

export type Portal = {
  name: string;
  color: string;
};

export const usePortalsStore = defineStore('portals', () => {
  const { files } = storeToRefs(usePlayerFileStore());
  const portals = ref([] as Portal[]);

  function hslToHex (h: number, s: number, l: number) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r: number, g: number, b: number;

    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (val: number) => val.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function stringToColor (str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }

    const hue = Math.abs(hash) % 360;
    const saturation = 70 + (Math.abs(hash) % 30);
    const lightness = 50 + (Math.abs(hash) % 10);

    return hslToHex(hue, saturation, lightness);
  }

  async function setPortals () {
    const db = await useIndexedDBStore().getDB();
    if (!db) return ;
    return new Promise<void>(resolve => {
      usePlayStateStore().loading();
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll();

      request.onsuccess = event => {
        const target = event.target as IDBRequest<EC[]>;
        if (!target) return;
        const allEvents = target.result;

        const ezproxyNames = new Set(
          allEvents
            .map(event => event?.log?.ezproxyName.split('+'))
            .flat()
            .map(name => name.toUpperCase())
            .filter(name => typeof name === 'string')
            .filter(name => !name.includes('.'))
        );

        portals.value = Array.from(ezproxyNames).map(portalName => ({
          name: portalName,
          color: stringToColor(portalName),
        })).sort((a, b) => a.name.localeCompare(b.name));

        usePlayStateStore().stop();
        resolve()
      };
    })
  }

  async function getPortals () {
    if (!portals.value) return [];
    if (portals.value.length === 0) {
      await setPortals();
    }
    return portals.value;
  }

  function getPortalColor (portalName: string) {
    const portal = portals.value.find(portal => portal.name.toUpperCase() === portalName.toUpperCase());
    return portal?.color;
  }

  watch(files, () => { portals.value = [] })

  return { getPortals, getPortalColor };
})
