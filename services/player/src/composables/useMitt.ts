import type { Log } from '@/main';
import mitt from 'mitt';

type Events = {
  centerMap: null;
  changeMapType: string;
  minimap: { log: Log };
  showInfoDialog: null;
  showSettings: null;
  toggleDrawer: null;
  log: Log;
  EC: Log;
  resetFileField: null;
  filesLoaded: null;
  eventClicked: Record<string, unknown>;
};

const emitter = mitt<Events>();

export default function useMitt (){
  return emitter;
}
