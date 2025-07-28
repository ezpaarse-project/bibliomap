import type { Log } from '@/main';
import mitt from 'mitt';
import L from 'leaflet';

type Events = {
  centerMap: null;
  changeMapType: string;
  showCounterDrawer: null;
  minimap: { log: Log; showEvent: (log: Log, map: L.Map) => void };
  showInfoDialog: null;
  showSettings: null;
  toggleDrawer: null;
  log: Log;
};

const emitter = mitt<Events>();

export default function useMitt (){
  return emitter;
}
