<template>
  <div class="event-bubble">
    <div class="bubble-container">
      <div class="bubble-info">
        <BubbleInfo
          :mime="props.log.mime"
          :other="other"
          :r-type="props.log.rtype"
          :title="props.log.platform_name"
        />
      </div>

      <div v-if="bubble" class="bubble-core">
        <RareCaseBubble
          v-if="rareCaseScenario"
          :color="bubble.type === BubbleType.Regular ? bubble.color : bubble.colors[0]"
        />

        <RegularBubble v-else-if="bubble.type === BubbleType.Regular" :color="bubble.color" />
        <GradientBubble v-else-if="bubble.type === BubbleType.Gradient" :colors="bubble.colors" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  enum BubbleType {
    Regular,
    Gradient
  }

  type BubbleProps =
    | { type: BubbleType.Regular; color: string }
    | { type: BubbleType.Gradient; colors: string[] }
</script>
<script setup lang="ts">
  import { type Log } from '@/main';
  import { usePlayerFileStore } from '@/stores/player-file';
  import { useSortFieldStore } from '@/stores/sort-field';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  const props = defineProps<{
    log: Log
  }>();

  function normalizeString (str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  const { config } = storeToRefs(useViewerConfigStore());
  const sortFieldStore = useSortFieldStore();
  const log = props.log
  const bubble = computed(() => getBubblePropsFromLog(log));
  const other = config.value.mapParams.popupText.publication_title && log.publication_title ? [log.publication_title] : [];
  const { files } = storeToRefs(usePlayerFileStore());
  const rareCaseScenario = computed(() => files.value.reduce((a, b) => a || normalizeString(b.name).includes('leo'), false));

  function getBubblePropsFromLog (log: Log) {
    const fieldValue = log[sortFieldStore.fieldIdentifier];
    if (typeof fieldValue !== 'string') {
      return null;
    }
    if (fieldValue.includes('+')){
      const colors = fieldValue.split('+').map((field: string) => sortFieldStore.getFieldColor(field));
      return { colors, type: BubbleType.Gradient } as BubbleProps;
    }
    return { color: sortFieldStore.getFieldColor(fieldValue), type: BubbleType.Regular } as BubbleProps;
  }
</script>
<style scoped lang="scss" scopped>
.event-bubble {
  position: relative;
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bubble-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.bubble-core {
  z-index: 0;
}

.bubble-info {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}
</style>
