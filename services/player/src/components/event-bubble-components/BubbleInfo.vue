<template>
  <v-card
    class="pa-2 info-card"
    elevation="10"
  >
    <v-card-title
      class="text-body-2 pa-0 mb-2 px-4 title-wrap"
      style="text-align: center;"
    >
      {{ title }}
    </v-card-title>

    <v-row v-for="elt in other" :key="elt" class="pa-0 mb-2 px-4" style="text-align: center;">{{ elt }}</v-row>

    <div class="chip-container">
      <v-chip
        v-if="rType"
        class="chip"
        :color="getRTypeColor()"
        size="small"
        variant="flat"
      >{{ rType }}</v-chip>
      <v-chip
        v-if="mime"
        class="chip"
        :color="getMimeColor()"
        size="small"
        variant="flat"
      >{{ mime }}</v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { useViewerConfigStore } from '@/stores/viewer-config';

  const props = defineProps<{
    title: string | null | undefined,
    mime: string | null | undefined,
    rType: string | null | undefined,
    other: string[] | null | undefined,
  }>();

  const config = useViewerConfigStore().config;
  function getMimeColor () {
    const defaultColor = config.mapParams.attributesColors.defaultMimeColor || '#7F8C8D';
    const mimes = config.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>;
    if (!props.mime || !Object.keys(mimes).includes(props.mime.toUpperCase())) return defaultColor;
    return mimes[props.mime.toUpperCase()].color;
  }

  function getRTypeColor () {
    return config.mapParams.attributesColors.rtype || '#7F8C8D';
  }
</script>
<style scoped lang="scss">

.info-card {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 100px;
  max-width: 200px;
  opacity: 85%;

  &:hover {
    opacity: 100%;
    z-index: 1002;
  }
}

.title-wrap {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  text-align: center;
}

.chip-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: center;
}

.chip {
  white-space: nowrap;
}
</style>
