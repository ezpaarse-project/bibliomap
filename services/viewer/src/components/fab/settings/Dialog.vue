<template>
  <v-dialog
    v-model="active"
    max-width="1000"
  >
    <v-card :flat="true">
      <div class="d-flex align-start my-2">
        <v-card-title class="text-h4">{{ t('fabButton.settings-dialog.title') }}</v-card-title>
        <v-spacer />
        <v-btn class="mr-4" :flat="true" icon="mdi-close" @click.stop="active = false" />
      </div>
      <v-divider />
      <ShowMiniMapTab />
      <v-divider />
      <PortalTab />
      <v-divider />
      <ShowTitleTab />
      <v-divider />
      <FilterTab />
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="active = false">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import ShowMiniMapTab from '@/components/fab/settings/ShowMiniMapTab.vue';
  import PortalTab from '@/components/fab/settings/PortalTab.vue';
  import ShowTitleTab from '@/components/fab/settings/ShowTitleTab.vue';
  import FilterTab from '@/components/fab/settings/FilterTab.vue';

  import useMitt from '@/composables/useMitt';

  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const emitter = useMitt();
  const active = ref(false);

  emitter.on('showSettings', () => {
    active.value = true;
  });

</script>

<style lang="scss">

</style>
