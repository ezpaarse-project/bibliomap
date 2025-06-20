<template>
  <div id="map" :style="{height: height}" />
</template>

<script lang="ts" setup>
  import L, { TileLayer } from 'leaflet';
  import { onMounted } from 'vue';
  import { useViewerConfigStore } from '@/stores/viewer-config';
  import type { Log } from '@/main';
  import { usePlatformFilterStore } from '@/stores/platform-filter';
  import useMitt from '@/composables/useMitt';
  import { useBubblesStore } from '@/stores/bubbles';
  import { usePortalsStore } from '@/stores/portals.ts';

  const emitter = useMitt();

  const config = useViewerConfigStore().config;
  const portalsStore = usePortalsStore();
  const mapParams = config.mapParams;
  const mimes = config.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>;

  const height = config.appbarParams.include ? 'calc(100vh - 48px)' : '100vh';
  useBubblesStore();

  let map: L.Map;

  const size = mapParams.bubbleSize || 60;

  onMounted(() => {

    if (!mapParams || mapParams.include === false) return;

    let defaultZoom = window.innerWidth <= 768 ? mapParams.defaultPhoneZoom : mapParams.defaultZoom;

    if((defaultZoom || 6) > (mapParams.maxZoom || 9)){
      console.error('Default zoom cannot be higher than max zoom')
      defaultZoom = 6;
      mapParams.maxZoom = 9;
    }

    if((defaultZoom || 6) < (mapParams.minZoom || 3)){
      console.error('Default zoom cannot be lower than max zoom')
      defaultZoom = 6;
      mapParams.minZoom = 3;
    }

    map = L.map('map', {
      minZoom: mapParams.minZoom || 3,
      maxZoom: mapParams.maxZoom || 9,
      zoomControl: false,
    }).setView([mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334], defaultZoom || 6);

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
      map.setView([mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334], defaultZoom || 6);
    });

    emitter.on('changeMapType', (layerName: string) => {
      changeMapLayer(layers[layerName] as TileLayer);
    });

    function getBubbleColor (log: Log) {
      if (!log.ezproxyName.includes('+')) return portalsStore.getPortalColor(log.ezproxyName) || config.mapParams.attributesColors.defaultColor;
      return 'linear-gradient(to right, ' + log.ezproxyName.split('+').map((portal: string) => portalsStore.getPortalColor(portal) || config.mapParams.attributesColors.defaultColor).join(', ') + ')';
    }

    emitter.on('EC', (log: Log) => {
      if (!usePlatformFilterStore().isNameOkay(log.platform_name)) return;
      if (!log || !log['geoip-latitude'] || !log['geoip-longitude']) return;

      let color = getBubbleColor(log);
      const gradient = color.includes('linear-gradient') ? color : undefined;

      if (gradient) color = '';

      const bubbleHtml = getBubbleHtml(gradient, color)

      const bubble = L.divIcon({
        className: 'leaflet-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div class='container'>
            <div class='bubble-popup' ${mapParams.includePopup ? '' : 'style="display: none;"'}>
              <p ${mapParams.popupText.platform_name ? '' : 'style="display: none;"'} class='title-font popup-title'><strong>${log.platform_name}</strong></p>
              <p ${config.mapParams.popupText.publication_title && log.publication_title ? '' : 'style="display: none;"'} class='body-font'>${log.publication_title}</p>
              <div class='types-container'>
                <p style='${mapParams.popupText.rtype && log.rtype ? '' : 'display: none;'} background-color: ${mapParams.attributesColors.rtype || '#7F8C8D'}' class='title-font'>${log.rtype}</p>
                <p style='${mapParams.popupText.mime && log.mime ? '' : 'display: none;'} background-color: ${log.mime && mimes[log.mime as keyof typeof mimes] && mimes[log.mime as keyof typeof mimes].color || '#D35400'}' class='title-font'>${log.mime}</p>
              </div>
            </div>
            ${bubbleHtml}
          </div>
        `,
      });

      const marker = L.marker([log['geoip-latitude'], log['geoip-longitude']], { icon: bubble }).addTo(map);
      const elt = marker.getElement();
      if (!elt) return;

      setTimeout(() => {
        elt.style.opacity = '0';
        setTimeout(() => {
          map.removeLayer(marker);
        }, 2000);
      }, (mapParams.bubbleDuration || 5) * 1000)

      if (!map.getBounds().contains(L.latLng(log['geoip-latitude'], log['geoip-longitude']))) {
        emitter.emit('minimap', { log, bubble });
      }
    });
  });

  function getBubbleHtml (gradient: string | undefined, color: string) {
    let classes = '';
    let backgroundColor = '';
    switch (color) {
      case 'random': {
        backgroundColor = getRandomHexColor();
        break;
      }
      case 'rgb':
      case'multicolor': {
        classes += 'multicolor';
        break;
      }
      default: backgroundColor = color;
    }
    return `<div class='bubble'>
              <div style='background: ${gradient || backgroundColor || 'transparent'}; width: ${size}px; height: ${size}px' class='bubble-circle ${classes}'></div>
              <div style='box-shadow: 1px 1px 8px 0 ${backgroundColor || 'black'}; width: ${size*2}px; height: ${size*2}px' class='bubble-pulse'></div>
            </div>`
  }

  function getRandomHexColor () {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
  }
</script>

<style lang="scss">

  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  #map{
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .leaflet-marker {
    transition: opacity 1.5s ease-in;
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
    animation: pulsate 1s ease-in-out infinite;
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
