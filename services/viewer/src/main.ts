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

import './assets/styles.scss'

export type Log = {
  [key: string]: string | number | undefined,
  datetime: string,
  publication_title?: string,
  'geoip-latitude': number,
  'geoip-longitude': number,
  mime?: string,
  rtype?: string,
  platform_name?: string
}

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
