<template>
  <v-menu
    v-model="mapMenu"
    :close-on-content-click="false"
    offset-y
  >
    <template #activator="{ props: mapMenuProps }">
      <v-btn
        v-tooltip="{text: t('fabButton.tooltips.change-map'), location: 'left'}"
        color="green"
        v-bind="{ ...mapMenuProps }"
        icon="mdi-map"
      />
    </template>

    <v-list>
      <v-list-item
        v-for="(map, index) in ['Default', 'Humanitarian OSM', 'OpenTopoMap', 'CyclOSM']"
        :key="index"
        @click="changeMapType(map)"
      >
        <v-list-item-title>{{ map }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const emitter = useMitt();
  const mapMenu = ref(false);
  const changeMapType = (layerName: string) => {
    emitter.emit('changeMapType', layerName);
    mapMenu.value = false;
  }
</script>
