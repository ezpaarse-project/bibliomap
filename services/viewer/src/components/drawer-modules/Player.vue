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
    <div class="d-flex flex-row">
      <v-btn
        v-if="playState !== PlayState.PLAYING"
        class="mx-auto d-block mb-2"
        color="green"
        :disabled="!files.length || playState === PlayState.LOADING"
        flat
        @click="handleStart"
      ><v-icon>mdi-play-circle</v-icon></v-btn>

      <v-btn
        v-else
        class="mx-auto d-block mb-2"
        color="grey"
        flat
        @click="handlePause"
      ><v-icon>mdi-pause-circle</v-icon></v-btn>

      <v-btn
        class="mx-auto d-block mb-2"
        color="red"
        :disabled="playState === PlayState.STOPPED || playState === PlayState.LOADING"
        flat
        @click="handleStop"
      ><v-icon>mdi-stop-circle</v-icon></v-btn>
    </div>
    <v-snackbar-queue
      v-model="messages"
      color="red"
      :timeout="3000"
      width="500"
    />
  </v-card>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { usePlayerFilesStore } from '@/stores/player-files.ts';
  import useMitt from '@/composables/useMitt';
  import { PlayState, usePlayStateStore } from '@/stores/play-state.ts';

  const { t } = useI18n();
  const emitter = useMitt();
  const filesStore = usePlayerFilesStore();
  const files = ref([]);
  const { state: playState } = storeToRefs(usePlayStateStore());
  const messages = ref([]);

  watch(files, () => {
    emitter.emit('filesChanged', files.value);
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

  const handleStart = () => {
    if (!files.value) return
    emitter.emit('play', null);
  };

  const handleStop = () => {
    emitter.emit('stop', null);
  }

  const handlePause = () => {
    emitter.emit('pause', null);
  }
</script>

<style scoped lang="scss">

</style>
