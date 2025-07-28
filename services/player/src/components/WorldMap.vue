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
  import { useBubbleStore } from '@/stores/bubble';
  import { useTimerStore } from '@/stores/timer';
  import { type Field, useSortFieldStore } from '@/stores/sort-field';
  import { usePlayerMultiplierStore } from '@/stores/player-multiplier';

  const emitter = useMitt();

  const { config } = storeToRefs(useViewerConfigStore());
  const mapParams = config.value.mapParams;
  const mimes = config.value.mapParams.attributesColors.mimes as Record<string, { count: boolean, color: string }>;
  const { fieldIdentifier } = storeToRefs(useSortFieldStore());
  const fieldStore = useSortFieldStore();
  const { multiplier } = storeToRefs(usePlayerMultiplierStore());

  useBubbleStore();

  let map: L.Map;

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
      const value = log[fieldIdentifier.value];

      if (typeof value !== 'string') return 'transparent';

      if (!value.includes('+')) {
        return fieldStore.getFieldColor(value) || config.value.mapParams.attributesColors.defaultColor;
      }

      const gradient = value
        .split('+')
        .map((field: string) => fieldStore.getFieldColor(field) || config.value.mapParams.attributesColors.defaultColor)
        .join(', ');

      return `linear-gradient(to right, ${gradient})`;
    }

    const bubblesToRemove: { marker : L.Marker, frame: { start: number, fade: number, end: number } }[] = [];

    function removeExpiredBubbles (timestamp: number) {

      bubblesToRemove.forEach((bubble, index) => {
        if (timestamp > bubble.frame.fade) {
          const elt = bubble.marker.getElement();
          if (elt) elt.style.opacity = '0';
        }
        else {
          const elt = bubble.marker.getElement();
          if (elt) elt.style.opacity = '100';
        }
        if (timestamp > bubble.frame.end || timestamp < bubble.frame.start) {
          map.removeLayer(bubble.marker);
          if (map.hasLayer(bubble.marker)) return;
          bubblesToRemove.splice(index, 1);
        }
      });
    }

    const { timer } = storeToRefs(useTimerStore());

    watch(timer, () => {
      if (timer.value) removeExpiredBubbles(timer.value);
    });

    function fieldInConfig (field: string) {
      if (field.includes('+')) {
        return field.split('+').reduce((a: boolean, b: string) => a || config.value.drawerParams.portalSection.portals.map((p: Field) => p.name.toUpperCase()).includes(b.toUpperCase()), false);
      }
      return config.value.drawerParams.portalSection.portals.map((p: Field) => p.name.toUpperCase()).includes(field.toUpperCase());
    }

    function showBubble (log: Log) {
      if (log.platform_name && !usePlatformFilterStore().isNameOkay(log.platform_name)) return;
      if (!log || !log['geoip-latitude'] || !log['geoip-longitude']) return;
      if (!log[fieldIdentifier.value] || !fieldInConfig(log[fieldIdentifier.value] + '')) return;

      let color = getBubbleColor(log);
      const gradient = color.includes('linear-gradient') ? color : undefined;

      if (gradient) color = '';

      const bubbleHtml = getBubbleHtml(gradient, color)

      const size = config.value.mapParams.bubbleSize;

      const bubble = L.divIcon({
        className: 'leaflet-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div class='container' style="transform: scale(${config.value.mapParams.bubbleSize / 30})">
            <div class='bubble-popup' ${mapParams.includePopup ? '' : 'style="display: none;"'}>
              <p ${mapParams.popupText.platform_name ? '' : 'style="display: none;"'} class='title-font popup-title'><strong>${log.platform_name}</strong></p>
              <p ${config.value.mapParams.popupText.publication_title && log.publication_title ? '' : 'style="display: none;"'} class='body-font'>${log.publication_title}</p>
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
      const timestamp = new Date(log.datetime).getTime();
      const startTimestamp = timestamp;
      const fadeTimestamp = timestamp + multiplier.value * ((config.value.mapParams.bubbleDuration || 5) * 1000);
      const endTimestamp = timestamp + multiplier.value * ((config.value.mapParams.bubbleDuration || 5) * 1000) + 3000;
      bubblesToRemove.push({ marker, frame: { start: startTimestamp, fade: fadeTimestamp, end: endTimestamp } });
      const elt = marker.getElement();
      if (!elt) return;

      if (!map.getBounds().contains(L.latLng(log['geoip-latitude'], log['geoip-longitude']))) {
        emitter.emit('minimap', { log, bubble });
      }
    }

    emitter.on('EC', showBubble);
  });

  function changeAnimationSpeed (multiplier: number) {
    document.documentElement.style.setProperty('--opacity-transition-speed', `${1.5/multiplier}s`);
  }

  watch(multiplier, () => {
    changeAnimationSpeed(multiplier.value);
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
              <div style='background: ${gradient || backgroundColor || 'transparent'}; width: 60px; height: 60px' class='bubble-circle ${classes}'></div>
              <div style='box-shadow: 1px 1px 8px 0 ${backgroundColor || 'black'}; width: 120px; height: 120px' class='bubble-pulse'></div>
            </div>`
  }

  function getRandomHexColor () {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${hex.padStart(6, '0')}`;
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
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
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
