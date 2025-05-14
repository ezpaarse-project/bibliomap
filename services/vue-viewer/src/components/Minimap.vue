<template>
  <div :class="['minimap-container', { 'exit': currentLogs.length === 0 && hasEntered, 'enter': currentLogs.length > 0}]">
    <div id="minimap" />
  </div>
</template>

<script setup lang="ts">
  import L, { TileLayer } from 'leaflet';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import useMitt from '@/composables/useMitt';

  const config = useViewerConfigStore().config;
  const mapParams = config.mapParams;
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
    emitter.on('minimap', ({ log, bubble }: { log: Log; bubble: L.DivIcon }) => {
      hasEntered = true;

      const marker = L.marker([log['geoip-latitude'], log['geoip-longitude']], { icon: bubble }).addTo(minimap);

      const elt = marker.getElement();
      minimap.setView([log['geoip-latitude'], log['geoip-longitude']], params.defaultZoom || 4);
      if (!elt) {
        minimap.removeLayer(marker);
        return;
      }
      currentLogs.value.push(log);
      setTimeout(() => {
        elt.style.opacity = '0';
        setTimeout(() => {
          minimap.removeLayer(marker);
          currentLogs.value.shift();
        }, 2000);
      }, (mapParams.bubbleDuration || 5) * 1000);
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
      position: fixed;
      top: 20px + 48px;
      right: 45px;
      width: 250px;
      height: 250px;
      z-index: 4;
      padding: 0%;
      margin: 0%;
      border: 3px inset #2c3e50;
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
