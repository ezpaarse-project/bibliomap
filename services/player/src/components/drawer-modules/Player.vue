<template>
  <v-card :flat="true">
    <v-card-title>
      {{ t('drawer.player.title') }}
    </v-card-title>
    <v-card-text>
      {{ t('drawer.player.choose-file') }}
    </v-card-text>
    <v-file-input
      v-model="files"
      accept=".csv"
      chips
      class="mx-auto"
      :disabled="playState === PlayState.LOADING"
      :label="t('drawer.player.file-input-placeholder')"
      multiple
      style="max-width: 300px"
      :truncate-length="20"
      variant="underlined"
    />
  </v-card>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { usePlayerFileStore } from '@/stores/player-file';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();
  const filesStore = usePlayerFileStore();
  const files = ref([] as File[]);
  const { state: playState } = storeToRefs(usePlayStateStore());
  const messages = ref([] as string[]);

  watch(files, () => {
    if (!files.value) return
    files.value.forEach(file => {
      if (!file.name.endsWith('.csv')) {
        const message = t('drawer.player.error.invalid-file', { name: file.name });
        messages.value.push(message)
        files.value = files.value.filter(f => f !== file);
      }
    });
    filesStore.setFiles(files.value);
  });

  emitter.on('resetFileField', () => {
    files.value = [];
  });
</script>
