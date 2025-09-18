<template>
  <div class="event-bubble">
    <div class="bubble-container">
      <div class="bubble-info">
        <InfoCard
          v-if="bubble.type !== BubbleType.Filtered"
          :mime="props.log.mime"
          :other="other"
          :r-type="props.log.rtype"
          :title="props.log.platform_name"
        />
      </div>

      <div class="bubble-core">
        <RegularBubble v-if="bubble.type === BubbleType.Regular" :color="bubble.color" />
        <GradientBubble v-else-if="bubble.type === BubbleType.Gradient" :colors="bubble.colors" />
        <MulticolorBubble v-else-if="bubble.type === BubbleType.Multicolor" />
        <FilteredBubble v-else-if="bubble.type === BubbleType.Filtered" :color="bubble.color" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  enum BubbleType {
    Regular,
    Gradient,
    Multicolor,
    Filtered
  }

  type BubbleProps =
    | { type: BubbleType.Regular; color: string }
    | { type: BubbleType.Gradient; colors: string[] }
    | { type: BubbleType.Multicolor }
    | { type: BubbleType.Filtered, color: string }
</script>

<script setup lang="ts">
  import initialConfig from '@/assets/config.json';
  import { type Log } from '@/main';
  import InfoCard from '@/components/bubble/InfoCard.vue';
  import { useConfigStore } from '@/stores/config';
  const props = defineProps<{
    log: Log
  }>()
  const { config } = storeToRefs(useConfigStore());
  const mapParams = computed(() => config.value.mapParams);
  const mimes = computed(() => config.value.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>);
  const portals = computed(() => config.value.drawerParams.portalSection.portals);
  const log = props.log
  const bubble = computed(() => getBubblePropsFromLog(log));
  const other = config.value.mapParams.popupText.publication_title && log.publication_title ? [log.publication_title] : [];


  function getBubblePropsFromLog (log: Log) {
    const colorBy = mapParams.value.colorBy;
    const onlyPortal = initialConfig.drawerParams.portalSection.portals.length === 1;
    switch(colorBy) {
      case 'mime':
        const defaultDefaultMimeColor = '#7F8C8D';
        if (!log.mime || !Object.keys(mimes.value).includes(log.mime.toUpperCase())) {
          const color = mapParams.value.attributesColors.defaultMimeColor || defaultDefaultMimeColor;
          return (color.toLowerCase() === 'multicolor' || color.toLowerCase() === 'rgb') ? { type: BubbleType.Multicolor } as BubbleProps : { type: BubbleType.Regular, color } as BubbleProps;
        }
        const color = (mimes.value[log.mime.toUpperCase()] as { color: string }).color;
        return { type: BubbleType.Regular, color } as BubbleProps;
      case 'portal':
      default:
        const userPortalConfig = config.value.drawerParams.portalSection.portals;
        const allPortals = initialConfig.drawerParams.portalSection.portals;

        const shownPortals = Object.fromEntries(userPortalConfig.map(p => [p.name, true]))

        if (onlyPortal) {
          const color = portals.value[0].color;
          return { type: BubbleType.Regular, color } as BubbleProps;
        }
        const colors: string[] = [];
        log.ezproxyName.split('+').forEach((portal: string) => {
          if (allPortals.filter(p => p.name.toUpperCase() === portal.toUpperCase()).length > 0) {
            colors.push(allPortals.filter(p => p.name.toUpperCase() === portal.toUpperCase())[0].color);
          }
        })

        if (!colors || colors.length === 0) {
          const color = config.value.drawerParams.portalSection.defaultPortalColor || 'random';
          return { type: BubbleType.Regular, color } as BubbleProps;
        }

        if (colors.length > 1) {
          return { type: BubbleType.Gradient, colors } as BubbleProps;
        }

        if (colors.length === 1) {
          const color = colors[0];
          if (!shownPortals[log.ezproxyName]) {
            return { type: BubbleType.Filtered, color } as BubbleProps;
          }
          return { type: BubbleType.Regular, color } as BubbleProps;
        }
        return { type: BubbleType.Gradient, colors } as BubbleProps;
    }
  }
</script>
<style scoped lang="scss" scopped>

.event-bubble {
  position: relative;
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble-core {
  z-index: 0;
}

.bubble-info {
  position: absolute;
  bottom: 100%;
  transform: translateY(-8px);
  z-index: 1;
}
</style>
