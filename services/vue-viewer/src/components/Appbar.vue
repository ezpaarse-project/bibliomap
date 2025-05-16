<template>
  <v-app-bar v-if="props.include" elevation="5" height="48">
    <div class="app-bar-content">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="toggleDrawer"
      />
      <div>
        <v-tooltip location="bottom" :text="t('appbar.tooltips.center-map')">
          <template #activator="{ props: centerMapProps }">
            <v-btn icon="mdi-target" v-bind="centerMapProps" @click="centerMap" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('appbar.tooltips.translation')">
          <template #activator="{ props: tooltipProps }">
            <v-menu
              v-model="translationMenu"
              :close-on-content-click="false"
              offset-y
            >
              <template #activator="{ props: translationMenuProps }">
                <v-btn
                  v-bind="{ ...translationMenuProps, ...tooltipProps }"
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
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('appbar.tooltips.change-map')">
          <template #activator="{ props: tooltipProps }">
            <v-menu
              v-model="mapMenu"
              :close-on-content-click="false"
              offset-y
            >
              <template #activator="{ props: mapMenuProps }">
                <v-btn
                  v-bind="{ ...mapMenuProps, ...tooltipProps }"
                  icon="mdi-map"
                />
              </template>

              <v-list>
                <v-list-item
                  v-for="(map, index) in ['Default', 'Humanitarian OSM', 'OpenTopoMap', 'CyclOSM']"
                  :key="index"
                  @click="changeMapType(map)"
                >
                  <v-list-item-title>{{ map }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('appbar.tooltips.settings')">
          <template #activator="{ props: settingsProps }">
            <v-btn icon="mdi-cog" v-bind="settingsProps" @click="emitter.emit('showSettings', null)" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('appbar.tooltips.info')">
          <template #activator="{ props: infoProps }">
            <v-btn icon="mdi-information" v-bind="infoProps" @click="emitter.emit('showInfoDialog', null)" />
          </template>
        </v-tooltip>
      </div>

    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const props = config.appbarParams;
  const { t, locale } = useI18n();
  const emitter = useMitt();

  const translationMenu = ref(false);
  const mapMenu = ref(false);

  function toggleDrawer () {
    emitter.emit('toggleDrawer', null);
  }

  function selectLanguage (lang: string) {
    locale.value = lang.toLowerCase();
    translationMenu.value = false
  }


  const centerMap = () => {
    emitter.emit('centerMap', null);
  }

  const changeMapType = (layerName: string) => {
    emitter.emit('changeMapType', layerName);
    mapMenu.value = false;
  }
</script>
