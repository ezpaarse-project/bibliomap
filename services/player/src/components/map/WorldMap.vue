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


// Load all store
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
import { consoleError } from 'vuetify/lib/util/console.mjs'
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
const mapParams = config.value.mapParams
const { fieldIdentifier } = storeToRefs(useSortFieldStore())
const { multiplier } = storeToRefs(usePlayerMultiplierStore())
const { blur } = storeToRefs(useBlurStore())

const { shownMimes } = storeToRefs(useMimeStore());

let map: L.Map

onMounted(() => {

  if (!mapParams || mapParams.include === false) return

  let defaultZoom = window.innerWidth <= 768
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
    'Default': defaultLayer,
    'Humanitarian OSM': humanitarianLayer,
    'OpenTopoMap': openTopoMapLayer,
    'CyclOSM': cyclosmLayer
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


  const bubblesToRemove: {
    marker: L.Marker
    frame: { start: number, fade: number, end: number }
  }[] = []

  // TODO if time is updated by user, delete all bubble
  function removeExpiredBubbles(timestamp: number) {
    for (let i = bubblesToRemove.length - 1; i >= 0; i--) {

      const bubble = bubblesToRemove[i]
      const elt = bubble.marker.getElement()
      if (!elt) {
        map.removeLayer(bubble.marker)
        bubblesToRemove.splice(i, 1)
        continue
      }

      if (timestamp >= bubble.frame.fade) {
        elt.style.opacity = '0'
      } else {
        elt.style.opacity = '1'
      }

      if (timestamp >= bubble.frame.end || timestamp < bubble.frame.start) {
        map.removeLayer(bubble.marker)
        bubblesToRemove.splice(i, 1)
      }
    }
  }

  setInterval(() => {
    removeExpiredBubbles(Date.now())
  }, 100)

  function showBubble(log: Log) {
    // remove non located events
    if (!log['geoip-latitude'] || !log['geoip-longitude']) { return }
    // Filter by platform
    if (log.platform_name && !usePlatformFilterStore().isNameOkay(log.platform_name)) { return }
    // Filter by mime
    if (!shownMimes.value.some(m => m.name === log.mime)) return;
    // Filter by field
    const portalValue = String(log[fieldIdentifier.value] ?? "").toUpperCase();

    const hasMatchingPortal = config.value.drawerParams.portalSection.portals.some(p => p.name === portalValue);

    const hasUNKNOWN = config.value.drawerParams.portalSection.portals.some(p => p.name === "UNKNOWN");

    const isEmptyValue = portalValue === "";

    if (!hasMatchingPortal && !(hasUNKNOWN && isEmptyValue)) {
      return;
    }

    if (!log[fieldIdentifier.value]) log[fieldIdentifier.value] = ''

    if (blur.value) log = blurEventPosition(log)

    const container = document.createElement('div')
    const app = createApp(EventBubble, { log })
    app.use(vuetify)
    app.mount(container)

    const icon = L.divIcon({ html: container, className: '', iconSize: [40, 40] })
    const marker = L.marker(
      [log['geoip-latitude'], log['geoip-longitude']],
      { icon }
    ).addTo(map)

    const elt = marker.getElement()
    if (!elt) return

    elt.classList.add('opacity-transition')

    const now = Date.now()
    const visibleDuration = (config.value.mapParams.bubbleDuration || 5) * 1000

    const fadeTimestamp = now + visibleDuration
    const endTimestamp = fadeTimestamp + 3000

    bubblesToRemove.push({
      marker,
      frame: {
        start: now,
        fade: fadeTimestamp,
        end: endTimestamp
      }
    })

    const lat = Number(log['geoip-latitude'])
    const lng = Number(log['geoip-longitude'])

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    if (!map.getBounds().contains(L.latLng(lat, lng))) {
      if (config.value.minimapParams.include) emitter.emit('minimap', { log })
    }
  }

  emitter.on('EC', showBubble)
})

function blurEventPosition(log: Log) {
  const rLat = 2 * (Math.random() - 0.5)
  const rLon = 2 * (Math.random() - 0.5)

  log['geoip-latitude'] += blur.value * rLat
  log['geoip-longitude'] += blur.value * rLon

  return log
}

function changeAnimationSpeed(mult: number) {
  document.documentElement.style.setProperty('--opacity-transition-speed', `${1.5 / mult}s`)
}

watch(multiplier, () => {
  changeAnimationSpeed(multiplier.value)
})
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
