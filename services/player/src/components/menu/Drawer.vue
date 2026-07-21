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
      <div class="d-flex justify-end align-start my-2">
        <p class="text-h6 mt-2">
          {{ t('drawer.player.title') }}
        </p>
        <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
      </div>

      <div>
        <v-card-text>
          {{ t('drawer.player.choose-file') }}
        </v-card-text>
        <FileInput />
        <v-divider />
      </div>

      <div v-if="state !== PlayState.LOADING && files.length > 0">
        <Chronometer />
        <Timer />
        <MultiplierTab />
        <v-divider />
      </div>

      <div v-if="props.counterSection.include && state !== PlayState.LOADING && files.length > 0">
        <MimeCounter />
        <v-divider />
      </div>

      <div v-if="props.portalSection.include && state !== PlayState.LOADING && files.length > 0">
        <PortalsCounter />
      </div>

      <div v-if="state === PlayState.LOADING" class="d-flex align-center justify-center mt-8">
        <v-progress-circular indeterminate size="74" />
      </div>

    </div>
  </v-navigation-drawer>
</template>


<script setup lang="ts">
  import MultiplierTab from '@/components/menu/MultiplierTab.vue';
  import Chronometer from '@/components/menu/Chronometer.vue';

  import { useConfigStore } from '@/stores/config';
  import useMitt from '@/composables/useMitt';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { usePlayerFileStore } from '@/stores/player-file';
  import { useI18n } from 'vue-i18n';


  const { t } = useI18n();

  const config = useConfigStore().config;
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

  emitter.on('showCounterDrawer', () => {
    drawer.value = true;
  });
</script>

<style lang="scss">
  .drawer-elements-container{
    display: flex;
    flex-direction: column;
  }
</style>
