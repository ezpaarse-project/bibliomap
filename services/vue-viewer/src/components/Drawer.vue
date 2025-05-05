<template>
  <v-navigation-drawer
    v-if="include"
    v-model="drawer"
    :location="props.position as 'left' | 'end' | 'start' | 'top' | 'bottom' | 'right' | undefined"
    width="300"
  >
    <v-app-bar-nav-icon
      variant="text"
      @click.stop="drawer = !drawer"
    />
    <div v-if="props.descriptionSection.include">
      <v-list-item>{{ props.descriptionSection.title }}</v-list-item>
      <v-list-item>{{ props.descriptionSection.content }}</v-list-item>
      <v-divider />
    </div>
    <div v-if="props.timerSection.include">
      <Timer />
      <v-divider />
    </div>
    <v-list-item>COUNTER</v-list-item>
    <v-divider />
    <v-list-item>PORTALS</v-list-item>
  </v-navigation-drawer>
  <v-btn
    v-if="include && !drawer"
    size="60"
    style="z-index: 1000;"
    @click="drawer = !drawer"
  >
    <v-icon>mdi-arrow-right</v-icon>
  </v-btn>
</template>

<script setup lang="ts">

  import { ref, watch } from 'vue'

  import config from '@/assets/config.json';

  const props = config.drawerParams;

  const include = !(!props || props.include === false);

  const drawer = ref(true)
  const group = ref(null)

  watch(group, () => {
    drawer.value = false
  })


</script>
