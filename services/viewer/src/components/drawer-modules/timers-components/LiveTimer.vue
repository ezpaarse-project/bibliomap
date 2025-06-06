<template>
  <v-tooltip
    location="top"
    :text="t('drawer.timer.tooltips.live-timer', {time: text})"
  >
    <template #activator="{ props }">
      <div class="timer-container">
        <v-chip v-bind="props">{{ text }}</v-chip>
      </div>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const params = config.drawerParams.timerSection;
  const { t } = useI18n();

  const startDate = new Date();
  const text = ref(getDurationText(startDate, startDate));

  setInterval(() => {
    text.value = getDurationText(startDate, new Date());
  }, 1000)

  function getDurationText (start: Date, date: Date) {
    const duration = date.getTime() - start.getTime();
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days}${params.dayLetter} ${hours}${params.hourLetter} ${minutes}${params.minuteLetter} ${seconds}${params.secondLetter}`;
  }
</script>
<style lang="scss">
  .timer-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    margin: 1rem .5rem;
    flex-wrap: wrap;
  }
</style>
