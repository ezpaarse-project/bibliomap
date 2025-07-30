<template>
  <v-card flat>
    <v-card-title>
      {{ t('drawer.fields.title') }}
    </v-card-title>
    <v-select
      v-model="fieldIdentifier"
      :disabled="!headers || headers.length === 0 || state === PlayState.LOADING"
      :items="headers"
      :label="t('drawer.fields.placeholder')"
    />
  </v-card>
  <div v-if="fields && fields.length > 0">

    <a
      v-for="{name, color} in fields"
      :key="name"
      class="anchor"
      target="_blank"
    >

      <v-list-item class="row">
        <v-tooltip
          :disabled="!countStore.getCountOfField(name.length ? name.toUpperCase() : 'UNKNOWN')"
          location="right"
        >
          <template #activator="{ props }">
            <v-row class="mx-2 my-1" v-bind="props" justify="space-between">
              <v-col cols="auto">
                <h3 style="font-size: 16px">{{ name.length ? name.toUpperCase() : 'UNKNOWN' }}</h3>
              </v-col>
              <v-col cols="auto">
                <v-chip
                  :color="color"
                  variant="flat"
                >
                  {{ countStore.getCountOfField(name.length ? name.toUpperCase() : 'UNKNOWN') }}
                </v-chip>
              </v-col>
            </v-row>
          </template>
          <div>
            <div
              v-for="mime in countStore.getMimeInField(name.length ? name.toUpperCase() : 'UNKNOWN')"
              :key="mime"
            >
              {{ mime }}: {{ countStore.getCountOfFieldAndMime(name.length ? name.toUpperCase() : 'UNKNOWN', mime) }}
            </div>
          </div>
        </v-tooltip>

      </v-list-item>
    </a>
  </div>
</template>

<script setup lang="ts">
  import { useEcCountStore } from '@/stores/ec-count';
  import { type Field, useSortFieldStore } from '@/stores/sort-field';
  import { useI18n } from 'vue-i18n';
  import { PlayState, usePlayStateStore } from '@/stores/play-state';
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const { t } = useI18n();
  const countStore = useEcCountStore();
  const { state } = storeToRefs(usePlayStateStore());
  const { config: viewerConfig } = storeToRefs(useViewerConfigStore());

  const fields = computed(() => viewerConfig.value.drawerParams.portalSection.portals as Field[]);
  const { headers, fieldIdentifier } = storeToRefs(useSortFieldStore());
</script>

<style lang="scss">
  .anchor{
    text-decoration: none;
    color: inherit;
    z-index: 100;
  }
  .row{
    transition: background-color 0.2s ease;
  }
  .row:hover{
    background-color: rgba(0, 0, 0, 0.08);
    cursor: pointer;
  }
</style>
