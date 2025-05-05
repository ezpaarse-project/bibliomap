<template>
  <div class="time-container">
    <v-chip>{{ text }}</v-chip>
    <v-progress-linear v-if="!config.realTimeMode && percentage >= 0" :model-value="percentage" />
    <v-progress-linear v-if="!config.realTimeMode && percentage < 0" indeterminate />
    <span class="start-end-dates"><v-chip>{{ startTimeText }}</v-chip><span>-</span><v-chip>{{ endTimeText }}</v-chip></span>
  </div>
</template>

<script setup lang="ts">
  import config from '@/assets/config.json';
  import { format } from 'date-fns';
  import { useSocketStore } from '@/stores/socket';
  import { TZDate } from '@date-fns/tz';

  const params = config.timer;

  const startDate = new Date();

  const text = ref();
  const percentage = ref<number>(-1);
  const startTimeText = ref('');
  const endTimeText = ref('');

  let startTime;
  let endTime;

  if (config.realTimeMode) {
    text.value = `0${params.dayLetter} 0${params.hourLetter} 0${params.minuteLetter} 0${params.secondLetter}`;
    setInterval(() => {
      text.value = getDurationText(startDate, new Date());
    }, 1000);
  } else {
    text.value = `Chargement...`;
    const socket = useSocketStore().getSocket()
    socket?.emit('isReady', socket.id);
    socket?.on('ready', () => {
      socket?.emit('getTime');
      socket?.on('timeResponse', (timer, start, end) => {
        text.value = getDateText(new Date(timer));
        startTime = start;
        endTime = end;
        percentage.value = ((timer - startTime) / (endTime - startTime)) * 100;
        startTimeText.value = getDateText(new Date(startTime));
        endTimeText.value = getDateText(new Date(endTime));
      })
      socket?.on('timeUpdate', time => {
        text.value = getDateText(time);
      })
    })
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
    return format(TZDate.tz('Europe/Paris', date), params.dateFormat);
  }
</script>

<style lang="scss">
  .time-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: .5rem;
    gap: .5rem;
  }

  .start-end-dates{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: wrap;
    gap: .5rem;
  }
</style>
