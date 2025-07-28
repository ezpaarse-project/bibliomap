<template>
  <div id="map" />
</template>

<script lang="ts" setup>
  import L, { TileLayer } from 'leaflet';
  import { onMounted } from 'vue';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useSocketStore } from '@/stores/socket';
  import vuetify from '@/plugins/vuetify';
  import EventBubble from './event-bubble-components/EventBubble.vue';

  const emitter = useMitt();
  const io = useSocketStore().socket;

  const { config } = storeToRefs(useViewerConfigStore());
  const mapParams = ref(config.value.mapParams);
  const mimes = ref(config.value.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>);
  const portals = ref(config.value.drawerParams.portalSection.portals);
  const size = ref(config.value.mapParams.bubbleSize) || 60;

  watch(config, () => {
    mapParams.value = config.value.mapParams;
    mimes.value = config.value.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>;
    size.value = config.value.mapParams.bubbleSize || 60;
    portals.value = config.value.drawerParams.portalSection.portals;
  });

  let map: L.Map;

  onMounted(() => {

    if (!mapParams.value || mapParams.value.include === false) return;

    let defaultZoom = window.innerWidth <= 768 ? mapParams.value.defaultPhoneZoom : mapParams.value.defaultZoom;

    if((defaultZoom || 6) > (mapParams.value.maxZoom || 9)){
      console.error('Default zoom cannot be higher than max zoom')
      defaultZoom = 6;
      mapParams.value.maxZoom = 9;
    }

    if((defaultZoom || 6) < (mapParams.value.minZoom || 3)){
      console.error('Default zoom cannot be lower than max zoom')
      defaultZoom = 6;
      mapParams.value.minZoom = 3;
    }

    map = L.map('map', {
      minZoom: mapParams.value.minZoom || 3,
      maxZoom: mapParams.value.maxZoom || 9,
      zoomControl: false,
    }).setView([mapParams.value.defaultX || 46.603354, mapParams.value.defaultY || 1.888334], defaultZoom || 6);

    L.control.zoom({
      position: 'topright',
    }).addTo(map);

    const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

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
        map.removeLayer(currentLayer);
      }
      newLayer.addTo(map);
      currentLayer = newLayer;
    }

    emitter.on('centerMap', () => {
      map.setView([mapParams.value.defaultX || 46.603354, mapParams.value.defaultY || 1.888334], defaultZoom || 6);
    });

    emitter.on('changeMapType', (layerName: string) => {
      changeMapLayer(layers[layerName] as TileLayer);
    });

    io.on('log', (log: Log) => {
      showEvent(log, map);

      if (!map.getBounds().contains(L.latLng(log['geoip-latitude'], log['geoip-longitude']))) {
        emitter.emit('minimap', { log, showEvent });
      }
    });
  });

  function showEvent (log: Log, map: L.Map) {
    if (usePlatformFilterStore().getFilter() && log.platform_name && !((usePlatformFilterStore().getFilter().toUpperCase().includes(log.platform_name.toUpperCase()) || log.platform_name.toUpperCase().includes(usePlatformFilterStore().getFilter().toUpperCase())))) return;
    if (!log || !log['geoip-latitude'] || !log['geoip-longitude']) return;

    const container = document.createElement('div');

    const app = createApp(EventBubble, {
      log,
    });
    app.use(vuetify);
    app.mount(container);

    const icon = L.divIcon({
      html: container,
      className: '',
      iconSize: [40, 40],
    })

    const marker = L.marker(new L.LatLng(log['geoip-latitude'], log['geoip-longitude']), { icon }).addTo(map);

    const elt = marker.getElement();
    if (!elt) return;
    elt.classList.add('opacity-transition');

    setTimeout(() => {
      elt.style.opacity = '0';
      setTimeout(() => {
        map.removeLayer(marker);
      }, 2000);
    }, (mapParams.value.bubbleDuration || 5) * 1000)
  }
</script>

<style lang="scss">

  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  :root {
    --opacity-transition-speed: 1.5s;
    --pulsate-speed: 1s;
  }

  #map{
    width: 100%;
    height: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .opacity-transition{
    transition: opacity var(--opacity-transition-speed) ease-in;
  }

  .leaflet-marker {
    transition: opacity var(--opacity-transition-speed) ease-in;
  }

  .bubble {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .bubble-circle {
    border-radius: 100%;
    box-shadow: $box-shadow;
    position: absolute;
  }

  .bubble-pulse {
    animation: pulsate var(--pulsate-speed) ease-in-out infinite;
    position: absolute;
    border-radius: 100%;
  }

  .bubble-popup {
    background-color: rgba(255, 255, 255, 0.75);
    position: absolute;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    z-index: 2;
    bottom: 100%;
    padding: .2em 1em;
    box-shadow: $box-shadow;
    min-width: 100px;
    max-width: 300px;
    white-space: normal;

    p {
      color: black;
      margin: 0;
    }

    .types-container {
      display: flex;
      justify-content: center;
      gap: .5em;
      font-size: 10px;

      p{
        margin: 3px;
        padding: 5px 8px;
        font-size: 1.2em;
        border-radius: 3px;
        color: #fff;
        box-sizing: border-box;
      }
    }
  }

  .multicolor {
    animation: multicolor-animation 7s ease-in-out infinite;
  }

  .popup-title {
    font-size: 14px;
  }

  @keyframes multicolor-animation {
    0% {
      background-color: hsl(0, 100%, 50%);
    }
    25% {
      background-color: hsl(90, 100%, 50%);
    }
    50% {
      background-color: hsl(180, 100%, 50%);
    }
    75% {
      background-color: hsl(270, 100%, 50%);
    }
    100% {
      background-color: hsl(360, 100%, 50%);
    }
  }

  @keyframes pulsate {

    $ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";

    0% {
      transform: scale(0.1, 0.1);
      -ms-filter: $ms-filter;
      filter: alpha(opacity=0);
    }
    25% {
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    75% {
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    100% {
      transform: scale(1.2, 1.2);
      -ms-filter: $ms-filter;
      opacity: 0;
    }
  }

</style>
