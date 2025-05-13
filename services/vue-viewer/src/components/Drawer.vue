<template>
  <v-app-bar v-if="config.appbarParams.include" elevation="5" height="48">
    <div class="app-bar-content">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
      />
      <div>
        <v-tooltip location="bottom" text="Centrer la carte">
          <template #activator="{ props: centerMapProps }">
            <v-btn icon="mdi-target" v-bind="centerMapProps" @click="centerMap" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" text="Traduction">
          <template #activator="{ props: translateProps }">
            <v-btn icon="mdi-translate" v-bind="translateProps" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" text="Changer le type de carte">
          <template #activator="{ props: mapTooltipProps }">
            <v-dialog max-width="600">
              <template #activator="{ props: mapDialogProps }">
                <v-btn icon="mdi-map" v-bind="{ ...mapTooltipProps, ...mapDialogProps }" />
              </template>
              <template #default="{ isActive }">
                <v-card title="Changer le type de carte">
                  <v-card-text>
                    Choisissez un type de carte.
                  </v-card-text>
                  <v-select
                    :key="selectedMapType"
                    v-model="selectedMapType"
                    :items="['Default', 'Humanitarian OSM', 'OpenTopoMap', 'CyclOSM']"
                    label="Type de carte"
                    @update:model-value="(value) => changeMapType(value)"
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn text="Fermer" @click="isActive.value = false" />
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" text="Autres paramètres">
          <template #activator="{ props: settingsProps }">
            <v-btn icon="mdi-cog" v-bind="settingsProps" @click="emitter.emit('showSettings', null)" />
          </template>
        </v-tooltip>

        <v-tooltip location="bottom" text="Montrer les informations">
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

  import { ref, watch } from 'vue'

  import config from '@/assets/config.json';
  import { useMittStore } from '@/stores/mitt';

  const props = config.drawerParams;

  const include = !(!props || props.include === false);
  const emitter = useMittStore().emitter;

  const usingPhone = window.innerWidth <= 768;

  const drawer = ref(!usingPhone);
  const group = ref(null)

  const selectedMapType = ref('Default');

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
