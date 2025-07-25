<template>
  <v-menu
    v-model="translationMenu"
    :close-on-content-click="false"
    offset-y
  >
    <template #activator="{ props: translationMenuProps }">
      <v-btn
        v-tooltip="{text: t('fabButton.tooltips.translation'), location: 'bottom'}"
        v-bind="{ ...translationMenuProps }"
        icon="mdi-translate"
      />
    </template>

    <v-list>
      <v-list-item
        v-for="(lang, index) in ['FR', 'EN']"
        :key="index"
        @click="selectLanguage(lang)"
      >
        <v-list-item-title>{{ lang }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n();
  const translationMenu = ref(false);

  function selectLanguage (lang: string) {
    locale.value = lang.toLowerCase();
    translationMenu.value = false
  }
</script>
