<template>
  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    style="max-width: 100vw;"
    :width="width"
  >
    <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
    <DialogContent />
  </v-navigation-drawer>
</template>

<script setup lang="ts">

  import { useViewerConfigStore } from '@/stores/viewer-config';

  const config = useViewerConfigStore().config;

  const instance = getCurrentInstance();
  const emitter = instance ? instance.appContext.config.globalProperties.emitter : null;
  emitter.on('showInfoDialog', () => {
    drawer.value = true
  })

  const props = config.dialogDrawerParams;
  console.log('props', props);
  const include = !(!props || props.include === false);
  const usingPhone = window.innerWidth <= 768;
  const drawer = ref(!usingPhone);
  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;
  const width = Math.min(600, window.innerWidth);
</script>
