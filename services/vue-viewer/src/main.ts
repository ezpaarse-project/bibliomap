/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

import mitt from 'mitt';
import L from 'leaflet';

export type Log = {
  datetime: string,
  url?: string,
  domain?: string,
  publication_title?: string,
  ezproxyName: string,
  'geoip-latitude': number,
  'geoip-longitude': number,
  mime?: string,
  platform_name: string | null | undefined,
  rtype?: string,
}

type Events = {
  centerMap: null;
  changeMapType: string;
  minimap: { log: Log; bubble: L.DivIcon };
  showInfoDialog: null;
  showSettings: null;
};
const emitter = mitt<Events>();

const app = createApp(App)
app.config.globalProperties.emitter = emitter;

registerPlugins(app)

app.mount('#app')
