<template>
  <div class="d-flex justify-center mt-2">
    <v-chip>{{ timer ? new Date(timer).toLocaleString() : "" }}</v-chip>
  </div>
</template>

<script setup lang="ts">

import { useTimerStore } from '@/stores/timer.ts';

const { timer } = storeToRefs(useTimerStore());

</script>
