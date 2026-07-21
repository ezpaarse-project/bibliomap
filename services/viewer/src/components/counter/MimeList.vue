<template>
  <div class="d-flex justify-center flex-wrap ga-2">
    <v-tooltip v-for="value, key in mimes" :key="key" location="top" :text="t('drawer.counter.tooltips.file-type-consultations', {n: countStore.getCountOfMime(key), type: key})">
      <template v-if="config.drawerParams.counterSection.countAllMimes || value.count" #activator="{ props }">
        <v-badge class="ma-2" :content="countStore.getCountOfMime(key)">
          <v-chip v-bind="props" :color="mimes[key as keyof typeof mimes].color" variant="flat">
            {{ key }}
          </v-chip>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip v-if="counterProps.showTotal" location="top" :text="t('drawer.counter.tooltips.total-consultations', {n: countStore.getTotalCount()})">
      <template #activator="{ props }">
        <v-badge class="ma-2" :content="countStore.getTotalCount()">
          <v-chip v-bind="props">{{ t('drawer.counter.total') }}</v-chip>
        </v-badge>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang='ts'>
  import { useEcCountStore } from '@/stores/ec-count';
  import { useConfigStore } from '@/stores/config';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const { config } = storeToRefs(useConfigStore());
  const counterProps = config.value.drawerParams.counterSection;
  const mimes = config.value.mapParams.attributesColors.mimes;
  const countStore = useEcCountStore();
</script>
