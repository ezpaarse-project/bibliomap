<template>
  <div class="counter-container">
    <v-tooltip v-for="(value, key) in counts" :key="key" location="top" :text="t('drawer.counter.tooltips.file-type-consultations', {n: value, type: key})">
      <template #activator="{ props }">
        <v-badge :content="value">
          <v-chip v-bind="props" :color="mimes[key as keyof typeof mimes].color" variant="flat">
            {{ key }}
          </v-chip>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip v-if="counterProps.showTotal" location="top" :text="t('drawer.counter.tooltips.total-consultations', {n: total})">
      <template #activator="{ props }">
        <v-badge :content="total">
          <v-chip v-bind="props">{{ t('drawer.counter.total') }}</v-chip>
        </v-badge>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang='ts'>
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const counts = reactive({} as Record<string, number>);
  const total = ref(0);

  const config = useViewerConfigStore().config;
  const counterProps = config.drawerParams.counterSection;
  const mimes = config.mapParams.attributesColors.mimes;

  Object.keys(mimes).forEach(key => {
    if (mimes[key as keyof typeof mimes].count) counts[key] = 0;
  });
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
