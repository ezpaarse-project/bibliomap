import type { Log } from '@/main';
import mitt from 'mitt';
import L from 'leaflet';

type Events = {
  centerMap: null;
  changeMapType: string;
  minimap: { log: Log; bubble: L.DivIcon };
  showInfoDialog: null;
  showSettings: null;
  toggleDrawer: null;
  log: Log;
  EC: Log;
  setMultiplier: number;
};

const emitter = mitt<Events>();

export default function useMitt (){
  return emitter;
}
