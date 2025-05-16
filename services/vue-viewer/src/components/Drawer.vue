<template>
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
            <span>{{ t('drawer-custom.description') }}</span>
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
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const config = useViewerConfigStore().config;
  const props = config.drawerParams;
  const { t } = useI18n();
  const emitter = useMitt();

  const include = !(!props || props.include === false);

  const usingPhone = window.innerWidth <= 768;

  const drawer = ref(!usingPhone);
  const group = ref(null);

  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;

  watch(group, () => {
    drawer.value = false
  })

  const getIconUrl = (iconName: string): string => {
    return new URL(`../assets/${iconName}`, import.meta.url).href;
  };

  emitter.on('toggleDrawer', () => {
    drawer.value = !drawer.value;
  });
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
      max-height: 128px;
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
