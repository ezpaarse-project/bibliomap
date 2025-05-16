import { createI18n } from 'vue-i18n';
import globalEn from './locales/global/en.json'
import globalFr from './locales/global/fr.json'
import customEn from './locales/custom/en.json'
import customFr from './locales/custom/fr.json'

export const i18n = createI18n({
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr: { ...globalFr, ...customFr }, en: { ...globalEn, ...customEn } },
});

export default i18n;
