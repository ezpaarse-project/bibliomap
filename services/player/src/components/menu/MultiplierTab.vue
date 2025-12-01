<template>
  <v-number-input v-model="multiplier" class="w-100" dense hide-details="auto" :label="t('drawer.timer.multiplier-field')"
    :max="100" :min="1" />
</template>

<script setup lang="ts">

import { usePlayerMultiplierStore } from '@/stores/player-multiplier';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { multiplier } = storeToRefs(usePlayerMultiplierStore());

</script>