<template>
  <div id="map" />
</template>

<script lang="ts" setup>
  import L, { TileLayer } from 'leaflet';
  import { onMounted } from 'vue';
  import config from '@/assets/config.json';
  import type { Log } from '@/pages/index.vue';
  import { useSocketStore } from '@/stores/socket'
  import { useMittStore } from '@/stores/mitt';

  const socketStore = useSocketStore();
  const io = socketStore.getSocket();
  const emitter = useMittStore().emitter;

  const mapParams = config.mapParams;
  const portals = config.portals;
  const mimes = config.mimes;

  let map: L.Map;

  const size = mapParams.bubbleSize || 60;

  onMounted(() => {

    if (!mapParams || mapParams.include === false) return;

    if((mapParams.defaultZoom || 6) > (mapParams.maxZoom || 9)){
      console.error('Default zoom cannot be higher than max zoom')
      mapParams.defaultZoom = 6;
      mapParams.maxZoom = 9;
    }

    if((mapParams.defaultZoom || 6) < (mapParams.minZoom || 3)){
      console.error('Default zoom cannot be lower than max zoom')
      mapParams.defaultZoom = 6;
      mapParams.minZoom = 3;
    }

    map = L.map('map', {
      minZoom: mapParams.minZoom || 3,
      maxZoom: mapParams.maxZoom || 9,
      zoomControl: false,
    }).setView([mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334], mapParams.defaultZoom || 6);

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
      map.setView([mapParams.defaultX || 46.603354, mapParams.defaultY || 1.888334], mapParams.defaultZoom || 6);
    });

    emitter.on('changeMapType', (layerName: string) => {
      changeMapLayer(layers[layerName] as TileLayer);
    });

    io?.on('log', (log: Log) => {
      let color;
      try {
        const portalParams = portals as { [key: string]: { color: string } };
        color = portalParams[log.ezproxyName].color;
      }
      catch {
        return;
      }

      const bubble = L.divIcon({
        className: 'leaflet-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div class='container'>
            <div class='bubble-popup' ${mapParams.includePopup ? '' : 'style="display: none;"'}>
              <p ${mapParams.popupText.platform_name ? '' : 'style="display: none;"'}><strong>${log.platform_name}</strong></p>
              <p ${mapParams.popupText.publication_title && log.publication_title ? '' : 'style="display: none;"'}>${log.publication_title}</p>
              <div class='types-container'>
                <p style='${mapParams.popupText.rtype && log.rtype ? '' : 'display: none;'} background-color: ${mapParams.attributesColors.rtype || '#7F8C8D'}'>${log.rtype}</p>
                <p style='${mapParams.popupText.mime && log.mime ? '' : 'display: none;'} background-color: ${log.mime && mimes[log.mime].color || '#D35400'}'>${log.mime}</p>
              </div>
            </div>
            <div class='bubble'>
              <div style='background-color: ${color}; width: ${size}px; height: ${size}px' class='bubble-circle'></div>
              <div style='box-shadow: 1px 1px 8px 0 ${color}; width: ${size*2}px; height: ${size*2}px' class='bubble-pulse'></div>
            </div>
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
  })
</script>

<style lang="scss">

  $box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);

  #map{
    width: 100%;
    height: calc(100% - 48px);
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
    position: absoute;
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
    border-radius: 8px;
    z-index: 2;
    bottom: 100%;
    padding: .5em 2.5em;
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
