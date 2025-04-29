<template>
  <div id="map" />
</template>

<script lang="ts" setup>
  import L from 'leaflet';
  import { defineProps, onMounted } from 'vue';
  import config from '@/assets/config.json';
  import type { Socket } from 'socket.io-client';
  import type { Log } from '@/pages/index.vue';

  const props = defineProps<{
    io: Socket
  }>();

  const params = config.mapParams;

  let map: L.Map;

  const size = params.bubbleSize || 60;

  const bubble = L.divIcon({
    className: 'leaflet-pulsing-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div></div>
    `,
  })

  onMounted(() => {

    if (!params || params.include === false) return;

    if((params.defaultZoom || 6) > (params.maxZoom || 9)){
      console.error('Default zoom cannot be higher than max zoom')
      params.defaultZoom = 6;
      params.maxZoom = 9;
    }

    if((params.defaultZoom || 6) < (params.minZoom || 3)){
      console.error('Default zoom cannot be lower than max zoom')
      params.defaultZoom = 6;
      params.minZoom = 3;
    }

    map = L.map('map', {
      minZoom: params.minZoom || 3,
      maxZoom: params.maxZoom || 9,
      zoomControl: false,
    }).setView([params.defaultX || 46.603354, params.defaultY || 1.888334], params.defaultZoom || 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({
      position: 'topright',
    }).addTo(map);

    props.io.on('log', (log: Log) => {
      let color;
      try {
        const portalParams = params.portals as { [key: string]: { color: string } };
        color = portalParams[log.ezproxyName].color;
      }
      catch {
        return;
      }

      const marker = L.marker([log['geoip-latitude'], log['geoip-longitude']], { icon: bubble }).addTo(map);
      const elt = marker.getElement();
      if (!elt) return;

      elt.style.backgroundColor = color;
      setTimeout(() => {
        elt.style.opacity = '0';
        setTimeout(() => {
          map.removeLayer(marker);
        }, 2000);
      }, (params.bubbleDuration || 5) * 1000)
    })
  })
</script>

<style>
  #map{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
  }

  .leaflet-pulsing-icon {
    border-radius: 100%;
    box-shadow: 1px 1px 8px 0 rgba(0, 0, 0, 0.75);
    transition: opacity 1.5s ease-in-out;
  }

  .leaflet-pulsing-icon:after {
    content: "";
    border-radius: 100%;
    height: 200%;
    width: 200%;
    position: absolute;
    margin: -50% 0 0 -50%;
    opacity: 0;
  }

  @keyframes pulsate {
    0% {
      transform: scale(0.1, 0.1);
      -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
      filter: alpha(opacity=0);
    }
    50% {
      opacity: 1;
      -ms-filter: none;
      filter: none;
    }
    100% {
      transform: scale(1.2, 1.2);
      -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
      filter: alpha(opacity=0);
    }
  }

</style>
