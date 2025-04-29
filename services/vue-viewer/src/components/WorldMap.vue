<template>
  <div id="map"></div>
</template>

<script lang="ts" setup>
  import L from 'leaflet';
  import { onMounted } from 'vue';
  import config from '@/assets/config.json';

  const props = config.mapParams;

  let map: L.Map;

  onMounted(() => {

    if (!props || props.include === false) return;

    if((props.defaultZoom || 6) > (props.maxZoom || 9)){
      console.error('Default zoom cannot be higher than max zoom')
      props.defaultZoom = 6;
      props.maxZoom = 9;
    }

    if((props.defaultZoom || 6) < (props.minZoom || 3)){
      console.error('Default zoom cannot be lower than max zoom')
      props.defaultZoom = 6;
      props.minZoom = 3;
    }

    map = L.map('map', {
      minZoom: 3,
      maxZoom: 9,
      zoomControl: false,
    }).setView([props.defaultX || 46.603354, props.defaultY || 1.888334], props.defaultZoom || 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({
      position: 'topright',
    }).addTo(map);
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
</style>
