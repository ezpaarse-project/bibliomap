/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import pinia from '@/stores'
import router from '@/router'

import vuetify from './vuetify'
import i18n from './i18n'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(i18n)
}
