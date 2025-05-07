<template>
  <div class="card-version-container">
    <v-card density="comfortable" :flat="true" height="65" width="160">
      <v-card-title class="justify-center text-body-1 pb-0">Bibliomap 6.0</v-card-title>
      <v-card-text class="justify-center text-caption pt-0">
        Connecté à ezPAARSE
      </v-card-text>
    </v-card>
  </div>
</template>
<style lang="scss">
  .card-version-container{
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    opacity: .75;
    margin: .5rem;
  }
  .justify-center{
    text-align: center;
  }
</style>
