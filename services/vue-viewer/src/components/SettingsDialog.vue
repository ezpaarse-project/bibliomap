<template>
  <v-dialog
    v-model="active"
    max-width="1000"
  >
    <v-card :flat="true">
      <v-card-title class="text-h4">Paramètres</v-card-title>
      <v-divider />
      <v-card class="d-flex flex-column" flat>
        <div
          class="d-flex justify-space-between align-center pr-4"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            Afficher la minimap
          </v-card-title>
          <div>
            <v-switch
              class="ma-0 pa-0"
              color="primary"
              hide-details
              inset
              style="margin-top: 2px;"
            />
          </div>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <v-card-text class="text-h6">Instituts à afficher</v-card-text>
        <div
          class="d-flex flex-column flex-wrap px-4"
          style="gap: 4px; max-height: 300px; overflow-y: auto;"
        >
          <v-checkbox
            v-for="(value, index) in portals"
            :key="index"
            class="ma-0"
            :color="value.color || 'primary'"
            hide-details
            :label="value.title"
          />
        </div>
        <div class="pa-4">
          <v-btn class="mr-4" color="primary">Tout cocher</v-btn>
          <v-btn color="primary">Tout décocher</v-btn>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <div
          class="d-flex justify-space-between align-center pr-4"
          style="height: 72px;"
        >
          <v-card-title class="text-h6" style="font-weight: 400;">
            Afficher le titre des revues
          </v-card-title>
          <div>
            <v-switch
              class="ma-0 pa-0"
              color="primary"
              hide-details
              inset
              style="margin-top: 2px;"
            />
          </div>
        </div>
      </v-card>
      <v-divider />
      <v-card :flat="true">
        <v-card-text class="text-h6">Filtrer par plateforme éditeur</v-card-text>
        <v-text-field class="mx-4" :clearable="true" color="primary" placeholder="ex: Wiley" />
      </v-card>
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useMittStore } from '@/stores/mitt';
  import config from '@/assets/config.json';

  const portals = config.portals;
  const emitter = useMittStore().emitter;
  const active = ref(false);
  emitter.on('showSettings', () => {
    active.value = true;
  });

</script>

<style lang="scss">

</style>
