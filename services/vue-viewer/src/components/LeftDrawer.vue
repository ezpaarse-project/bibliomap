<template>
  <v-navigation-drawer v-if="include">
    <v-list-item-title>{{ props.title }}</v-list-item-title>
    <v-list-item-subtitle>{{ props.description }}</v-list-item-subtitle>
  </v-navigation-drawer>
</template>

<script setup lang="ts">

  import config from '@/assets/config.json';

  const props = config.leftDrawerParams;

  const include = !(!props || props.include === false);
</script>
