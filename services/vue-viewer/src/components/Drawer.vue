<template>
  <v-app-bar v-if="config.appbarParams.include" elevation="5" height="48">
    <div class="app-bar-content">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
      />
      <div>
        <v-tooltip location="bottom" :text="t('drawer.tooltips.center-map')">
          <template #activator="{ props: centerMapProps }">
            <v-btn icon="mdi-target" v-bind="centerMapProps" @click="centerMap" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('drawer.tooltips.translation')">
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

        <v-tooltip location="bottom" :text="t('drawer.tooltips.change-map')">
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

        <v-tooltip location="bottom" :text="t('drawer.tooltips.settings')">
          <template #activator="{ props: settingsProps }">
            <v-btn icon="mdi-cog" v-bind="settingsProps" @click="emitter.emit('showSettings', null)" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" :text="t('drawer.tooltips.info')">
          <template #activator="{ props: infoProps }">
            <v-btn icon="mdi-information" v-bind="infoProps" @click="emitter.emit('showInfoDialog', null)" />
          </template>
        </v-tooltip>
      </div>

    </div>
  </v-app-bar>

  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    :width="props.width"
  >
    <div class="drawer-elements-container">
      <div v-if="props.descriptionSection.include" :style="{ order: props.descriptionSection.index }">
        <v-list-item>
          <div class="description-section-item">
            <img v-if="props.descriptionSection.icon" alt="icon" :src="getIconUrl(props.descriptionSection.icon)">
            <span>{{ props.descriptionSection.content }}</span>
          </div>
        </v-list-item>
        <v-divider />
      </div>
      <div v-if="props.timerSection.include" :style="{ order: props.timerSection.index }">
        <Timer />
        <v-divider />
      </div>
      <div v-if="props.counterSection.include" :style="{ order: props.counterSection.index }">
        <Counter />
        <v-divider />
      </div>
      <div v-if="props.portalSection.include" :style="{ order: props.portalSection.index }">
        <Portals />
        <v-divider />
      </div>
    </div>
  </v-navigation-drawer>
  <ModeCard v-if="!usingPhone || (usingPhone && !drawer)" />
</template>

<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const props = config.drawerParams;
  const { t, locale } = useI18n();

  const include = !(!props || props.include === false);
  const emitter = useMitt();

  const usingPhone = window.innerWidth <= 768;

  const drawer = ref(!usingPhone);
  const group = ref(null);

  const translationMenu = ref(false);
  const mapMenu = ref(false);

  function selectLanguage (lang: string) {
    locale.value = lang.toLowerCase();
    translationMenu.value = false
  }

  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;

  watch(group, () => {
    drawer.value = false
  })

  const getIconUrl = (iconName: string): string => {
    return new URL(`../assets/${iconName}`, import.meta.url).href;
  };

  const centerMap = () => {
    emitter.emit('centerMap', null);
  }

  const changeMapType = (layerName: string) => {
    emitter.emit('changeMapType', layerName);
    mapMenu.value = false;
  }

</script>
<style lang="scss">
  .drawer-elements-container{
    display: flex;
    flex-direction: column;
  }
  .description-section-item{
    display: flex;
    flex-direction: row;
    align-items: center;

    img{
      height: 100%;
      width: 100%;
      margin: .5rem;
    }

    span{
      text-align: center;
      font-size: 14px;
      margin: .5rem;
    }
  }

  .app-bar-content{
    width: 100%;
    padding: 0 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    div{
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
    }
  }
</style>
