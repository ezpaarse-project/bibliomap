<template>
  <main>
    <LeftDrawer
      description="Consultations en direct des articles de plusieurs milliers de revues scientifiques électroniques disponibles en texte intégral ainsi que des bases de données."
      title="Bibliomap" />
    <InfoMap />
  </main>
</template>

<script lang="ts" setup>
import LeftDrawer from '@/components/LeftDrawer.vue';
import InfoMap from '@/components/WorldMap.vue';
//
</script>

<style>
html {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
