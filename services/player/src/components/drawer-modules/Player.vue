<template>
  <v-card :flat="true">
    <v-card-title>
      {{ t('drawer.player.title') }}
    </v-card-title>
    <v-card-text>
      {{ t('drawer.player.choose-file') }}
    </v-card-text>
    <v-tooltip :disabled="!files || files.length === 0" location="right">
      <template #activator="{ props }">
        <v-file-input
          v-bind="props"
          v-model="files"
          accept=".csv"
          chips
          class="mx-auto"
          counter
          :disabled="playState === PlayState.LOADING"
          :label="t('drawer.player.file-input-placeholder')"
          multiple
          style="max-width: 300px"
          :truncate-length="20"
          variant="underlined"
        >
          <template #selection="{ fileNames }">
            <template v-for="(fileName, index) in fileNames" :key="fileName">
              <v-chip
                v-if="index < 1"
                class="me-2"
                label
                size="small"
              >
                {{ fileName }}
              </v-chip>

              <span
                v-else-if="index === 1"
                class="text-overline text-grey-darken-3 mx-2"
              >
                {{ t('drawer.player.files', { n: files.length - 1 }) }}
              </span>
            </template>
          </template>
        </v-file-input>
      </template>
      <div class="d-flex flex-column">
        <span
          v-for="(file, idx) in files"
          :key="idx"
          class="text-caption"
          style="white-space: nowrap"
        >
          {{ file.name }}
        </span>
      </div>
    </v-tooltip>

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
  const messages = ref<string[]>([]);

  watch(files, () => {
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
