<template>
  <div class="time-container">
    <div class="timer-multiplier-container">
      <v-tooltip location="top" :text="t('drawer.timer.tooltips.simulation-datetime')">
        <template #activator="{ props }">
          <v-chip v-bind="props">{{ text }}</v-chip>
        </template>
      </v-tooltip>

      <v-tooltip
        v-if="replayMode && params.showMultiplier && multiplier > 1"
        location="top"
        :text="t('drawer.timer.tooltips.multiplier', {multiplier})"
      >
        <template #activator="{ props }">
          <v-chip v-bind="props">x{{ multiplier }}</v-chip>
        </template>
      </v-tooltip>
    </div>

    <v-tooltip
      v-if="replayMode && percentage >= 0"
      location="top"
      :text="t('drawer.timer.tooltips.simulation-percentage', {percentage: Math.round(percentage)})"
    >
      <template #activator="{ props }">
        <v-progress-linear v-bind="props" :model-value="percentage" />
      </template>
    </v-tooltip>

    <v-tooltip
      v-if="replayMode && percentage < 0"
      location="top"
      :text="t('drawer.timer.loading')"
    >
      <template #activator="{ props }">
        <v-progress-linear v-bind="props" indeterminate />
      </template>
    </v-tooltip>

    <span v-if="replayMode && params.showStartEndTime && startTimeText && endTimeText" class="start-end-dates">
      <v-tooltip location="top" :text="t('drawer.timer.tooltips.start-datetime')">
        <template #activator="{ props }">
          <v-chip v-bind="props">{{ startTimeText }}</v-chip>
        </template>
      </v-tooltip>
      <span>-</span>
      <v-tooltip location="top" :text="t('drawer.timer.tooltips.end-datetime')">
        <template #activator="{ props }">
          <v-chip v-bind="props">{{ endTimeText }}</v-chip>
        </template>
      </v-tooltip>
    </span>
  </div>
</template>


<script setup lang="ts">
  import config from '@/assets/config.json';
  import { format } from 'date-fns';
  import { useSocketStore } from '@/stores/socket';
  import { TZDate } from '@date-fns/tz';
  import { useI18n } from 'vue-i18n';
  const replayMode = import.meta.env.VITE_REPLAY_MODE;

  const params = config.drawerParams.timerSection;
  const { t } = useI18n();

  const startDate = new Date();

  const text = ref();
  const percentage = ref<number>(-1);
  const startTimeText = ref('');
  const endTimeText = ref('');

  let startTime: number;
  let endTime: number;
  const multiplier = ref<number>(1);

  if (!replayMode) {
    text.value = `0${params.dayLetter} 0${params.hourLetter} 0${params.minuteLetter} 0${params.secondLetter}`;
    setInterval(() => {
      text.value = getDurationText(startDate, new Date());
    }, 1000);
  } else {
    text.value = t('drawer.timer.loading');
    const socket = useSocketStore().getSocket()
    socket?.emit('isReady', socket.id);
    socket?.on('ready', () => {
      socket?.emit('getTime');
      socket?.on('timeResponse', (timer, start, end, m) => {
        text.value = getDateText(new Date(timer), params.timerDateFormat);
        startTime = start;
        endTime = end;
        multiplier.value = m;
        percentage.value = ((timer - startTime) / (endTime - startTime)) * 100;
        startTimeText.value = getDateText(new Date(startTime), params.startEndDatesFormat);
        endTimeText.value = getDateText(new Date(endTime), params.startEndDatesFormat);
      })
      socket?.on('timeUpdate', time => {
        percentage.value = ((new Date(time).getTime() - startTime) / (endTime - startTime)) * 100;
        text.value = getDateText(time, params.timerDateFormat);
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

  function getDateText (date: Date, formatString: string) {
    return format(TZDate.tz('Europe/Paris', date), formatString);
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

  .timer-multiplier-container{
    display: flex;
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
