<template>
  <div>
    <v-menu
      v-model="translationMenu"
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{ props: translationMenuProps }">
        <v-btn
          v-tooltip="{text: t('fab.tooltips.translation'), location: 'left'}"
          color="purple"
          v-bind="{ ...translationMenuProps }"
          icon
          @click="selectLanguage()"
        >
          {{ locale }}
        </v-btn>
      </template>
    </v-menu>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n();
  const translationMenu = ref(false);

  function selectLanguage () {
    const lang = locale.value === 'en' ? 'fr' : 'en';
    locale.value = lang;
    translationMenu.value = false;
  }
</script>
