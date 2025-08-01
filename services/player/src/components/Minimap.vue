<template>
  <v-card :class="['minimap-container', { 'exit': bubblesToRemove.length === 0 && hasEntered, 'enter': bubblesToRemove.length > 0}]" :elevation="24">
    <div id="minimap" />
  </v-card>
</template>

<script setup lang="ts">
  import L, { TileLayer } from 'leaflet';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import useMitt from '@/composables/useMitt';
  import { useTimerStore } from '@/stores/timer';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';
  import vuetify from '@/plugins/vuetify';
  import EventBubble from './event-bubble-components/EventBubble.vue';

  const { config } = storeToRefs(useViewerConfigStore());
  const params = config.value.minimapParams;
  const usingPhone = window.innerWidth <= 768;
  const { timer } = storeToRefs(useTimerStore());

  let minimap: L.Map;

  let hasEntered = false;
  const bubblesToRemove: Ref<{ marker : L.Marker, frame: { start: number, fade: number, end: number } }[]> = ref([]);

  onMounted(() => {
    minimap = L.map('minimap', {
      minZoom: params.minZoom || 2,
      maxZoom: params.maxZoom || 4,
      zoomControl: false,
    });

    L.control.zoom({
      position: 'topleft',
    }).addTo(minimap);

    if (!params.include || (usingPhone && params.disableOnPhone)) return;

    const emitter = useMitt();
    emitter.on('minimap', ({ log }: { log: Log }) => {
      if (!timer.value) return;
      hasEntered = true;

      const container = document.createElement('div');

      const app = createApp(EventBubble, {
        log,
      });
      app.use(vuetify);
      app.mount(container);

      const icon = L.divIcon({
        html: container,
        className: 'leaflet-marker',
        iconSize: [40, 40],
      })

      const marker = L.marker(new L.LatLng(log['geoip-latitude'], log['geoip-longitude']), { icon }).addTo(minimap);

      const elt = marker.getElement();
      minimap.setView([log['geoip-latitude'], log['geoip-longitude']], params.defaultZoom || 4);
      if (!elt) {
        minimap.removeLayer(marker);
        return;
      }
      const logTimestamp = new Date(log.datetime).getTime();
      if (config.value) {
        const startTimeStamp = logTimestamp;
        const fadeTimeStamp = logTimestamp + usePlayerMultiplierStore().multiplier * ((config.value.mapParams.bubbleDuration || 5) * 1000);
        const endTimeStamp = logTimestamp + usePlayerMultiplierStore().multiplier * ((config.value.mapParams.bubbleDuration || 5) * 1000) + 3000;
        bubblesToRemove.value.push({ marker, frame: { start: startTimeStamp, fade: fadeTimeStamp, end: endTimeStamp } })
      }
    });

    function removeExpiredBubbles (timestamp: number) {

      bubblesToRemove.value.forEach((bubble, index) => {
        if (timestamp > bubble.frame.fade) {
          const elt = bubble.marker.getElement();
          if (elt) elt.style.opacity = '0';
        }
        else {
          const elt = bubble.marker.getElement();
          if (elt) elt.style.opacity = '100';
        }
        if (timestamp > bubble.frame.end || timestamp < bubble.frame.start) {
          minimap.removeLayer(bubble.marker);
          if (minimap.hasLayer(bubble.marker)) return;
          bubblesToRemove.value.splice(index, 1);
        }
      });
    }

    watch(timer, () => {
      if (timer.value && bubblesToRemove.value.length) removeExpiredBubbles(timer.value);
    })

    const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(minimap);

    const humanitarianLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const openTopoMapLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const cyclosmLayer = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const layers: { [key: string]: TileLayer } = {
      'Default': defaultLayer,
      'Humanitarian OSM': humanitarianLayer,
      'OpenTopoMap': openTopoMapLayer,
      'CyclOSM': cyclosmLayer,
    };

    let currentLayer = defaultLayer;

    function changeMapLayer (newLayer: TileLayer) {
      if (currentLayer) {
        minimap.removeLayer(currentLayer);
      }
      newLayer.addTo(minimap);
      currentLayer = newLayer;
    }

    emitter.on('changeMapType', (layerName: string) => {
      changeMapLayer(layers[layerName] as TileLayer);
    });
  })
</script>

<style lang="scss" scoped>
    .minimap-container{
      display: block;
      width: 250px;
      height: 250px;
      z-index: 4;
      padding: 0%;
      margin: 0%;
      visibility: hidden;
      z-index: 1000;
    }

    #minimap{
      width: 100%;
      height: 100%;
      position: relative;
    }

    .minimap-container.enter{
      visibility: visible;
      animation: bounceInDown 1s forwards;
    }

    .minimap-container.exit{
      visibility: visible;
      animation: bounceOutRight 1s forwards;
    }

    @keyframes bounceInDown {
  from,
  60%,
  75%,
  90%,
  to {

    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  0% {
    opacity: 0;
    transform: translate3d(0, -3000px, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(0, 25px, 0);
  }
  75% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, 5px, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

  @keyframes bounceOutRight {
  20% {
    opacity: 1;
    transform: translate3d(-20px, 0, 0);
  }
  to {
    opacity: 0;
    transform: translate3d(2000px, 0, 0);
  }
}

@media screen and (max-width: 768px) {
  .minimap-container{
    width: 200px;
    height: 200px;
  }
}

</style>
