<template>
  <v-app>
    <v-main>
      <Drawer />
      <InformationDrawer />
      <SettingsDialog />
      <v-row align="start" class="pa-0" justify="space-between">
        <v-col class="ma-4" cols="auto" style="z-index: 1000;">
          <StateCard />
        </v-col>
        <v-col cols="auto">
          <Minimap class="ma-6" style="z-index: 1000;" />
        </v-col>
      </v-row>

      <v-row align="end" class="pa-0" justify="end" style="height: 40vh;">
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
  import Drawer from '@/components/Drawer.vue';
  import WorldMap from '@/components/WorldMap.vue';
</script>

<style>
html {
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
