<template>
  <v-card-title>
    {{ t('drawer.counter.title') }}
  </v-card-title>

  <v-container fluid>
    <v-row dense justify="center">
      <v-col
        v-for="mime in mimes"
        :key="mime.name"
        cols="auto"
      >
        <v-tooltip
          location="top"
          :text="t('drawer.counter.tooltips.file-type-consultations', {
            n: countStore.getCountOfMime(mime.name),
            type: mime.name
          })"
        >
          <template #activator="{ props }">
            <v-badge class="mx-3" :content="countStore.getCountOfMime(mime.name) as number || 0">
              <v-chip v-bind="props" :color="mime.color" variant="flat">
                {{ mime.name }}
              </v-chip>
            </v-badge>
          </template>
        </v-tooltip>
      </v-col>

      <v-col v-if="counterProps.showTotal" cols="auto">
        <v-tooltip
          location="top"
          :text="t('drawer.counter.tooltips.total-consultations', {
            n: countStore.getTotalCount()
          })"
        >
          <template #activator="{ props }">
            <v-badge :content="countStore.getTotalCount()">
              <v-chip v-bind="props">
                {{ t('drawer.counter.total') }}
              </v-chip>
            </v-badge>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup lang='ts'>
  import { useEcCountStore } from '@/stores/ec-count';
  import { useMimeStore } from '@/stores/mime';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const { config } = storeToRefs(useViewerConfigStore());
  const counterProps = config.value.drawerParams.counterSection;
  const countStore = useEcCountStore();

  const { shownMimes: mimes } = storeToRefs(useMimeStore())
</script>
