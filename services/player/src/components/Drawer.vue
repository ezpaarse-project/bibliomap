<template>
  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    :width="props.width"
  >
    <div class="drawer-elements-container d-flex flex-column fill-height">

      <div>
        <Player />
        <v-divider />
      </div>

      <div v-if="state !== PlayState.LOADING && files.length > 0">
        <Timer />
        <v-divider />
      </div>

      <div v-if="props.counterSection.include && state !== PlayState.LOADING && files.length > 0">
        <Counter />
        <v-divider />
      </div>

      <div v-if="props.portalSection.include && state !== PlayState.LOADING && files.length > 0">
        <Portals />
      </div>

      <div v-if="state === PlayState.LOADING" class="d-flex align-center justify-center mt-8">
        <v-progress-circular indeterminate size="74" />
      </div>

      <div class="mt-auto">
        <VersionCard />
      </div>

    </div>
  </v-navigation-drawer>
</template>


<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import useMitt from '@/composables/useMitt';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { usePlayerFileStore } from '@/stores/player-file';

  const config = useViewerConfigStore().config;
  const props = config.drawerParams;
  const emitter = useMitt();
  const { state } = storeToRefs(usePlayStateStore());
  const { files } = storeToRefs(usePlayerFileStore());

  const include = !(!props || props.include === false);

  const usingPhone = window.innerWidth <= 768;

  const drawer = ref(!usingPhone);
  const group = ref(null);

  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;

  watch(group, () => {
    drawer.value = false
  })

  emitter.on('toggleDrawer', () => {
    drawer.value = !drawer.value;
  });
</script>
<style lang="scss">
  .drawer-elements-container{
    display: flex;
    flex-direction: column;
  }
</style>
