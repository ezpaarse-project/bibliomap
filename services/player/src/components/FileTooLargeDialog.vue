<template>
  <v-dialog
    v-model="active"
    class="ma-4"
    max-width="400"
    persistent
  >
    <v-card
      :text="t('file-too-large-dialog.message')"
      :title="t('file-too-large-dialog.title')"
    >
      <template #actions>
        <v-spacer />
        <v-btn @click="agree">{{ t('file-too-large-dialog.agree') }}</v-btn>
        <v-btn @click="disagree">{{ t('file-too-large-dialog.disagree') }}</v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { useLargeFileStore } from '@/stores/large-file';
  import useMitt from '@/composables/useMitt';

  const { t } = useI18n();
  const emitter = useMitt();

  const { active, largeFiles, permission } = storeToRefs(useLargeFileStore());

  function agree () {
    active.value = false;
    permission.value = true;
  }

  function disagree () {
    active.value = false;
    largeFiles.value = [];
    permission.value = false;
    emitter.emit('resetFileField', null);
  }
</script>
