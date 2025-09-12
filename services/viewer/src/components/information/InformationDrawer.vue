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

      <div class="d-flex justify-end align-start my-2">
        <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
        <p
          class="text-h4 mt-4 mr-10 justify-center title-font bold"
          style="white-space: normal; overflow: visible; text-align: center;"
        >
          {{ t('info-card.title') }}
        </p>
      </div>
      <div class="d-flex justify-between align-start my-2">
        <InformationContent />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">

  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';
  import { useConfigStore } from '@/stores/config';
  import { useRoute } from 'vue-router';

  const { t } = useI18n();

  const config = useConfigStore().config;
  const infoDrawer = ref<HTMLElement | null>(null);

  const emitter = useMitt();
  emitter.on('showInfoDialog', () => {
    drawer.value = true;
  });

  const route = useRoute();

  const props = config.dialogDrawerParams;
  const include = !(!props || props.include === false);
  const usingPhone = window.innerWidth <= 768;
  const drawer = ref(!usingPhone);
  const drawerLocation = (props.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;
  const width = Math.min(400, window.innerWidth);

  onMounted(() => {
    /*
      This code is used for Expo mode.
      Expo mode is a way to display the information drawer for a certain amount of time.
      To activate expo mode, you need to pass a query parameter to the URL.
      Mode information in viewer README file.
    */
    const expoParam = route.query.expo as string || route.query.e as string;
    const eParamRaw = route.fullPath.includes('?e') || route.fullPath.includes('&e');
    const intervals = expoParam ? expoParam.split(',').map(s => parseInt(s, 10)) : eParamRaw ? [1 * 60, 10 * 60] : null;
    if (!intervals) return;
    showDrawerInterval(intervals);
  });

  function showDrawerInterval (t: (number)[]){
    drawer.value = true;
    const shownTime = t[0]

    setTimeout(() => {
      if(infoDrawer.value === null) return;
      scrollToBottom();
    }, (shownTime/2)*1000);

    setTimeout(() => {
      hideDrawerInterval(t);
    }, shownTime*1000);
  }

  function hideDrawerInterval (t: (number)[]){
    if(infoDrawer.value === null) return;
    const hiddenTime = t[1];
    drawer.value = false;
    scrollToTop();
    setTimeout(() => {
      showDrawerInterval(t);
    }, hiddenTime*1000);
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
