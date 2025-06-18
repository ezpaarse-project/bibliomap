<template>
  <v-card-title class="counter-title">
    {{ t('drawer.counter.title') }}
  </v-card-title>
  <div v-if="mimes.length" class="counter-container">
    <v-tooltip
      v-for="mime in mimes"
      :key="mime.name"
      location="top"
      :text="t('drawer.counter.tooltips.file-type-consultations', {
        n: countStore.getCountOfMime(mime.name),
        type: mime.name
      })"
    >
      <template
        #activator="{ props }"
      >
        <v-badge :content="0 || countStore.getCountOfMime(mime.name)">
          <v-chip v-bind="props" :color="mime.color" variant="flat">
            {{ mime.name }}
          </v-chip>
        </v-badge>
      </template>
    </v-tooltip>
  </div>
  <div class="total-count-container">
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
  import { useI18n } from 'vue-i18n';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();

  const { config } = storeToRefs(useViewerConfigStore());
  const counterProps = config.value.drawerParams.counterSection;
  const mimeStore = useMimesStore();
  const countStore = useEcCountStore();

  const mimes = ref([]);

  emitter.on('files-loaded', async () => {
    mimes.value = await mimeStore.getMimes();
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
    gap: .5rem;
  }

  .total-count-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 1rem .5rem;
  }
</style>
