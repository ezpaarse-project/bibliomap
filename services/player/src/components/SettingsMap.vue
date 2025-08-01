<template>
  <v-card class="minimap-container" flat>
    <div id="settingsmap" />
  </v-card>
</template>
<script setup lang="ts">
  import L from 'leaflet';
  import { storeToRefs } from 'pinia';
  import { useBlurStore } from '@/stores/blur';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const lat = 48.65561805;
  const lon = 6.150242312816186;
  const degToKm = 111;

  const { blur } = storeToRefs(useBlurStore());
  const blurInMeters = computed(() => blur.value * degToKm * 1000);
  const { t } = useI18n();

  let map: L.Map;
  const circle = ref<L.Circle | null>(null);

  onMounted(() => {
    map = L.map('settingsmap', {
      minZoom: 2,
      maxZoom: 9,
      zoomControl: false,
    }).setView([lat, lon], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker([lat, lon]).addTo(map);

    circle.value = L.circle([lat, lon], {
      radius: blurInMeters.value,
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
    }).addTo(map);
  });

  watch(blur, newVal => {
    const radius = newVal * degToKm * 1000;

    if (circle.value) {
      circle.value.setRadius(radius);
      circle.value.setPopupContent(t(''));
    }
  });
</script>

<style scoped>
.minimap-container {
  width: 250px;
  height: 250px;
}
#settingsmap {
  width: 100%;
  height: 100%;
}
</style>
