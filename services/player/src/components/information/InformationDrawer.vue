<template>
  <v-navigation-drawer v-if="include" v-model="drawer" elevation="5" :location="drawerLocation" :permanent="true"
    style="max-width: 100vw;" :width="width">
    <div ref="infoDrawer" style="height: 100%; overflow-y: auto;">
      <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
      <v-card :flat="true" style="text-align: justify;">
        <v-card-title>
          <h1 class="mb-4">BiblioMap Player</h1>
        </v-card-title>
        <v-card-text>
          {{ t('info.text1') }}
        </v-card-text>

        <v-card-text>
          {{ t('info.text2') }}
        </v-card-text>

        <v-card-text>
          {{ t('info.text3') }}
        </v-card-text>

        <v-card-title>{{ t('info.rule1') }}</v-card-title>

        <v-card-text>
          {{ t('info.rule2') }}
        </v-card-text>

        <v-card-text>
          <i18n-t keypath="info.rule3.text">
            <template #link>
              <a href="https://ezpaarse-project.github.io/ezpaarse/middlewares/geolocalizer/README.html" target="_blank"
                rel="noopener noreferrer">
                {{ t('info.rule3.link') }}
              </a>
            </template>
          </i18n-t>
        </v-card-text>

        <ExempleFile />
      </v-card>
    </div>
      <div class="text-center ma-2">
        <GitHubButton />
      </div>
      <v-row justify="center">
        <v-col cols="auto">
          <a href="https://www.inist.fr/" target="_blank"><img id="inist-logo" alt="CNRS" src="@/assets/logo-inist.png"
              style="max-width: 120px; max-height: 120px;"></a>
        </v-col>
      </v-row>
  </v-navigation-drawer>
</template>

<script setup lang="ts">

import GitHubButton from '@/components/information/GitHubButton.vue';
import ExempleFile from '@/components/information/ExempleFile.vue';
import useMitt from '@/composables/useMitt';
import { useConfigStore } from '@/stores/config';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const config = useConfigStore().config;
const infoDrawer = ref<HTMLElement | null>(null);

const emitter = useMitt();
emitter.on('showInfoDialog', () => {
  drawer.value = true;
});

const route = useRoute();

const dialogDrawerParams = config.dialogDrawerParams;
const include = !(!dialogDrawerParams || dialogDrawerParams.include === false);
const drawer = ref(true);
const drawerLocation = (dialogDrawerParams.position ?? 'left') as 'left' | 'top' | 'bottom' | 'start' | 'end' | 'right' | undefined;
const width = Math.min(450, window.innerWidth);

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

function showDrawerInterval(t: (number)[]) {
  drawer.value = true;
  const shownTime = t[0]

  setTimeout(() => {
    if (infoDrawer.value === null) return;
    scrollToBottom();
  }, (shownTime / 2) * 1000);

  setTimeout(() => {
    hideDrawerInterval(t);
  }, shownTime * 1000);
}

function hideDrawerInterval(t: (number)[]) {
  if (infoDrawer.value === null) return;
  const hiddenTime = t[1];
  drawer.value = false;
  scrollToTop();
  setTimeout(() => {
    showDrawerInterval(t);
  }, hiddenTime * 1000);
}

function scrollToBottom() {
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

function scrollToTop() {
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
