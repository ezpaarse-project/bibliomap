<template>
  <div v-if="playStateStore.state !== PlayState.STOPPED" class="counter-container">
    <v-tooltip v-for="key in mimeStore.getAllMimeNames()" :key="key" location="top" :text="t('drawer.counter.tooltips.file-type-consultations', {n: countStore.getCountOfMime(key), type: key})">
      <template v-if="config.drawerParams.counterSection.countAllMimes || value.count" #activator="{ props }">
        <v-badge :content="countStore.getCountOfMime(key)">
          <v-chip v-bind="props" :color="mimeStore.getMimeColor(key)" variant="flat">
            {{ key }}
          </v-chip>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip v-if="counterProps.showTotal" location="top" :text="t('drawer.counter.tooltips.total-consultations', {n: countStore.getTotalCount()})">
      <template #activator="{ props }">
        <v-badge :content="countStore.getTotalCount()">
          <v-chip v-bind="props">{{ t('drawer.counter.total') }}</v-chip>
        </v-badge>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang='ts'>
  import { useEcCountStore } from '@/stores/ec-count';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useMimesStore } from '@/stores/mimes.ts';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const { config } = storeToRefs(useViewerConfigStore());
  const counterProps = config.value.drawerParams.counterSection;
  const mimeStore = useMimesStore();
  const countStore = useEcCountStore();
  const playStateStore = usePlayStateStore();
</script>

<style lang="scss">
  .counter-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    margin: 1rem .5rem;
    flex-wrap: wrap;
  }
</style>
