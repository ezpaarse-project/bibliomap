<template>
  <v-bottom-sheet
    v-model="active"
    :close-on-back="false"
    :close-on-esc="false"
    no-click-animation
    persistent
  >
    <v-card class="pa-4">
      <v-progress-linear
        v-model="progress"
        color="black"
        height="10"
        :indeterminate="progress < 0"
        :style="'transition: none'"
      />
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script lang="ts" setup>
  import { useProgressStore } from '@/stores/progress';

  const { progress, message, active } = storeToRefs(useProgressStore());
</script>
