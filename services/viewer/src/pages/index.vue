<template>
  <v-app>
    <v-main>
      <Drawer />
      <InformationDrawer />
      <SettingsDialog />
      <v-row align="start" class="pa-0" justify="space-between">
        <v-col class="ma-4" cols="auto" style="z-index: 1000;">
          <ModeCard />
        </v-col>
        <v-col cols="auto">
          <Minimap style="z-index: 1000;" class="ma-6" />
        </v-col>
      </v-row>

      <v-row align="end" class="pa-0" justify="end" style="height: 64vh;">
        <v-col class="mr-4 pa-0" cols="auto" style="z-index: 1000;">
          <VersionCard />
        </v-col>
        <v-col class="mr-6 pa-0" cols="auto" style="z-index: 1000;">
          <FabButton />
        </v-col>
      </v-row>
    </v-main>
    <v-container />
    <WorldMap style="z-index: 0;" />
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import Drawer from '@/components/CounterDrawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
  import { useSocketStore } from '@/stores/socket';
  import { type ReplayConfig, useReplayConfigStore } from '@/stores/replay-config';

  const socket = useSocketStore().socket;
  const replayConfigStore = useReplayConfigStore();

  onMounted(() => {
    socket.on('connect', async () => {
      console.log('Enricher connected');
      replayConfigStore.setConfig(await replayConfigStore.fetchReplayConfig() as ReplayConfig);
    });
  })

  onUnmounted(() => {
    socket.off();
  })

</script>
