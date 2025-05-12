<template>
  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    width="600"
  >
    <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
    <DialogContent />
  </v-navigation-drawer>
</template>

<script setup lang="ts">

  import config from '@/assets/config.json';

  const props = config.dialogDrawerParams;
  console.log('props', props);
  const include = !(!props || props.include === false);
  const usingPhone = window.innerWidth <= 768;
  const drawer = ref(!usingPhone);
  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;
</script>
