<template>
  <v-btn href="https://github.com/ezpaarse-project/bibliomap" rel="noopener noreferrer" small target="_blank"
    variant="outlined">
    Version: {{ version }}
    <v-icon right>
      mdi-github
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">

const version = ref(import.meta.env.VITE_APP_VERSION || 'dev');

</script>