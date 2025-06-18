<template>
  <div class="timer-container">
    <div class="timer-multiplier-container">
      <v-tooltip location="top" :text="t('drawer.timer.tooltips.simulation-datetime')">
        <template #activator="{ props }">
          <v-chip v-bind="props">{{ timer ? timerText : t('drawer.timer.loading') }}</v-chip>
        </template>
      </v-tooltip>

      <v-tooltip
        v-if="params.showMultiplier && replayConfig && replayConfig.replayMultiplier > 1"
        location="top"
        :text="t('drawer.timer.tooltips.multiplier', {multiplier: replayConfig.replayMultiplier})"
      >
        <template #activator="{ props }">
          <v-chip v-bind="props">x{{ replayConfig.replayMultiplier }}</v-chip>
        </template>
      </v-tooltip>
    </div>

    <v-tooltip
      location="top"
      :text="percentage < 0
        ? t('drawer.timer.loading')
        : t('drawer.timer.tooltips.simulation-percentage', { percentage })"
    >
      <template #activator="{ props }">
        <v-progress-linear v-bind="props" :indeterminate="percentage < 0" :model-value="percentage" />
      </template>
    </v-tooltip>

    <v-chip v-if="params.showStartEndTime && replayConfig?.replayEndDatetime && replayConfig?.replayStartDatetime" class="start-end-dates">
      <div>
        <v-tooltip location="top" :text="t('drawer.timer.tooltips.start-datetime')">
          <template #activator="{ props }">
            <span v-bind="props">{{ getDateText(new Date(replayConfig.replayStartDatetime), config.drawerParams.timerSection.startEndDatesFormat) }}</span>
          </template>
        </v-tooltip>
      </div>
      <div>
        <v-icon>mdi-arrow-right-circle</v-icon>
      </div>
      <div>
        <v-tooltip location="top" :text="t('drawer.timer.tooltips.end-datetime')">
          <template #activator="{ props }">
            <span v-bind="props">{{ getDateText(new Date(replayConfig.replayEndDatetime), config.drawerParams.timerSection.startEndDatesFormat) }}</span>
          </template>
        </v-tooltip>
      </div>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
  import { useReplayConfigStore } from '@/stores/replay-config';
  import { useTimerStore } from '@/stores/timer.ts';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { format } from 'date-fns';
  import { TZDate } from '@date-fns/tz';
  import { useI18n } from 'vue-i18n';

  const config = useViewerConfigStore().config;
  const { config: replayConfig } = storeToRefs(useReplayConfigStore());
  const { timer } = storeToRefs(useTimerStore());
  const params = config.drawerParams.timerSection;
  const { t } = useI18n();

  const percentage = ref(0);
  const timerText = ref(getDateText(new Date(timer.value || 0), params.timerDateFormat));

  watch([timer, replayConfig], () => {
    timerText.value = getDateText(new Date(timer.value || 0), params.timerDateFormat)
    percentage.value = getPercentage(timer.value || 0, (replayConfig.value ? replayConfig.value.replayStartDatetime : null) || 0, (replayConfig.value ? replayConfig.value.replayEndDatetime : null) || 0);
  })

  const startTimeText = ref(getDateText(new Date(replayConfig.value?.replayStartDatetime || 0), params.startEndDatesFormat));
  const endTimeText = ref(getDateText(new Date(replayConfig.value?.replayEndDatetime || 0), params.startEndDatesFormat));

  watch(replayConfig, () => {
    startTimeText.value = getDateText(new Date(replayConfig.value?.replayStartDatetime || 0), params.startEndDatesFormat);
    endTimeText.value = getDateText(new Date(replayConfig.value?.replayEndDatetime || 0), params.startEndDatesFormat);
  })

  function getDateText (date: Date, formatString: string) {
    return format(TZDate.tz('Europe/Paris', date), formatString);
  }

  function getPercentage (currentTime: number | null, startTime: number | undefined, endTime: number | undefined) {
    if (!currentTime || !startTime || !endTime) return -1;
    return Math.round(((currentTime - startTime) / (endTime - startTime)) * 100)
  }
</script>

<style lang="scss">
  .timer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    margin: .5rem .5rem;
    flex-wrap: wrap;
    gap: .3rem;
  }

  .timer-multiplier-container{
    display: flex;
    gap: .5rem;
  }

  .start-end-dates{
    display: flex;
    width: 70%;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: wrap;

    div{
      text-align: center;
      width: 100%;
    }
  }
</style>
