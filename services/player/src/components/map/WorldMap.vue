<template>
  <div id="map" />
</template>

<script lang="ts" setup>
import L, { TileLayer } from 'leaflet'
import { onMounted, watch, createApp } from 'vue'
import { useConfigStore } from '@/stores/config'
import vuetify from '@/plugins/vuetify'
import EventBubble from '@/components/bubble/EventBubble.vue'
import type { Log } from '@/main'
import useMitt from '@/composables/useMitt'
import { storeToRefs } from 'pinia'

// Stores
import { useBlurStore } from '@/stores/blur'
import { useBubbleStore } from '@/stores/bubble'
import { useCountSectionStore } from '@/stores/count-section'
import { useEcCountStore } from '@/stores/ec-count'
import { useIndexedDBStore } from '@/stores/indexed-db'
import { useLargeFileStore } from '@/stores/large-file'
import { useMimeStore } from '@/stores/mime'
import { usePlatformFilterStore } from '@/stores/platform-filter'
import { usePlayStateStore } from '@/stores/play-state'
import { usePlayTimeframeStore } from '@/stores/play-timeframe'
import { usePlayerFileStore } from '@/stores/player-file'
import { usePlayerMultiplierStore } from '@/stores/player-multiplier'
import { useSortFieldStore } from '@/stores/sort-field'
import { useTimerStore } from '@/stores/timer'

// init stores
useBlurStore()
useBubbleStore()
useCountSectionStore()
useEcCountStore()
useIndexedDBStore()
useLargeFileStore()
useMimeStore()
usePlatformFilterStore()
usePlayStateStore()
usePlayTimeframeStore()
usePlayerFileStore()
usePlayerMultiplierStore()
useSortFieldStore()
useTimerStore()

const emitter = useMitt()

const { config } = storeToRefs(useConfigStore())
const { fieldIdentifier } = storeToRefs(useSortFieldStore())
const { blur } = storeToRefs(useBlurStore())
const { shownMimes } = storeToRefs(useMimeStore())
const { filter } = storeToRefs(usePlatformFilterStore())

let map: L.Map

onMounted(() => {
  const mapParams = config.value.mapParams
  if (!mapParams || mapParams.include === false) return

  const defaultZoom = window.innerWidth <= 768
    ? mapParams.defaultPhoneZoom
    : mapParams.defaultZoom

  map = L.map('map', {
    minZoom: mapParams.minZoom || 3,
    maxZoom: mapParams.maxZoom || 9,
    zoomControl: false
  }).setView(
    [mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334],
    defaultZoom || 6
  )

  L.control.zoom({ position: 'topright' }).addTo(map)

  const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
  const humanitarianLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png')
  const openTopoMapLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png')
  const cyclosmLayer = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png')

  const layers: Record<string, TileLayer> = {
    Default: defaultLayer,
    'Humanitarian OSM': humanitarianLayer,
    OpenTopoMap: openTopoMapLayer,
    CyclOSM: cyclosmLayer
  }

  let currentLayer = defaultLayer

  emitter.on('changeMapType', (layerName: string) => {
    if (currentLayer) map.removeLayer(currentLayer)
    layers[layerName]?.addTo(map)
    currentLayer = layers[layerName]
  })

  emitter.on('centerMap', () => {
    map.setView(
      [mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334],
      defaultZoom || 6
    )
  })

  emitter.on('EC', showBubble)
})

function showBubble(log: Log) {
  if (!log['geoip-latitude'] || !log['geoip-longitude']) return
  if (filter.value.length > 0 && log.platform_name && !filter.value.includes(log.platform_name.toUpperCase())) return;
  if (!shownMimes.value.some(m => m.name === log.mime)) return

  const portalValue = String(log[fieldIdentifier.value] ?? "").toUpperCase()
  const portals = config.value.drawerParams.portalSection.portals

  const hasMatchingPortal = portals.some(p => p.name === portalValue)
  const hasUNKNOWN = portals.some(p => p.name === "UNKNOWN")
  const isEmptyValue = portalValue === ""

  if (!hasMatchingPortal && !(hasUNKNOWN && isEmptyValue)) return

  if (!log[fieldIdentifier.value]) log[fieldIdentifier.value] = ''

  if (blur.value) {
    log = blurEventPosition(log)
  }

  const container = document.createElement('div')
  const app = createApp(EventBubble, { log })
  app.use(vuetify)
  app.mount(container)

  const icon = L.divIcon({ html: container, className: '', iconSize: [40, 40] })
  const marker = L.marker(
    [log['geoip-latitude'], log['geoip-longitude']],
    { icon }
  ).addTo(map)

  let elt = marker.getElement();

  if (!elt) {
    marker.on('add', () => {
      elt = marker.getElement();
    });
  }

  if (!elt) {
    map.removeLayer(marker);
    return;
  }

  const visibleDuration = config.value.mapParams.bubbleDuration * 1000
  const fadeDuration = 1500

  // fade
  setTimeout(() => {
    elt.classList.add('opacity-transition')
    elt.style.opacity = '0'
  }, visibleDuration)

  // remove
  setTimeout(() => {
    if (map.hasLayer(marker)) {
      map.removeLayer(marker)
    }
  }, visibleDuration + fadeDuration)

  // minimap handling
  const lat = Number(log['geoip-latitude'])
  const lng = Number(log['geoip-longitude'])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

  if (!map.getBounds().contains(L.latLng(lat, lng))) {
    if (config.value.minimapParams.include) {
      emitter.emit('minimap', { log })
    }
  }
}

// blur
function blurEventPosition(log: Log) {
  const rLat = 2 * (Math.random() - 0.5)
  const rLon = 2 * (Math.random() - 0.5)

  log['geoip-latitude'] = Number(log['geoip-latitude']) + blur.value * rLat
  log['geoip-longitude'] = Number(log['geoip-longitude']) + blur.value * rLon
  return log
}
</script>

<style lang="scss">
:root {
  --opacity-transition-speed: 1.5s;
}

#map {
  width: 100%;
  height: 100%;
  position: fixed;
}

.opacity-transition {
  transition: opacity var(--opacity-transition-speed) ease-in;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
