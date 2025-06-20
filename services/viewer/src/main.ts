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

import i18n from './i18n'
import './assets/styles.scss'

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
  'bib-groups'?: string
}

const app = createApp(App)

registerPlugins(app)

app.use(i18n)

app.mount('#app')
