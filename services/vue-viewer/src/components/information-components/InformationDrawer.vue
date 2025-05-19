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
    <div ref="infoDrawer" style="height: 100%; overflow-y: auto;">
      <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
      <InformationContent />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">

  import useMitt from '@/composables/useMitt';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useRoute } from 'vue-router';

  const config = useViewerConfigStore().config;
  const infoDrawer = ref<HTMLElement | null>(null);

  const emitter = useMitt();
  emitter.on('showInfoDialog', () => {
    drawer.value = true;
  });

  const route = useRoute();

  const props = config.dialogDrawerParams;
  console.log('props', props);
  const include = !(!props || props.include === false);
  const usingPhone = window.innerWidth <= 768;
  const drawer = ref(!usingPhone);
  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;
  const width = Math.min(600, window.innerWidth);

  onMounted(() => {
    const expoParam = route.query.expo as string || route.query.e as string;
    const eParamRaw = route.fullPath.includes('?e') || route.fullPath.includes('&e');
    const intervals = expoParam ? expoParam.split(',').map(s => parseInt(s, 10)) : eParamRaw ? [1 * 60, 10 * 60] : null;
    if (!intervals) return;
    showDrawerInterval(intervals);
  });

  function showDrawerInterval (t: (number)[]){
    drawer.value = true;

    setTimeout(() => {
      if(infoDrawer.value === null) return;
      scrollToBottom();
    }, (t[0]/2)*1000);

    setTimeout(() => {
      hideDrawerInterval(t);
    }, t[0]*1000);
  }

  function hideDrawerInterval (t: (number)[]){
    if(infoDrawer.value === null) return;
    drawer.value = false;
    scrollToTop();
    setTimeout(() => {
      showDrawerInterval(t);
    }, t[1]*1000);
  }

  function scrollToBottom () {
    nextTick(() => {
      const el = infoDrawer.value;
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }

  function scrollToTop () {
    nextTick(() => {
      const el = infoDrawer.value;
      if (el) {
        el.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    });
  }
</script>
