<template>
  <v-navigation-drawer
    v-model="drawer"
    elevation="5"
    :location="drawerLocation"
    :permanent="true"
    :width="props.width"
  >
    <div>
      <div class="d-flex justify-end align-start my-2">
        <Description v-if="props.descriptionSection.include" />
        <v-btn :flat="true" icon="mdi-close" @click.stop="drawer = false" />
      </div>
      <v-divider />
      <div v-if="props.timerSection.include" :style="{ order: props.timerSection.index }">
        <Timer />
      </div>
      <div v-if="props.counterSection.include" :style="{ order: props.counterSection.index }">
        <MimeList />
        <v-divider />
      </div>
      <div v-if="props.portalSection.include" :style="{ order: props.portalSection.index }">
        <PortalList />
      </div>
      <div v-if="replayMode && props.replayDescription.include" :style="{ order: props.replayDescription.index }">
        <ReplayDescription />
        <v-divider />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { useConfigStore } from '@/stores/config';
  import Timer from '@/components/counter/timers/Timer.vue';
  import MimeList from '@/components/counter/MimeList.vue';
  import PortalList from '@/components/counter/PortalList.vue';
  import useMitt from '@/composables/useMitt';

  const replayMode = import.meta.env.VITE_REPLAY_MODE === 'true';
  const config = useConfigStore().config;
  const props = config.drawerParams;
  const emitter = useMitt();
  emitter.on('showCounterDrawer', () => {
    drawer.value = true;
  });

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
