<template>
  <div class="mt-auto d-flex flex-column align-center ga-4">
    <div class="text-center ma-2">
      <v-btn
        href="https://github.com/ezpaarse-project/bibliomap"
        rel="noopener noreferrer"
        small
        target="_blank"
        variant="outlined"
      >
        Version: {{ version }}
        <v-icon right>
          mdi-github
        </v-icon>
      </v-btn>
    </div>
    <a href="https://www.inist.fr/" target="_blank"><img
      id="inist-logo"
      alt="CNRS"
      src="@/assets/logo-inist.png"
      width="120px"
    ></a>
  </div>
</template>

<script setup lang="ts">
  const version = import.meta.env.VITE_APP_VERSION || 'dev';
</script>
