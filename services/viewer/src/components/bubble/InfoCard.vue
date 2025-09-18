<template>
  <v-card
    class="pa-2"
    elevation="10"
    style="opacity: 85%;"
  >
    <v-card-title
      class="pa-0 px-4"
      style="text-align: center; font-size: 12px;"
    >
      <b> {{ title }} </b>
    </v-card-title>

    <div style="display: flex; justify-content: center;">
      <v-chip
        v-if="rType"
        class="mx-1"
        :color="getRTypeColor()"
        size="small"
        variant="flat"
      >
        {{ rType }}
      </v-chip>

      <v-chip
        v-if="mime"
        class="mx-1"
        :color="getMimeColor()"
        size="small"
        variant="flat"
      >
        {{ mime }}
      </v-chip>
    </div>
    <v-card-text v-for="elt in other" :key="elt" class="pa-0 mt-1 justify-center align-center" style="text-align: center; font-size: 11px;">{{ elt }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { useConfigStore } from '@/stores/config';

  const props = defineProps<{
    title: string | null | undefined,
    mime: string | null | undefined,
    rType: string | null | undefined,
    other: string[] | null | undefined,
  }>();

  const config = useConfigStore().config;
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
