import { useIndexedDBStore } from './indexed-db';
import type { EC } from './ec-count';
import { usePlayStateStore } from './play-state';
import { usePlayerFileStore } from './player-file';
import { useViewerConfigStore } from './viewer-config';

export type Field = {
  name: string;
  color: string;
};

export const useSortFieldStore = defineStore('sort-field', () => {
  const { files } = storeToRefs(usePlayerFileStore());
  const fields = ref([] as Field[]);
  const { db } = storeToRefs(useIndexedDBStore());
  const fieldIdentifier = ref('');
  const headers = ref([] as string[]);

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

  function djb2Hash (str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Convert to unsigned 32-bit integer
  }

  function stringToColor (str: string) {
    const hash = djb2Hash(str);

    const hue = Math.abs(hash) % 360;
    const saturation = 70 + (Math.abs(hash) % 30);
    const lightness = 50 + (Math.abs(hash) % 10);

    return hslToHex(hue, saturation, lightness);
  }

  function setFields () {
    return new Promise<void>(resolve => {
      if (!db.value) {
        resolve();
        return;
      }
      usePlayStateStore().loading();
      const tx = db.value.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll();

      request.onsuccess = event => {
        const target = event.target as IDBRequest<EC[]>;
        if (!target) return;
        const allEvents = target.result;

        const fieldNames = new Set(
          allEvents
            .filter(event => event?.log?.['geoip-latitude'] && event?.log?.['geoip-longitude'])
            .flatMap(event => {
              const log = event?.log;
              const value = fieldIdentifier.value;
              if (log && value && typeof log[value] === 'string') {
                return log[value]
                  .split('+')
                  .map(name => name.toUpperCase());
              }
              return [];
            })
            .filter(name => typeof name === 'string')
        );

        fields.value = Array.from(fieldNames).map(fieldName => ({
          name: fieldName,
          color: stringToColor(fieldName),
        })).sort((a, b) => a.name.localeCompare(b.name));

        usePlayStateStore().loaded();
        useViewerConfigStore().config.drawerParams.portalSection.portals = fields.value;
        resolve()
      };
    });
  }

  async function findFieldIdentifier () {
    usePlayStateStore().loading();
    const count = await getHeaderCount();
    if (!count) {
      usePlayStateStore().loaded();
      return ;
    }
    let ii = 0;
    while (fieldIdentifier.value === ''){
      for(let i = 0; i < Object.keys(count).length; i++) {
        const countOfMimeInPortal = count[Object.keys(count)[i]];
        if (countOfMimeInPortal > 1 && countOfMimeInPortal < 50 + ii) {
          fieldIdentifier.value = Object.keys(count)[i];
          break;
        }
      }
      ii += 2;
    }
    usePlayStateStore().loaded();
  }

  function getHeaders () {
    if (!db.value) return ;
    return new Promise<void>(resolve => {
      if (!db.value) {
        headers.value = [];
        resolve();
        return;
      }
      const tx = db.value.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const cursorRequest = store.openCursor();
      cursorRequest.onsuccess = function (event) {
        const target = event.target as IDBRequest;
        if (!target) {
          headers.value = [];
          resolve()
          return ;
        }
        const cursor = target.result;
        if (!cursor) {
          headers.value = [];
          resolve();
          return ;
        }
        headers.value = Object.keys(cursor.value.log).sort() as string[];
        resolve();
      };
    });
  }

  async function getHeaderCount () {
    if (!db.value) return;
    await getHeaders();
    if (!headers.value) return null;

    const headersCount: { [key: string]: number } = {};
    const headersSets: { [key: string]: Set<string> } = {};
    headers.value.forEach(header => {
      headersCount[header] = 0;
      headersSets[header] = new Set();
    });

    return new Promise<{ [key: string]: number }>(resolve => {
      if (!db.value) {
        resolve({});
        return;
      }

      const tx = db.value.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = function (event) {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const value = cursor.value.log;
          headers.value.forEach(header => {
            if (value.hasOwnProperty(header)) {
              value[header].split('+').forEach((f: string) => {
                const splitValue = f.length ? f.toUpperCase() : 'UNKNOWN';
                if (!headersSets[header].has(splitValue)){
                  headersCount[header]++;
                  headersSets[header].add(splitValue);
                }
              });
            }
          });
          cursor.continue();
        } else {
          resolve(headersCount);
        }
      };
    });
  }

  function getFieldColor (fieldName: string) {
    const field = fields.value.find(field => field.name.toUpperCase() === fieldName.toUpperCase());
    return field?.color;
  }

  watch(files, async () => {
    await findFieldIdentifier();
    setFields();
  })

  return { fields, getFieldColor, fieldIdentifier, headers };
})
