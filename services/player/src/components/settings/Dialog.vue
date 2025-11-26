<template>
  <v-dialog
    v-model="active"
    max-width="1000"
    scrollable
  >
    <v-card flat>
      <v-card-title class="text-h4">{{ t('fab.settings-dialog.title') }}</v-card-title>
      <v-divider />
      <ShowMiniMapTab />
      <v-divider />
      <FieldFilterTab />
      <v-divider />
      <MimeFilterTab />
      <v-divider />
      <MultiplicatorTab />
      <v-divider />
      <BubbleTab />
      <v-divider />
      <LocalisationTab />
      <v-divider />
      <ShowTitleTab />
      <v-divider />
      <EditorFilterTab />
      <v-divider />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  import ShowMiniMapTab from '@/components/settings/ShowMiniMapTab.vue';
  import FieldFilterTab from '@/components/settings/FieldFilterTab.vue';
  import MimeFilterTab from '@/components/settings/MimeFilterTab.vue';
  import MultiplicatorTab from '@/components/settings/MultiplicatorTab.vue';
  import BubbleTab from '@/components/settings/BubbleTab.vue';
  import LocalisationTab from '@/components/settings/LocalisationTab.vue';
  import ShowTitleTab from '@/components/settings/ShowTitleTab.vue';
  import EditorFilterTab from '@/components/settings/EditorFilterTab.vue';

  const { t } = useI18n();

  const emitter = useMitt();
  const active = ref(false);

  emitter.on('showSettings', () => {
    active.value = true;
  });
</script>
