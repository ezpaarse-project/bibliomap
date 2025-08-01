<template>
  <v-bottom-sheet v-model="showSheet" height="400">
    <v-card class="d-flex align-start" flat>
      <v-card-text v-for="(value, key) in event" :key="key" class="text-h6">
        <strong>{{ key }}:</strong> {{ value ? value : t('drawer.fields.unknown') }}
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script lang="ts" setup>
  import useMitt from '@/composables/useMitt';
  import { useI18n } from 'vue-i18n';

  const emitter = useMitt();
  const { t } = useI18n();
  const event = ref<Record<string, unknown>>({});

  emitter.on('eventClicked', openSheet);

  const showSheet = ref(false);

  function openSheet (e: Record<string, unknown>) {
    event.value = e;
    showSheet.value = true;
  }
</script>
