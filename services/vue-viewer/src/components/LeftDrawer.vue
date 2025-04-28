<template>
  <v-navigation-drawer class="nav_drawer">
    <v-list-item-title>{{ props.title }}</v-list-item-title>
    <v-list-item-subtitle>{{ props.description }}</v-list-item-subtitle>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  const props = defineProps({
    title: String,
    description: String,
  })
</script>
