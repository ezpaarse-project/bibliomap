<template>
  <v-navigation-drawer
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    :width="props.width"
  >
    <div>
      <div class="d-flex justify-end">
        <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
      </div>
      <div v-if="props.descriptionSection.include" :style="{ order: props.descriptionSection.index }">
        <Description />
        <v-divider />
      </div>
      <div v-if="props.timerSection.include" :style="{ order: props.timerSection.index }">
        <Timer />
      </div>
      <div v-if="props.counterSection.include" :style="{ order: props.counterSection.index }">
        <Counter />
        <v-divider />
      </div>
      <div v-if="props.portalSection.include" :style="{ order: props.portalSection.index }">
        <Portals />
      </div>
      <div v-if="replayMode && props.replayDescription.include" :style="{ order: props.replayDescription.index }">
        <ReplayDescription />
        <v-divider />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import useMitt from '@/composables/useMitt';

  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
  const config = useViewerConfigStore().config;
  const props = config.drawerParams;
  const emitter = useMitt();
  emitter.on('showCounterDrawer', () => {
    drawer.value = true;
  });

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
