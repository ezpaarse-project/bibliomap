<template>
  <v-card :class="['minimap-container', { 'exit': currentLogs.length === 0 && hasEntered, 'enter': currentLogs.length > 0}]" :elevation="24">
    <div id="minimap" />
  </v-card>
</template>

<script setup lang="ts">
  import L, { TileLayer } from 'leaflet';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import useMitt from '@/composables/useMitt';

  const config = useViewerConfigStore().config;
  const params = config.minimapParams;
  const currentLogs = ref(<Log[]>[]);
  const usingPhone = window.innerWidth <= 768;

  let minimap: L.Map;

  let hasEntered = false;

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
    emitter.on('minimap', ({ log, showEvent }: { log: Log, showEvent: (log: Log, map: L.Map) => void }) => {
      currentLogs.value.push(log);
      minimap.setView([log['geoip-latitude'], log['geoip-longitude']], params.defaultZoom || 4);
      hasEntered = true;
      showEvent(log, minimap);

      setTimeout(() => {
        currentLogs.value.shift();
      }, ((config.mapParams.bubbleDuration || 5) + 2) * 1000);
    });

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
