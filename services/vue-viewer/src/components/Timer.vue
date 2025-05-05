<template>
  <div class="time-container">
    <v-chip>{{ text }}</v-chip>
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue';
  import config from '@/assets/config.json';
  import { format } from 'date-fns';

  const props = defineProps<{
    realTimeMode: boolean,
    time: Date
  }>();

  const params = config.timer;

  const startDate = new Date();

  const text = ref();

  text.value = `0${params.dayLetter} 0${params.hourLetter} 0${params.minuteLetter} 0${params.secondLetter}`;

  if (props.realTimeMode) {
    setInterval(() => {
      text.value = getDurationText(startDate, new Date());
    }, 1000);
  } else {
    text.value = getDateText(props.time);
  }

  function getDurationText (start: Date, date: Date) {
    const duration = date.getTime() - start.getTime();
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days}${params.dayLetter} ${hours}${params.hourLetter} ${minutes}${params.minuteLetter} ${seconds}${params.secondLetter}`;
  }

  function getDateText (date: Date) {
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  }
</script>

<style lang="scss">
  .time-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: .5rem;
  }
</style>
